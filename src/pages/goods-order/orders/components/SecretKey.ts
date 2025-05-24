// 加密相关公共方法
// 用于病患信息的混合加密（AES + RSA）

/**
 * 将 PEM 格式的公钥字符串导入为可用的 CryptoKey
 */
export async function importRsaPublicKey(pemKey: string): Promise<CryptoKey> {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pemKey.substring(pemHeader.length, pemKey.length - pemFooter.length - 1).trim();
    // Base64解码 PEM内容
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
        "spki", // SubjectPublicKeyInfo format
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true, // extractable
        ["encrypt"] // uses
    );
}

/**
 * 使用 AES-CBC 加密数据
 */
export async function encryptAes(data: string, key: CryptoKey): Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(16)); // AES-CBC requires 16-byte IV
    const encodedData = new TextEncoder().encode(data);
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: iv,
        },
        key,
        encodedData
    );
    return { ciphertext, iv };
}

/**
 * 使用 RSA-OAEP 加密 AES 密钥
 */
export async function encryptRsaOaep(data: ArrayBuffer, publicKey: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        data
    );
}

/**
 * 主加密函数：生成AES密钥，加密数据，加密AES密钥
 */
export async function hybridEncrypt(data: any, publicKeyPem: string) {
    const dataString = JSON.stringify(data);
    // 1. 导入RSA公钥
    const rsaPublicKey = await importRsaPublicKey(publicKeyPem);
    // 2. 生成AES密钥
    const aesKey = await crypto.subtle.generateKey(
        {
            name: "AES-CBC",
            length: 128, // 128, 192, or 256
        },
        true, // extractable
        ["encrypt", "decrypt"] // uses
    );
    // 3. 导出AES密钥为 ArrayBuffer，以便用RSA加密
    const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
    // 4. 使用AES加密数据
    const { ciphertext, iv } = await encryptAes(dataString, aesKey);
    // 5. 使用RSA加密AES密钥
    const encryptedAesKey = await encryptRsaOaep(exportedAesKey, rsaPublicKey);
    // 返回 Base64 编码的加密结果和 IV
    return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        encryptedAesKey: btoa(String.fromCharCode(...new Uint8Array(encryptedAesKey))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}
