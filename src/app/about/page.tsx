import Marquee from "@/components/marquee";
import Reveal, { WordsReveal } from "@/components/reveal";
import { getSetting } from "@/lib/settings";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "La Casa · Our Story",
  description:
    "Why EL HOMBRE bottles every scent in black or white · the philosophy, the maceration, and the hand-poured process behind Pakistan's first monochrome perfume house.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    n: "01",
    title: "SCENT OVER EVERYTHING",
    body: "No celebrity faces. No rainbow bottles. No thirty-flanker confusion. EL HOMBRE exists for one thing: juice so good it needs no decoration. Every rupee you pay goes into the liquid, not the marketing.",
  },
  {
    n: "02",
    title: "20% MINIMUM, ALWAYS",
    body: "Designer perfumes average 8–12% concentration. Ours start at 20% and our extraits at 30%. Two sprays in the morning should still be introducing you at dinner. That is not a promise · it is chemistry.",
  },
  {
    n: "03",
    title: "AGES BEFORE IT SELLS",
    body: "Every composition macerates for a minimum of 72 hours · our ouds rest for eight years. Perfume is wine you wear; rushing it is a crime we refuse to commit.",
  },
  {
    n: "04",
    title: "BLACK OR WHITE. FULL STOP.",
    body: "Dark scents in black flacons, radiant scents in white. The shelf stays monochrome, your choice stays simple, and your vanity finally looks like it belongs to a man with taste.",
  },
];

export default async function AboutPage() {
  const general = await getSetting<{ brandName: string; brandSuffix: string }>(
    "general"
  );

  return (
    <main>
      <section className="px-4 sm:px-8 pt-14 sm:pt-20 pb-16">
        <Reveal>
          <p className="label-mono text-ash mb-4">LA CASA · MAISON FONDÉE MMXXIV</p>
        </Reveal>
        <WordsReveal
          as="h1"
          text="CLOTHES ARE SEEN."
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.6rem,9.5vw,8.5rem)]"
        />
        <WordsReveal
          as="h1"
          text="SCENT IS REMEMBERED."
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.6rem,9.5vw,8.5rem)] text-outline"
        />
      </section>

      <Marquee
        items={[
          "20% PARFUM MINIMUM",
          "72-HOUR MACERATION",
          "HAND-POURED",
          "SEALED & NUMBERED",
          "BLACK / WHITE ONLY",
        ]}
      />

      <section className="grid lg:grid-cols-2 border-b border-ink/10">
        <div className="relative min-h-[70vh] overflow-hidden">
          <Image
            src="/images/editorial.jpg"
            alt="EL HOMBRE editorial · a monochrome flacon held against shadow"
            fill
            className="object-cover img-bw"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center px-4 sm:px-10 lg:px-16 py-16 lg:py-0 lg:border-l border-ink/10">
          <Reveal>
            <p className="label-mono text-ash mb-6">THE ORIGIN</p>
            <p className="text-lg sm:text-xl leading-relaxed text-coal/90 font-medium">
              {general.brandName}
              {general.brandSuffix} began with a frustration every man knows:
              hundreds of perfumes on the shelf, and not one that survives a
              Lahore afternoon.
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-coal/75">
              So we built a house the way a tailor builds a suit · measured in
              concentration, cut in small batches, finished by hand. Oils
              sourced from Grasse to Laos, compositions macerated like
              Grand-Cru, poured into flacons of pure black and pure white. No
              logos shouting from your dresser. Just glass, weight and shadow.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-coal/75">
              Every batch is sealed, numbered and dispatched from our Lahore
              atelier within 24 hours · directly to you, with no middleman and
              no grey market between us.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="label-mono text-ash mb-3">WHAT WE BELIEVE</p>
        </Reveal>
        <WordsReveal
          as="h2"
          text="FOUR RULES. NO EXCEPTIONS."
          className="font-display font-black tracking-[-0.04em] text-[clamp(2.2rem,6vw,5rem)] mb-14"
        />
        <div className="grid md:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.06} className="bg-paper p-8 sm:p-12">
              <p className="label-mono text-ash">{p.n}</p>
              <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight mt-4">
                {p.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-coal/75">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper px-4 sm:px-8 py-20 sm:py-28 grid sm:grid-cols-3 gap-10 text-center">
        {[
          { k: "20", u: "%", d: "Minimum parfum concentration in every bottle" },
          { k: "72", u: "HRS", d: "Minimum maceration before a drop is bottled" },
          { k: "12", u: "HRS", d: "Average longevity · two sprays, all day" },
        ].map((s, i) => (
          <Reveal key={s.u} delay={i * 0.08}>
            <p className="font-display font-black text-6xl sm:text-7xl tabular-nums">
              {s.k}
              <span className="text-outline-paper text-4xl align-top">{s.u}</span>
            </p>
            <p className="label-mono text-paper/50 mt-3">{s.d}</p>
          </Reveal>
        ))}
      </section>

      <section className="px-4 sm:px-8 py-20 sm:py-28 text-center">
        <WordsReveal
          as="h2"
          text="FIND THE SCENT THEY REMEMBER YOU BY."
          className="font-display font-black tracking-[-0.04em] text-[clamp(1.9rem,5.5vw,4.2rem)]"
        />
        <Reveal delay={0.2}>
          <Link href="/shop" className="btn-block btn-dark mt-10">
            Shop the collection <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
