import Accordion from "@/components/accordion";
import JsonLd from "@/components/json-ld";
import Reveal, { WordsReveal } from "@/components/reveal";
import { FAQS } from "@/lib/faq-data";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ · Longevity, Shipping, Returns",
  description:
    "Everything about EL HOMBRE perfumes: 20% concentration, longevity, EDP vs extrait, 24-hour dispatch, sealed returns, discovery sets and gifting.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main className="px-4 sm:px-8 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <section className="pt-14 sm:pt-20 pb-12 border-b border-ink/10">
        <Reveal>
          <p className="label-mono text-ash mb-4">SUPPORT · KNOWLEDGE BASE</p>
        </Reveal>
        <WordsReveal
          as="h1"
          text="QUESTIONS, ANSWERED."
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.6rem,9vw,7rem)]"
        />
      </section>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10 pt-10">
        <aside className="lg:sticky lg:top-24 self-start">
          <p className="label-mono text-ash leading-loose">
            CAN'T FIND IT?
            <br />
            WHATSAPP THE HOUSE.
            <br />
            WE REPLY FAST.
          </p>
          <Link href="/contact" className="btn-block btn-ghost text-ink mt-6">
            Contact us <ArrowRight size={15} />
          </Link>
        </aside>
        <Reveal delay={0.1}>
          <Accordion
            items={FAQS.map((f) => ({ title: f.q, content: f.a }))}
          />
        </Reveal>
      </div>
    </main>
  );
}
