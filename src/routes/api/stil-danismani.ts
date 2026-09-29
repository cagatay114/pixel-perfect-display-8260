import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";
import { products } from "@/lib/data";
import { createLovableAiGateway } from "@/lib/lovable-ai.server";

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
});

const safeError = (status: number, fallback: string) => {
  if (status === 402) return "AI kullanım kredisi tükendi. Lütfen mağaza yetkilisine bildirin.";
  if (status === 429) return "Danışman şu anda yoğun. Biraz sonra tekrar deneyin.";
  if (status === 401) return "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.";
  if (status === 403) return "Stil danışmanına şu anda erişilemiyor.";
  return fallback;
};

export const Route = createFileRoute("/api/stil-danismani")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization") ?? "";
        const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!accessToken) return Response.json({ message: "Devam etmek için giriş yapın." }, { status: 401 });

        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!supabaseUrl || !publishableKey) {
          return Response.json({ message: "Hesap hizmetine şu anda ulaşılamıyor." }, { status: 500 });
        }

        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authData.user) {
          return Response.json({ message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." }, { status: 401 });
        }

        let parsed: z.infer<typeof requestSchema>;
        try {
          parsed = requestSchema.parse(await request.json());
        } catch {
          return Response.json({ message: "Gönderilen mesaj geçerli değil." }, { status: 400 });
        }

        const validProducts = new Map(products.map((product) => [product.id, product]));
        const catalog = products.map(({ id, slug, name, category, subcategory, price, oldPrice, color, sizes }) => ({
          id,
          slug,
          name,
          category,
          subcategory: subcategory ?? null,
          price,
          oldPrice: oldPrice ?? null,
          color,
          availableSizes: sizes.filter((size) => size.stock > 0).map((size) => size.size),
        }));

        try {
          const openai = createLovableAiGateway();
          const result = streamText({
            model: openai.responses("openai/gpt-6-astra"),
            abortSignal: request.signal,
            maxRetries: 2,
            stopWhen: stepCountIs(50),
            system: `Sen RK Collection erkek giyim mağazasının Türkçe stil danışmanısın. Kullanıcının beden, bütçe, renk, kullanım amacı ve tarz tercihlerini anlayıp yalnızca aşağıdaki güncel katalogdan uygun ürünler öner. Katalogda olmayan ürün, beden, stok veya fiyat uydurma. Eksik kritik bilgi varsa kısa bir soru sor. Öneride bulunurken recommendProducts aracını mutlaka çağır; ürün bağlantıları araç kartlarından gösterileceği için metinde URL yazma. Yanıtın kısa, sıcak ve satış baskısından uzak olsun. Fiyatlar TL ve KDV dahildir.\n\nGÜNCEL KATALOG:\n${JSON.stringify(catalog)}`,
            messages: await convertToModelMessages(parsed.messages),
            tools: {
              recommendProducts: tool({
                description: "Katalogdan doğrulanmış RK Collection ürün önerileri gösterir.",
                inputSchema: z.object({
                  productIds: z.array(z.string()),
                  rationale: z.string(),
                }),
                execute: async ({ productIds, rationale }) => ({
                  rationale,
                  productIds: [...new Set(productIds)].filter((id) => validProducts.has(id)).slice(0, 4),
                }),
              }),
            },
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "medium",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });

          const stream = toUIMessageStream({
            stream: result.stream,
            originalMessages: parsed.messages,
            sendReasoning: true,
            onError: (error) => {
              const status = typeof error === "object" && error !== null && "statusCode" in error
                ? Number(error.statusCode)
                : 500;
              return safeError(status, "Stil danışmanı yanıt veremedi. Lütfen tekrar deneyin.");
            },
            onEnd: async ({ messages, outcome }) => {
              if (outcome.status !== "completed") return;
              const { error } = await supabase.from("style_advisor_conversations").upsert({
                user_id: authData.user.id,
                messages: messages as unknown as Json,
              });
              if (error) console.error("Stil danışmanı geçmişi kaydedilemedi", error.message);
            },
          });

          return createUIMessageStreamResponse({
            stream,
            headers: { "X-Content-Type-Options": "nosniff" },
          });
        } catch (error) {
          const status = typeof error === "object" && error !== null && "statusCode" in error
            ? Number(error.statusCode)
            : 500;
          const message = error instanceof Error ? error.message : "Stil danışmanı başlatılamadı.";
          return Response.json({ message: safeError(status, message) }, { status });
        }
      },
    },
  },
});