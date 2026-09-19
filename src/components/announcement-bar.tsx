import Link from "next/link";
import { getSetting } from "@/lib/settings";

export default async function AnnouncementBar() {
  const a = await getSetting<{
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkHref: string;
  }>("announcement");
  if (!a.enabled || !a.text) return null;

  return (
    <div className="bg-gold text-ink overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee [--marquee-duration:36s] py-2">
        {[0, 1].map((n) => (
          <div key={n} className="flex shrink-0 items-center" aria-hidden={n === 1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="label-mono font-bold px-8 flex items-center gap-8">
                {a.text}
                {a.linkHref && a.linkLabel ? (
                  <Link
                    href={a.linkHref}
                    className="underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
                  >
                    {a.linkLabel}
                  </Link>
                ) : null}
                <span className="inline-block w-1.5 h-1.5 bg-ink rounded-full" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
