import ContactForm from "@/components/contact-form";
import Reveal, { WordsReveal } from "@/components/reveal";
import { getSetting } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · The Studio",
  description:
    "Scent advice, order help, press or wholesale · message the EL HOMBRE atelier. We reply within 24 hours, usually much faster.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const general = await getSetting<{
    email: string;
    phone: string;
    address: string;
  }>("general");

  return (
    <main className="px-4 sm:px-8 pb-24">
      <section className="pt-14 sm:pt-20 pb-12 border-b border-ink/10">
        <Reveal>
          <p className="label-mono text-ash mb-4">TALK TO THE STUDIO</p>
        </Reveal>
        <WordsReveal
          as="h1"
          text="SAY HELLO."
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.8rem,10vw,8rem)]"
        />
      </section>

      <div className="grid lg:grid-cols-[320px_1fr] gap-12 pt-12">
        <aside className="space-y-8">
          {[
            { label: "EMAIL", value: general.email, href: `mailto:${general.email}` },
            {
              label: "WHATSAPP",
              value: general.phone,
              href: `https://wa.me/${general.phone.replace(/[^0-9]/g, "")}`,
            },
            { label: "STUDIO", value: general.address },
          ].map((c) => (
            <Reveal key={c.label}>
              <p className="label-mono text-ash">{c.label}</p>
              {c.href ? (
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="font-display font-bold text-lg tracking-tight link-sweep inline-block mt-1"
                >
                  {c.value}
                </a>
              ) : (
                <p className="font-display font-bold text-lg tracking-tight mt-1">
                  {c.value}
                </p>
              )}
            </Reveal>
          ))}
          <Reveal delay={0.1}>
            <p className="label-mono text-ash leading-loose pt-4 border-t border-ink/10">
              MON · SAT
              <br />
              10:00 · 22:00 PKT
              <br />
              REPLIES WITHIN 24H
            </p>
          </Reveal>
        </aside>

        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
