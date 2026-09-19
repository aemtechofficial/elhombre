import { Asterisk } from "lucide-react";
import { cx } from "@/lib/utils";

export default function Marquee({
  items,
  dark = false,
  reverse = false,
  duration = 28,
  className,
}: {
  items: string[];
  dark?: boolean;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden border-y py-3.5",
        dark ? "bg-ink text-paper border-paper/15" : "bg-paper text-ink border-ink/10",
        className
      )}
    >
      <div
        className={cx("flex whitespace-nowrap animate-marquee", reverse && "marquee-reverse")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {[0, 1].map((n) => (
          <div key={n} className="flex shrink-0 items-center" aria-hidden={n === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-6 px-6">
                <span className="label-mono">{item}</span>
                <Asterisk size={14} strokeWidth={1.5} className="opacity-50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
