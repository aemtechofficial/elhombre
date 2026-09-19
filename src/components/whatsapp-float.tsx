import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat({ phone }: { phone: string }) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
      "Hello EL HOMBRE! I have a question about a perfume."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      data-cursor="CHAT"
      className="group fixed bottom-5 right-5 z-[85] flex items-center gap-0 bg-gold text-ink border border-paper/40 shadow-[0_10px_40px_rgba(178,138,46,0.4)] hover:shadow-[0_14px_50px_rgba(178,138,46,0.55)] transition-all duration-500 overflow-hidden"
    >
      <span className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <MessageCircle size={20} strokeWidth={1.5} />
      </span>
      <span className="label-mono max-w-0 group-hover:max-w-[140px] whitespace-nowrap overflow-hidden transition-all duration-500 group-hover:pr-4">
        CHAT WITH US
      </span>
    </a>
  );
}
