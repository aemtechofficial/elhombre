import Reveal, { WordsReveal } from "@/components/reveal";
import { ArrowRight, Globe2, PackageCheck, RotateCcw, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "EL HOMBRE dispatches within 24 hours across Pakistan and worldwide, in tamper-proof packaging. 30-day sealed returns and an authenticity guarantee on every numbered flacon.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  const blocks = [
    {
      icon: Timer,
      title: "DISPATCH · 24 HOURS",
      body: "Order before 6pm PKT and it leaves the studio the same day. Tracking hits your inbox and WhatsApp the moment the courier scans it.",
    },
    {
      icon: Globe2,
      title: "WORLDWIDE, DUTIES PAID",
      body: "We ship door-to-door to 40+ countries. All customs duties and taxes are prepaid by us · the checkout price is the final price. Pakistan: 1–2 days. GCC / UK / EU: 3–5 days. US / CA / AU: 4–7 days.",
    },
    {
      icon: PackageCheck,
      title: "PACKAGING, NO PLASTIC",
      body: "Recycled black mailer, acid-free tissue, batch card signed by the QC lead. Nothing you need to feel guilty about binning.",
    },
    {
      icon: RotateCcw,
      title: "RETURNS · 30 DAYS, FREE",
      body: "Changed your mind? If the wax seal is unbroken, email us within 30 days of delivery. We book the return courier, you hand over the parcel, refund lands within 48h of us receiving it.",
    },
  ];

  return (
    <main className="px-4 sm:px-8 pb-24">
      <section className="pt-14 sm:pt-20 pb-12 border-b border-ink/10">
        <Reveal>
          <p className="label-mono text-ash mb-4">LOGISTICS · THE FINE PRINT</p>
        </Reveal>
        <WordsReveal
          as="h1"
          text="SHIPPING & RETURNS"
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.6rem,9vw,7rem)]"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-lg text-sm text-coal/75 leading-relaxed">
            Boring topic, obsessive execution. Here is exactly how your order
            travels · and how easy it is to send back.
          </p>
        </Reveal>
      </section>

      <div className="grid md:grid-cols-2 gap-px bg-ink/10 border border-ink/10 mt-14">
        {blocks.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.06} className="bg-paper p-8 sm:p-12">
            <b.icon size={26} strokeWidth={1.25} />
            <h2 className="font-display font-black text-xl tracking-tight mt-5">
              {b.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-coal/75">{b.body}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 bg-ink text-paper p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-display font-black text-2xl tracking-tight">
            CAN'T PICK A SCENT?
          </h2>
          <p className="text-sm text-paper/65 mt-2 max-w-md">
            Tell us what you currently wear and where you wear it · we'll point
            you to your EL HOMBRE within one WhatsApp message. Or start with
            the Discovery Set.
          </p>
        </div>
        <Link href="/contact" className="btn-block btn-light shrink-0">
          Ask us <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
