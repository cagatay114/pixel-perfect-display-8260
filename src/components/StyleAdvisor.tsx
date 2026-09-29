import { useChat } from "@ai-sdk/react";
import { Link } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, LogIn, RotateCcw, Shirt } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/data";
import { useCatalog } from "@/lib/catalog";

type AdvisorProps = {
  initialMessages: UIMessage[];
  accessToken: string;
  onClear: () => Promise<void>;
};

type RecommendationOutput = { productIds: string[]; rationale: string };

function isRecommendationOutput(value: unknown): value is RecommendationOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate["productIds"]) && candidate["productIds"].every((id) => typeof id === "string") && typeof candidate["rationale"] === "string";
}

function AdvisorChat({ initialMessages, accessToken, onClear }: AdvisorProps) {
  const { products } = useCatalog();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/stil-danismani",
    headers: { Authorization: `Bearer ${accessToken}` },
  }), [accessToken]);
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: "rk-style-advisor",
    messages: initialMessages,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  const clearConversation = useCallback(async () => {
    if (!window.confirm("Stil danışmanı görüşmeniz kalıcı olarak silinsin mi?")) return;
    if (busy) stop();
    await onClear();
    setMessages([]);
    textareaRef.current?.focus();
  }, [busy, onClear, setMessages, stop]);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-5xl flex-col px-4 py-6 md:py-10">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="eyebrow">Size özel seçimler</p>
          <h1 className="mt-1 text-4xl md:text-5xl">RK Stil Danışmanı</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Bedeninizi, bütçenizi, sevdiğiniz renkleri veya aradığınız kombini kendi cümlelerinizle anlatın.
          </p>
        </div>
        {messages.length > 0 && (
          <Button type="button" variant="ghost" size="icon" onClick={clearConversation} aria-label="Görüşmeyi temizle" title="Görüşmeyi temizle">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-0 py-8">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Shirt className="h-10 w-10 text-gold" strokeWidth={1.4} />}
              title="Nasıl bir parça arıyorsunuz?"
              description="Örneğin: 1.500 TL bütçem var, siyah ve rahat bir hafta sonu kombini istiyorum. Bedenim L."
            />
          ) : messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type === "text") return <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>;
                  if (part.type === "reasoning") return part.text ? <p key={`${message.id}-${index}`} className="text-xs italic text-muted-foreground">{part.text}</p> : null;
                  if (part.type === "tool-recommendProducts" && part.state === "output-available" && isRecommendationOutput(part.output)) {
                    const recommended = part.output.productIds
                      .map((id) => products.find((product) => product.id === id))
                      .filter((product) => product !== undefined);
                    return (
                      <div key={`${message.id}-${index}`} className="mt-3 grid gap-3 sm:grid-cols-2">
                        {recommended.map((product) => (
                          <Link key={product.id} to="/urun/$slug" params={{ slug: product.slug }} className="grid grid-cols-[72px_1fr] gap-3 border border-border bg-surface p-3 transition-colors hover:border-gold">
                            <img src={product.images[0]} alt={product.name} className="h-[90px] w-[72px] bg-background object-contain" />
                            <span className="min-w-0 self-center">
                              <span className="block font-display text-lg leading-tight">{product.name}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">{product.color}</span>
                              <span className="mt-2 block text-sm font-semibold text-gold">{formatPrice(product.price)}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Message from="assistant"><MessageContent><Shimmer>Seçenekleri inceliyorum…</Shimmer></MessageContent></Message>
          )}
          {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error.message || "Stil danışmanı yanıt veremedi. Lütfen tekrar deneyin."}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl border-t border-border bg-background pt-4">
        <PromptInput
          onSubmit={({ text }) => {
            const value = text.trim();
            if (!value || busy) return;
            sendMessage({ text: value });
          }}
        >
          <PromptInputTextarea ref={textareaRef} autoFocus placeholder="Beden, bütçe, renk veya kullanım amacınızı yazın…" />
          <PromptInputFooter>
            <PromptInputTools><span className="text-xs text-muted-foreground">Yalnızca mevcut katalogdan önerir</span></PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} aria-label={busy ? "Yanıtı durdur" : "Gönder"} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </section>
  );
}

export function StyleAdvisor() {
  const [state, setState] = useState<{ loading: boolean; token?: string; messages: UIMessage[] }>({ loading: true, messages: [] });

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setState({ loading: false, messages: [] });
      return;
    }
    const { data, error } = await supabase.from("style_advisor_conversations").select("messages").maybeSingle();
    if (error) toast.error("Geçmiş görüşme yüklenemedi.");
    const messages = Array.isArray(data?.messages) ? data.messages as unknown as UIMessage[] : [];
    setState({ loading: false, token, messages });
  }, []);

  useEffect(() => {
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
    return () => listener.subscription.unsubscribe();
  }, [load]);

  if (state.loading) return <div className="grid min-h-[60vh] place-items-center"><Shimmer>Danışman hazırlanıyor…</Shimmer></div>;

  if (!state.token) {
    return (
      <section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center">
        <div>
          <Bot className="mx-auto h-12 w-12 text-gold" strokeWidth={1.35} />
          <p className="eyebrow mt-6">Kişisel ve size özel</p>
          <h1 className="mt-2 text-4xl md:text-5xl">RK Stil Danışmanı</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Önerilerinizi ve görüşmenizi hesabınızda güvenle saklamak için giriş yapın.</p>
          <Button
            className="mt-7"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/stil-danismani" });
              if (result.error) toast.error("Giriş başlatılamadı. Lütfen tekrar deneyin.");
            }}
          >
            <LogIn className="h-4 w-4" /> Google ile giriş yap
          </Button>
        </div>
      </section>
    );
  }

  return <AdvisorChat initialMessages={state.messages} accessToken={state.token} onClear={async () => {
    const { error } = await supabase.from("style_advisor_conversations").delete().eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
    if (error) {
      toast.error("Görüşme silinemedi.");
      throw error;
    }
    toast.success("Görüşme temizlendi.");
  }} />;
}