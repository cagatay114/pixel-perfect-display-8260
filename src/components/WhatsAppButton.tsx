import { useStoreSettings } from "@/lib/site-settings";

export function WhatsAppButton() {
  const { whatsappNumber } = useStoreSettings();
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp ile yaz"
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] right-4 z-40 flex h-13 items-center gap-2 rounded-full bg-whatsapp px-3 text-whatsapp-foreground shadow-elevated transition-transform hover:scale-105 md:bottom-8 md:right-6 md:px-4"
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 shrink-0 fill-current">
        <path d="M16 3a12.7 12.7 0 0 0-11 19l-1.5 5.5 5.7-1.5A12.8 12.8 0 1 0 16 3Zm0 23.2c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.4.9.9-3.3-.2-.4A10.5 10.5 0 1 1 16 26.2Zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.8-.9-3-1.7-4.2-3.8-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.6-.5-.9-.5h-.7c-.3 0-.7.1-1 .5-.3.3-1.3 1.3-1.3 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.3 6.8 6 2.5 1.1 3.5 1.2 4.8 1 1.5-.2 3.2-1.3 3.6-2.6.4-1.3.4-2.3.3-2.5-.1-.2-.3-.3-.6-.4Z" />
      </svg>
      <span className="hidden text-xs font-semibold md:inline">Bize yazın</span>
    </a>
  );
}
