export interface StreamChatApiOptions {
  apiUrl: string;
  apiHeaders?: Record<string, string>;
  apiParamsTransform?: (params: any) => any;
  signal?: AbortSignal;
}

export async function fetchStreamChat(
  params: any,
  options: StreamChatApiOptions & { signal?: AbortSignal }
) {
  const { apiUrl, apiHeaders, apiParamsTransform, signal } = options;
  const finalParams = apiParamsTransform ? apiParamsTransform(params) : params;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiHeaders || {}),
    },
    body: JSON.stringify(finalParams),
    signal,
  });
  if (!response.ok) throw new Error("网络请求失败");
  return response;
}
