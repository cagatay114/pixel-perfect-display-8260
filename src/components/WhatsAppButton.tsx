import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp ile yaz"
      className="fixed bottom-5 right-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-gold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
