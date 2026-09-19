import ProductCard from "@/components/product-card";
import Reveal from "@/components/reveal";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { getSetting } from "@/lib/settings";
import { eq } from "drizzle-orm";
import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the EL HOMBRE collection of niche perfumes.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await ensureSeeded();
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const general = await getSetting<{ currency: string }>("general");

  let results: (typeof products.$inferSelect)[] = [];
  try {
    if (query) {
      const all = await db
        .select()
        .from(products)
        .where(eq(products.active, true));
      results = all.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.subtitle ?? "").toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(query)) ||
          (p.description ?? "").toLowerCase().includes(query)
      );
    }
  } catch {
    /* booting */
  }

  return (
    <main className="px-4 sm:px-8 pb-24 min-h-[70vh]">
      <section className="pt-14 sm:pt-20 pb-10">
        <p className="label-mono text-ash mb-6">SEARCH THE CATALOGUE</p>
        <form action="/search" className="max-w-2xl">
          <div className="flex items-center border-b-2 border-ink pb-3 gap-4">
            <SearchIcon size={26} strokeWidth={1.5} className="shrink-0" />
            <input
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="OUD, MUSK, LEATHER…"
              className="w-full bg-transparent font-display font-black tracking-[-0.03em] text-3xl sm:text-5xl outline-none placeholder:text-mist uppercase"
            />
            <button type="submit" className="btn-block btn-dark py-3 shrink-0">
              GO
            </button>
          </div>
        </form>

        {!query && (
          <div className="mt-8 flex flex-wrap gap-2">
            {["oud", "musk", "leather", "fresh", "gift", "extrait"].map(
              (t) => (
                <a
                  key={t}
                  href={`/search?q=${t}`}
                  className="label-mono border border-ink/15 px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
                >
                  {t.toUpperCase()}
                </a>
              )
            )}
          </div>
        )}
      </section>

      {query && (
        <section>
          <p className="label-mono text-ash border-t border-ink/10 pt-8">
            {results.length} RESULT{results.length === 1 ? "" : "S"} FOR “
            {query.toUpperCase()}”
          </p>
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-4xl font-black text-outline">
                NO MATCHES
              </p>
              <p className="label-mono text-ash mt-3">
                TRY “OUD” OR “DISCOVERY”
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 pt-10">
              {results.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.05}>
                  <ProductCard product={p} currency={general.currency} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
