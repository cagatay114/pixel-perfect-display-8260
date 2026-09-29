import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGateway() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI yapılandırması eksik.");

  let runId: string | undefined;
  const runFetch: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Lovable-API-Key", apiKey);
    headers.set("X-Lovable-AIG-SDK", "vercel-ai-sdk");
    if (runId) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return response;
  };

  return createOpenAI({
    apiKey,
    baseURL: "https://ai.gateway.lovable.dev/v1",
    fetch: runFetch,
  });
}