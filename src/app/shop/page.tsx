import ProductCard from "@/components/product-card";
import Reveal, { WordsReveal } from "@/components/reveal";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { getSetting } from "@/lib/settings";
import { and, eq } from "drizzle-orm";
import { ArrowUpDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All · The Collection",
  description:
    "The full EL HOMBRE collection: niche eau de parfum and extraits · oud, leather, musk and amber at 20%+ concentration, hand-poured in monochrome flacons.",
  alternates: { canonical: "/shop" },
};

type SP = { category?: string; sort?: string; size?: string };

const SORTS = [
  { id: "featured", label: "FEATURED" },
  { id: "new", label: "NEWEST" },
  { id: "price-asc", label: "PRICE ↑" },
  { id: "price-desc", label: "PRICE ↓" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await ensureSeeded();
  const sp = await searchParams;
  const category = sp.category ?? "All";
  const sort = sp.sort ?? "featured";
  const size = sp.size ?? "All";
  const general = await getSetting<{ currency: string; brandName: string }>(
    "general"
  );

  let rows: (typeof products.$inferSelect)[] = [];
  let categories: string[] = [];
  try {
    const all = await db
      .select()
      .from(products)
      .where(eq(products.active, true));
    categories = Array.from(new Set(all.map((p) => p.category)));
    rows =
      category === "All"
        ? all
        : all.filter((p) => p.category === category);
    if (size !== "All") rows = rows.filter((p) => p.sizes.includes(size));
    switch (sort) {
      case "price-asc":
        rows.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        rows.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "new":
        rows.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      default:
        rows.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  } catch {
    /* booting */
  }

  const sizes = ["All", "30ML", "50ML", "100ML", "OS"];

  const link = (over: Partial<SP>) => {
    const q = new URLSearchParams();
    const merged = { category, sort, size, ...over };
    if (merged.category && merged.category !== "All")
      q.set("category", merged.category);
    if (merged.sort && merged.sort !== "featured") q.set("sort", merged.sort);
    if (merged.size && merged.size !== "All") q.set("size", merged.size);
    const s = q.toString();
    return `/shop${s ? `?${s}` : ""}`;
  };

  return (
    <main className="px-4 sm:px-8 pb-24">
      {/* Title */}
      <section className="pt-14 sm:pt-20 pb-10 border-b border-ink/10">
        <Reveal>
          <p className="label-mono text-ash mb-4">
            THE COLLECTION · {String(rows.length).padStart(2, "0")} SCENT
            {rows.length === 1 ? "" : "S"}
          </p>
        </Reveal>
        <WordsReveal
          as="h1"
          text={category === "All" ? "SHOP EVERYTHING" : category.toUpperCase()}
          className="font-display font-black tracking-[-0.045em] leading-[0.9] text-[clamp(2.8rem,9vw,7.5rem)]"
        />
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-md text-sm text-coal/75 leading-relaxed">
            Every composition in the house · hand-poured, batch-numbered,
            sealed in black or white glass. When a batch empties, it sleeps.
          </p>
        </Reveal>
      </section>

      {/* Filter bar */}
      <div className="sticky top-[60px] z-40 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-paper/90 backdrop-blur-md border-b border-ink/10 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="label-mono text-ash shrink-0">FILTER:</span>
          {["All", ...categories].map((c) => (
            <Link
              key={c}
              href={link({ category: c })}
              className={`label-mono whitespace-nowrap link-sweep ${category === c ? "font-bold" : "text-ash"}`}
              data-active={category === c}
            >
              {c.toUpperCase()}
            </Link>
          ))}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          <span className="label-mono text-ash">SIZE:</span>
          {sizes.map((s) => (
            <Link
              key={s}
              href={link({ size: s })}
              className={`label-mono w-8 h-8 flex items-center justify-center border transition-colors ${size === s ? "bg-gold text-paper border-gold" : "border-ink/15 hover:border-gold"}`}
            >
              {s === "All" ? "∗" : s}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 overflow-x-auto">
          <ArrowUpDown size={13} className="text-ash shrink-0" />
          {SORTS.map((s) => (
            <Link
              key={s.id}
              href={link({ sort: s.id })}
              className={`label-mono whitespace-nowrap ${sort === s.id ? "font-bold underline underline-offset-4" : "text-ash hover:text-ink"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {rows.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-4xl font-black text-outline">
            NOTHING HERE
          </p>
          <p className="label-mono text-ash mt-3">
            TRY REMOVING A FILTER OR TWO
          </p>
          <Link href="/shop" className="btn-block btn-dark mt-8">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12 pt-12">
          {rows.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard
                product={p}
                currency={general.currency}
                index={i}
                priority={i < 4}
              />
            </Reveal>
          ))}
        </div>
      )}

      {/* Bottom note */}
      <div className="mt-24 border-t border-ink/10 pt-8 flex flex-col sm:flex-row justify-between gap-4">
        <p className="label-mono text-ash">
          ALL PRICES IN {general.currency} · FREE SHIPPING OVER RS 10,000
        </p>
        <p className="label-mono text-ash">
          EVERY ORDER DISPATCHED WITHIN 24 HOURS
        </p>
      </div>
    </main>
  );
}
