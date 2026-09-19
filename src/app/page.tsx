import Accordion from "@/components/accordion";
import BestSellers, { type BestSellerItem } from "@/components/best-sellers";
import Hero from "@/components/hero";
import JsonLd from "@/components/json-ld";
import Marquee from "@/components/marquee";
import Reveal, { WordsReveal } from "@/components/reveal";
import Stars from "@/components/stars";
import { db } from "@/db";
import { products, reviews, type ProductRow } from "@/db/schema";
import { FAQS } from "@/lib/faq-data";
import { ensureSeeded } from "@/lib/seed";
import { getSetting } from "@/lib/settings";
import { formatMoney } from "@/lib/utils";
import { and, asc, avg, count, desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function HomePage() {
  await ensureSeeded();

  const hero = await getSetting<{
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    cta2Label: string;
    cta2Href: string;
    image: string;
    season: string;
  }>("hero");
  const marquee = await getSetting<{ enabled: boolean; items: string }>("marquee");
  const home = await getSetting<{
    dropTitle: string;
    dropKicker: string;
    editorialTitle: string;
    editorialBody: string;
    editorialCta: string;
    indexTitle: string;
    quote: string;
    quoteAuthor: string;
  }>("home");
  const general = await getSetting<{
    brandName: string;
    brandSuffix: string;
    currency: string;
    tagline: string;
  }>("general");

  let all: ProductRow[] = [];
  let bestSellers: BestSellerItem[] = [];
  let discovery: ProductRow | null = null;
  let topReviews: (typeof reviews.$inferSelect)[] = [];
  let globalRating = 4.9;
  try {
    all = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.title));

    const stats = await db
      .select({
        productHandle: reviews.productHandle,
        c: count(),
        a: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.approved, true))
      .groupBy(reviews.productHandle);
    const statMap = new Map(
      stats.map((s) => [
        s.productHandle,
        { count: s.c, avg: s.a ? Number(Number(s.a).toFixed(1)) : 5 },
      ])
    );

    bestSellers = [...all]
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        subtitle: p.subtitle,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents,
        image: p.images[0] ?? "",
        category: p.category,
        rating: statMap.get(p.handle)?.avg ?? 5,
        reviewCount: statMap.get(p.handle)?.count ?? 0,
        stock: p.stock,
        featuredScore: p.featured ? 1 : 0,
      }))
      .sort(
        (a, b) =>
          b.reviewCount - a.reviewCount ||
          b.rating - a.rating ||
          b.featuredScore - a.featuredScore
      )
      .slice(0, 6)
      .map(({ featuredScore: _drop, ...rest }) => rest);

    discovery = all.find((p) => p.handle === "the-discovery-set") ?? null;

    topReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.approved, true), eq(reviews.rating, 5)))
      .orderBy(desc(reviews.createdAt))
      .limit(3);

    const [g] = await db
      .select({ a: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.approved, true));
    if (g?.a) globalRating = Number(Number(g.a).toFixed(1));
  } catch {
    /* DB booting */
  }

  const categories = Array.from(new Set(all.map((p) => p.category)));
  const marqueeItems = marquee.items
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: `${general.brandName}${general.brandSuffix}`,
          url: SITE_URL,
          logo: `${SITE_URL}/icon.svg`,
          sameAs: [],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: `${general.brandName}${general.brandSuffix}`,
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <Hero s={hero} />

      {marquee.enabled && marqueeItems.length > 0 && (
        <Marquee items={marqueeItems} duration={30} className="border-gold/30" />
      )}

      {/* ------------------------------ Best sellers ------------------------------ */}
      {bestSellers.length > 0 && (
        <section className="px-4 sm:px-8 py-20 sm:py-28 border-b border-ink/10">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <Reveal>
                <p className="label-mono text-gold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full pulse-dot" />
                  RANKED BY REAL REVIEWS
                </p>
              </Reveal>
              <WordsReveal
                as="h2"
                text="BEST SELLERS."
                className="font-display font-black tracking-[-0.04em] leading-[0.9] text-[clamp(2.6rem,7vw,6rem)]"
              />
              <Reveal delay={0.1}>
                <p className="mt-4 max-w-md text-sm text-coal/75 leading-relaxed">
                  The bottles that empty first, restock after restock. Rated{" "}
                  {globalRating.toFixed(1)}/5 by the men who wear them.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <Link
                href="/shop"
                className="group label-mono flex items-center gap-2 link-sweep"
              >
                VIEW ALL {String(all.length).padStart(2, "0")} SCENTS
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </Reveal>
          </div>
          <BestSellers items={bestSellers} currency={general.currency} />
        </section>
      )}

      {/* ------------------------------ Editorial ------------------------------ */}
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[60vh] lg:min-h-[92vh] overflow-hidden order-2 lg:order-1">
          <Reveal className="absolute inset-0" delay={0.1}>
            <Image
              src="/images/editorial.jpg"
              alt="EL HOMBRE. A hand presenting a monochrome perfume flacon"
              fill
              className="object-cover img-bw scale-105 hover:scale-100 transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Reveal>
          <p className="absolute bottom-4 right-4 label-mono mix-blend-difference text-paper z-10">
            FIG. 02 · THE SIGNATURE
          </p>
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center px-4 sm:px-10 lg:px-16 py-16 lg:py-24 border-b lg:border-b-0 lg:border-l border-ink/10 relative">
          <div className="absolute inset-0 glow-gold opacity-60 pointer-events-none" />
          <div className="relative">
            <Reveal>
              <p className="label-mono text-gold mb-6">01 · THE HOUSE</p>
            </Reveal>
            <WordsReveal
              as="h2"
              text={home.editorialTitle}
              className="font-display font-black tracking-[-0.035em] leading-[0.92] text-[clamp(2.2rem,4.6vw,4.2rem)]"
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-coal/85">
                {home.editorialBody}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                href="/about"
                className="btn-block btn-ghost text-ink mt-10 w-fit"
              >
                {home.editorialCta} <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------ Value props ------------------------------ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-t border-ink/10 divide-x divide-ink/10">
        {[
          { icon: Truck, title: "24H DISPATCH", body: "Orders leave the atelier within one business day, nationwide." },
          { icon: Package, title: "HAND-POURED", body: "Every flacon filled, sealed and numbered by hand." },
          { icon: RotateCcw, title: "30-DAY RETURNS", body: "Unopened seal? Full refund. We arrange the courier." },
          { icon: ShieldCheck, title: "100% AUTHENTIC", body: "Direct from the maison. Never a grey-market drop." },
        ].map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08} className="px-5 py-10 sm:py-14">
            <f.icon size={22} strokeWidth={1.25} className="text-gold" />
            <p className="label-mono mt-4">{f.title}</p>
            <p className="mt-2 text-[13px] text-coal/70 leading-relaxed">
              {f.body}
            </p>
          </Reveal>
        ))}
      </section>

      {/* ------------------------------ Testimonials ------------------------------ */}
      {topReviews.length > 0 && (
        <section className="bg-ink text-paper px-4 sm:px-8 py-20 sm:py-28 relative overflow-hidden">
          <p
            aria-hidden
            className="absolute -top-10 -right-8 font-display font-black text-[26vw] leading-none text-outline-paper opacity-[0.07] select-none pointer-events-none"
          >
            ★★★★★
          </p>
          <div className="relative">
            <Reveal>
              <p className="label-mono text-goldlight mb-3">02 · VOICES OF THE HOUSE</p>
            </Reveal>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-14">
              <WordsReveal
                as="h2"
                text="WORN. RATED. REMEMBERED."
                className="font-display font-black tracking-[-0.04em] leading-[0.9] text-[clamp(2.4rem,6.5vw,5.5rem)]"
              />
              <Reveal delay={0.15}>
                <span className="flex items-center gap-2.5 pb-2">
                  <Stars rating={globalRating} size={18} />
                  <span className="label-mono text-paper/60">
                    {globalRating.toFixed(1)}/5 AVERAGE
                  </span>
                </span>
              </Reveal>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-paper/10 border border-paper/10">
              {topReviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.08} className="bg-ink p-7 sm:p-9">
                  <Stars rating={r.rating} size={14} />
                  {r.title && (
                    <p className="font-display font-bold text-lg tracking-tight mt-4">
                      “{r.title}”
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-paper/65 line-clamp-5">
                    {r.body}
                  </p>
                  <p className="label-mono text-goldlight/80 mt-5">
                    {r.name.toUpperCase()}
                  </p>
                  <p className="label-mono text-paper/40 text-[10px] mt-1">
                    VERIFIED BUYER · {r.productHandle.replace(/-/g, " ").toUpperCase()}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------ Collection index ------------------------------ */}
      <section className="px-4 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="label-mono text-gold mb-3">03 · CONCENTRATIONS</p>
        </Reveal>
        <WordsReveal
          as="h2"
          text={home.indexTitle}
          className="font-display font-black tracking-[-0.04em] text-[clamp(2.6rem,7vw,6rem)] mb-12"
        />
        <div className="border-t border-ink/15">
          {categories.map((cat, i) => {
            const countItems = all.filter((p) => p.category === cat).length;
            return (
              <Reveal key={cat} delay={i * 0.06}>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group flex items-center justify-between gap-4 py-6 sm:py-8 border-b border-ink/15 hover:px-4 transition-all duration-500"
                  data-cursor="OPEN"
                >
                  <div className="flex items-baseline gap-4 sm:gap-8">
                    <span className="label-mono text-ash">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display font-black tracking-[-0.03em] text-2xl sm:text-5xl group-hover:text-gold group-hover:italic transition-colors duration-300">
                      {cat.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8">
                    <span className="label-mono text-ash">
                      {countItems} SCENT{countItems === 1 ? "" : "S"}
                    </span>
                    <span className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-ink/25 flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:text-paper transition-colors duration-500">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------ Discovery band ------------------------------ */}
      {discovery && (
        <section className="relative bg-gold text-ink overflow-hidden">
          <div className="grid lg:grid-cols-2 items-stretch">
            <div className="px-4 sm:px-10 lg:px-16 py-16 sm:py-24 flex flex-col justify-center relative z-10">
              <Reveal>
                <p className="label-mono font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ink rounded-full" />
                  CAN'T CHOOSE? START WITH 7.
                </p>
                <h2 className="font-display font-black tracking-[-0.035em] leading-[0.92] text-[clamp(2.2rem,5vw,4.6rem)]">
                  {discovery.title}
                </h2>
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/80">
                  Every icon of the house in 2ml glass vials, plus Oud Imperial
                  extrait, inside a gift-ready coffret. Includes a Rs 3,000
                  voucher toward your full bottle.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Link
                    href={`/product/${discovery.handle}`}
                    className="btn-block btn-light"
                  >
                    GET THE SET · {formatMoney(discovery.priceCents, general.currency)}
                  </Link>
                  <span className="label-mono text-ink/70">
                    RS 3,000 VOUCHER INSIDE
                  </span>
                </div>
              </Reveal>
            </div>
            <div className="relative min-h-[40vh] lg:min-h-[70vh]">
              <Reveal className="absolute inset-0" delay={0.1}>
                <Image
                  src={discovery.images[0] ?? ""}
                  alt="EL HOMBRE Discovery Set coffret with seven vials"
                  fill
                  className="object-cover img-bw mix-blend-multiply"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------ Home FAQ ------------------------------ */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 border-t border-ink/10">
        <div className="grid lg:grid-cols-[340px_1fr] gap-10 lg:gap-16">
          <div>
            <Reveal>
              <p className="label-mono text-gold mb-3">04 · GOOD TO KNOW</p>
            </Reveal>
            <WordsReveal
              as="h2"
              text="QUESTIONS, UP FRONT."
              className="font-display font-black tracking-[-0.04em] leading-[0.92] text-[clamp(2.2rem,5vw,4.2rem)]"
            />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xs text-sm text-coal/70 leading-relaxed">
                Longevity, authenticity, returns and shipping. The answers
                every man asks before his first bottle.
              </p>
              <Link href="/faq" className="btn-block btn-ghost text-ink mt-8">
                All FAQs <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Accordion
              items={FAQS.slice(0, 5).map((f) => ({
                title: f.q,
                content: f.a,
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Final quote / CTA ------------------------------ */}
      <section className="bg-ink text-paper px-4 sm:px-8 py-24 sm:py-36 text-center relative overflow-hidden">
        <div className="absolute inset-0 glow-gold opacity-70 pointer-events-none" />
        <blockquote className="max-w-5xl mx-auto relative">
          <WordsReveal
            as="p"
            text={home.quote}
            className="font-display font-black tracking-[-0.03em] leading-[1.02] text-[clamp(1.7rem,4.5vw,3.8rem)]"
          />
          <Reveal delay={0.35}>
            <cite className="label-mono not-italic text-goldlight block mt-8">
              · {home.quoteAuthor}
            </cite>
          </Reveal>
        </blockquote>
        <Reveal delay={0.4}>
          <Link href="/shop" className="btn-block btn-dark mt-12 relative">
            SHOP THE COLLECTION <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
