import { getSetting } from "@/lib/settings";
import NewsletterForm from "@/components/newsletter-form";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default async function Footer() {
  const general = await getSetting<{
    brandName: string;
    brandSuffix: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
  }>("general");
  const footer = await getSetting<{
    newsletterTitle: string;
    newsletterBody: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    copyright: string;
  }>("footer");

  const cols = [
    {
      title: "SHOP",
      links: [
        { label: "All Perfumes", href: "/shop" },
        { label: "Eau de Parfum", href: "/shop?category=Eau%20de%20Parfum" },
        { label: "Extrait de Parfum", href: "/shop?category=Extrait%20de%20Parfum" },
        { label: "Discovery & Travel", href: "/shop?category=Discovery%20%26%20Travel" },
        { label: "Search", href: "/search" },
      ],
    },
    {
      title: "LA CASA",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "FAQ", href: "/faq" },
        { label: "Shipping & Returns", href: "/shipping" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-paper relative overflow-hidden">
      {/* Newsletter band */}
      <div className="border-b border-paper/15 px-4 sm:px-8 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-black tracking-[-0.03em] leading-[0.95]">
            {footer.newsletterTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm text-paper/60 leading-relaxed">
            {footer.newsletterBody}
          </p>
        </div>
        <div className="lg:justify-self-end w-full flex flex-col items-start gap-6">
          <NewsletterForm />
          <div className="flex items-center gap-3">
            {[
              { label: "IG", url: footer.instagram, name: "Instagram" },
              { label: "TT", url: footer.tiktok, name: "TikTok" },
              { label: "YT", url: footer.youtube, name: "YouTube" },
            ].map(
              (s) =>
                s.url && (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="label-mono w-11 h-11 border border-paper/25 flex items-center justify-center hover:bg-paper hover:text-ink transition-colors"
                  >
                    {s.label}
                  </a>
                )
            )}
          </div>
        </div>
      </div>

      {/* Link grid */}
      <div className="px-4 sm:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="label-mono text-paper/50">LA MAISON</p>
          <p className="mt-4 max-w-xs text-sm text-paper/60 leading-relaxed">
            {general.tagline}
          </p>
          <div className="mt-6 space-y-1 text-sm text-paper/60">
            <p>{general.address}</p>
            <a href={`mailto:${general.email}`} className="link-sweep inline-block">
              {general.email}
            </a>
            <br />
            <a
              href={`https://wa.me/${general.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="link-sweep inline-block"
            >
              {general.phone}
            </a>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="label-mono text-paper/50">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-paper/80 hover:text-paper transition-colors"
                  >
                    {l.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Giant wordmark */}
      <div className="px-4 sm:px-8 pb-4 overflow-hidden">
        <p
          aria-hidden
          className="font-display font-black leading-[0.78] tracking-[-0.05em] text-[clamp(5rem,22vw,22rem)] text-outline-paper opacity-30 select-none text-center"
        >
          {general.brandName}
          {general.brandSuffix}
        </p>
      </div>

      <div className="border-t border-paper/15 px-4 sm:px-8 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <p className="label-mono text-paper/40">
          © {new Date().getFullYear()} {footer.copyright}
        </p>
        <p className="label-mono text-paper/40">
          EL HOMBRE · WEAR NOTHING BUT THE SCENT
        </p>
      </div>
    </footer>
  );
}
