// 加密相关公共方法
// 用于病患信息的混合加密（AES + RSA）

/**
 * 将 PEM 格式的公钥字符串导入为 Web Crypto API 可用的 CryptoKey 对象
 * @param {string} pemKey - PEM 格式的 RSA 公钥字符串
 * @returns {Promise<CryptoKey>} - 可用于加密的 RSA 公钥对象
 * @throws {Error} 如果 PEM 格式不正确或导入失败
 * @description
 * 该方法会解析 PEM 格式的公钥字符串，Base64 解码后导入为 Web Crypto API 的 CryptoKey。
 * 仅支持 RSA-OAEP 算法，hash 使用 SHA-256。
 * 注意：仅导入公钥，私钥绝不能出现在前端。
 */
export async function importRsaPublicKey(pemKey: string): Promise<CryptoKey> {
	const pemHeader = "-----BEGIN PUBLIC KEY-----";
	const pemFooter = "-----END PUBLIC KEY-----";
	const pemContents = pemKey
		.substring(pemHeader.length, pemKey.length - pemFooter.length - 1)
		.trim();
	// Base64解码 PEM内容
	const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
	return crypto.subtle.importKey(
		"spki", // SubjectPublicKeyInfo format
		binaryDer,
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		true, // extractable
		["encrypt"], // uses
	);
}

/**
 * 使用 AES-CBC 模式加密数据
 * @param {string} data - 需要加密的明文字符串
 * @param {CryptoKey} key - 用于加密的 AES 密钥
 * @returns {Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }>} - 加密后的密文和随机生成的 IV
 * @throws {Error} 加密失败时抛出
 * @description
 * 该方法会生成一个随机 16 字节 IV，使用 AES-CBC 模式对明文进行加密。
 * 返回密文和 IV，IV 需与密文一同传输给后端。
 */
export async function encryptAes(
	data: string,
	key: CryptoKey,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
	const iv = crypto.getRandomValues(new Uint8Array(16)); // AES-CBC requires 16-byte IV
	const encodedData = new TextEncoder().encode(data);
	const ciphertext = await crypto.subtle.encrypt(
		{
			name: "AES-CBC",
			iv: iv,
		},
		key,
		encodedData,
	);
	return { ciphertext, iv };
}

/**
 * 使用 RSA-OAEP 算法加密 AES 密钥
 * @param {ArrayBuffer} data - 需要加密的 AES 密钥原始字节
 * @param {CryptoKey} publicKey - 用于加密的 RSA 公钥
 * @returns {Promise<ArrayBuffer>} - 加密后的密钥密文
 * @throws {Error} 加密失败时抛出
 * @description
 * 该方法使用 RSA-OAEP 算法对 AES 密钥进行加密，确保密钥安全传输。
 */
export async function encryptRsaOaep(
	data: ArrayBuffer,
	publicKey: CryptoKey,
): Promise<ArrayBuffer> {
	return crypto.subtle.encrypt(
		{
			name: "RSA-OAEP",
		},
		publicKey,
		data,
	);
}

/**
 * 混合加密主函数：生成 AES 密钥，加密数据，再用 RSA 加密 AES 密钥
 * @param {any} data - 需要加密的对象（如病患信息）
 * @param {string} publicKeyPem - PEM 格式的 RSA 公钥字符串
 * @returns {Promise<{ encryptedData: string, encryptedAesKey: string, iv: string }>} - Base64 编码的密文、加密密钥和 IV
 * @throws {Error} 任一步骤失败时抛出
 * @description
 * 1. 生成 AES 密钥（128 位，建议后端支持可升级到 256 位）
 * 2. 用 AES-CBC 加密明文数据，生成密文和 IV
 * 3. 用 RSA-OAEP 加密 AES 密钥，保护密钥安全
 * 4. 所有输出均为 Base64 编码，便于网络传输
 * 安全注意：
 * - 前端加密仅用于提升传输安全，后端仍需校验和加密存储
 * - IV 每次加密都需随机生成，不能复用
 * - 公钥必须通过安全渠道下发，私钥绝不能出现在前端
 * - 建议升级为 AES-GCM 模式以获得更高安全性
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
		["encrypt", "decrypt"], // uses
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
		encryptedAesKey: btoa(
			String.fromCharCode(...new Uint8Array(encryptedAesKey)),
		),
		iv: btoa(String.fromCharCode(...iv)),
	};
}
