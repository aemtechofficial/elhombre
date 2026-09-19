import Accordion from "@/components/accordion";
import AddToCart from "@/components/add-to-cart";
import CodExpress from "@/components/cod-express";
import JsonLd from "@/components/json-ld";
import ProductCard from "@/components/product-card";
import ProductGallery from "@/components/product-gallery";
import Reveal from "@/components/reveal";
import ReviewForm from "@/components/review-form";
import Stars from "@/components/stars";
import TrackMount from "@/components/track-mount";
import { db } from "@/db";
import { products, reviews, type ProductRow, type ReviewRow } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { getSetting } from "@/lib/settings";
import { formatMoney } from "@/lib/utils";
import { and, desc, eq, ne } from "drizzle-orm";
import { BadgeCheck } from "lucide-react";
import { ArrowLeft, ArrowRight, Package, RotateCcw, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getProduct(handle: string): Promise<ProductRow | null> {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.handle, handle), eq(products.active, true)))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return { title: "Not found" };
  const brand = await getSetting<{ brandName: string; brandSuffix: string }>(
    "general"
  );
  const desc = (p.description ?? "").slice(0, 158);
  return {
    title: `${p.title} · ${p.subtitle ?? p.category}`,
    description: desc,
    alternates: { canonical: `/product/${p.handle}` },
    openGraph: {
      title: `${p.title} | ${brand.brandName}${brand.brandSuffix}`,
      description: desc,
      type: "website",
      images: p.images.map((img) => ({ url: img })),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  await ensureSeeded();
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const general = await getSetting<{
    currency: string;
    brandName: string;
    brandSuffix: string;
  }>("general");

  let related: ProductRow[] = [];
  let productReviews: ReviewRow[] = [];
  let siblings: { prev: ProductRow | null; next: ProductRow | null } = {
    prev: null,
    next: null,
  };
  try {
    productReviews = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.productHandle, product.handle), eq(reviews.approved, true))
      )
      .orderBy(desc(reviews.createdAt));
  } catch {
    /* booting */
  }
  const reviewCount = productReviews.length;
  const avgRating =
    reviewCount > 0
      ? productReviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;
  try {
    related = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.active, true),
          eq(products.category, product.category),
          ne(products.handle, product.handle)
        )
      )
      .limit(4);
    if (related.length === 0) {
      related = await db
        .select()
        .from(products)
        .where(and(eq(products.active, true), ne(products.handle, product.handle)))
        .limit(4);
    }
    const all = await db
      .select()
      .from(products)
      .where(eq(products.active, true));
    const idx = all.findIndex((p) => p.handle === product.handle);
    siblings = {
      prev: idx > 0 ? all[idx - 1] : (all[all.length - 1] ?? null),
      next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : (all[0] ?? null),
    };
  } catch {
    /* booting */
  }

  return (
    <main className="px-4 sm:px-8 pb-24">
      <TrackMount
        event="ViewContent"
        payload={{
          content_ids: [product.handle],
          content_name: product.title,
          content_type: "product",
          value: product.priceCents / 100,
          currency: general.currency,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images.map((i) => `${SITE_URL}${i}`),
          brand: {
            "@type": "Brand",
            name: `${general.brandName}${general.brandSuffix}`,
          },
          category: product.category,
          sku: product.handle,
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.handle}`,
            priceCurrency: general.currency,
            price: (product.priceCents / 100).toFixed(2),
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
          ...(reviewCount > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating.toFixed(1),
              reviewCount,
              bestRating: "5",
              worstRating: "1",
            },
          }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
            {
              "@type": "ListItem",
              position: 3,
              name: product.title,
              item: `${SITE_URL}/product/${product.handle}`,
            },
          ],
        }}
      />

      {/* breadcrumbs */}
      <nav className="py-5 flex items-center gap-2 label-mono text-ash">
        <Link href="/" className="hover:text-ink transition-colors">HOME</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink transition-colors">SHOP</Link>
        <span>/</span>
        <span className="text-ink">{product.title.toUpperCase()}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Gallery */}
        <Reveal>
          <ProductGallery images={product.images} title={product.title} />
        </Reveal>

        {/* Info · sticky */}
        <div className="lg:sticky lg:top-24 self-start">
          <Reveal delay={0.1}>
            <div className="flex items-center gap-3 label-mono text-ash">
              <span>{product.category.toUpperCase()}</span>
              <span className="w-1 h-1 bg-ash rounded-full" />
              <span>{product.stock > 0 ? "IN STOCK" : "SOLD OUT"}</span>
              {product.isNew && (
                <>
                  <span className="w-1 h-1 bg-ash rounded-full" />
                  <span className="bg-ink text-paper px-2 py-0.5">NEW</span>
                </>
              )}
            </div>
            <h1 className="mt-3 font-display font-black tracking-[-0.035em] leading-[0.95] text-[clamp(2.2rem,5vw,4rem)]">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="label-mono text-ash mt-3">{product.subtitle}</p>
            )}
            {reviewCount > 0 && (
              <a href="#reviews" className="mt-3 flex items-center gap-2.5 group w-fit">
                <Stars rating={avgRating} />
                <span className="label-mono text-ash group-hover:text-ink transition-colors">
                  {avgRating.toFixed(1)} · {reviewCount} REVIEW{reviewCount === 1 ? "" : "S"}
                </span>
              </a>
            )}
            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-display font-black text-2xl tabular-nums">
                {formatMoney(product.priceCents, general.currency)}
              </p>
              {product.compareAtCents && (
                <>
                  <p className="text-ash line-through tabular-nums">
                    {formatMoney(product.compareAtCents, general.currency)}
                  </p>
                  <span className="label-mono bg-ink text-paper px-2 py-1">
                    SAVE{" "}
                    {formatMoney(
                      product.compareAtCents - product.priceCents,
                      general.currency
                    )}
                  </span>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-6 text-[15px] leading-relaxed text-coal/85 max-w-lg">
              {product.description}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <AddToCart product={product} currency={general.currency} />
            <CodExpress product={product} currency={general.currency} />
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-8 grid grid-cols-3 divide-x divide-ink/10 border-y border-ink/10">
                {[
                  { icon: Truck, label: "SHIPS IN 24H" },
                  { icon: RotateCcw, label: "30-DAY RETURNS" },
                  { icon: Package, label: "SEALED & NUMBERED" },
                ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-2 py-4 text-center"
                >
                  <b.icon size={17} strokeWidth={1.5} />
                  <span className="label-mono text-[10px] text-coal/70">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-6">
              <Accordion
                items={[
                  {
                    title: "Notes & Composition",
                    content: (
                      <ul className="space-y-2">
                        {(product.details ?? []).map((d, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="label-mono text-ash shrink-0 mt-0.5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                  {
                    title: "Shipping & Delivery",
                    content:
                      "Orders leave the atelier within 24 hours, Monday to Saturday, in tamper-proof cushioned packaging. Nationwide delivery in 1–2 working days; GCC, UK and worldwide in 3–7. Free shipping over the threshold shown at checkout.",
                  },
                  {
                    title: "Returns & Guarantee",
                    content:
                      "Unopened seal? You have 30 days · we arrange the return courier and refund in full. Tried it via a 2ml discovery vial first is even smarter. Every flacon is guaranteed authentic and batch-numbered; if a scent ever underperforms, the house replaces it.",
                  },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* ------------------------------ Reviews ------------------------------ */}
      <section id="reviews" className="mt-20 border-t border-ink/10 pt-14">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <Reveal>
            <div className="lg:sticky lg:top-24 self-start">
              <p className="label-mono text-ash mb-3">COMMUNITY VERDICT</p>
              <p className="font-display font-black text-6xl tabular-nums leading-none">
                {reviewCount > 0 ? avgRating.toFixed(1) : " · "}
              </p>
              <Stars rating={avgRating} size={18} className="mt-3" />
              <p className="label-mono text-ash mt-3">
                {reviewCount} REVIEW{reviewCount === 1 ? "" : "S"}  · {" "}
                {reviewCount > 0
                  ? `${Math.round(
                      (productReviews.filter((r) => r.rating >= 4).length / reviewCount) * 100
                    )}% RECOMMEND`
                  : "BE THE FIRST"}
              </p>
              <div className="mt-8">
                <ReviewForm handle={product.handle} />
              </div>
            </div>
          </Reveal>

          <div className="space-y-0 divide-y divide-ink/10 border-y border-ink/10">
            {productReviews.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-display text-3xl font-black text-outline">
                  NO REVIEWS YET
                </p>
                <p className="label-mono text-ash mt-3">
                  BE THE FIRST TO REVIEW
                </p>
              </div>
            ) : (
              productReviews.map((r, i) => (
                <Reveal key={r.id} delay={Math.min(i, 5) * 0.04}>
                  <article className="py-6 px-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <Stars rating={r.rating} />
                      {r.title && (
                        <h3 className="font-display font-bold text-[15px] tracking-tight">
                          {r.title}
                        </h3>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-coal/85 max-w-2xl">
                      {r.body}
                    </p>
                    <p className="label-mono text-ash mt-3 flex items-center gap-2">
                      {r.verified && (
                        <span className="flex items-center gap-1 text-ink">
                          <BadgeCheck size={13} /> VERIFIED BUYER
                        </span>
                      )}
                      {r.name.toUpperCase()}  · {" "}
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </article>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* prev / next */}
      <div className="mt-20 border-t border-ink/10 pt-6 flex justify-between gap-4">
        {siblings.prev && (
          <Link
            href={`/product/${siblings.prev.handle}`}
            className="group flex items-center gap-3"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>
              <span className="label-mono text-ash block">PREV</span>
              <span className="font-display font-bold text-sm">{siblings.prev.title}</span>
            </span>
          </Link>
        )}
        {siblings.next && (
          <Link
            href={`/product/${siblings.next.handle}`}
            className="group flex items-center gap-3 text-right ml-auto"
          >
            <span>
              <span className="label-mono text-ash block">NEXT</span>
              <span className="font-display font-bold text-sm">{siblings.next.title}</span>
            </span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        )}
      </div>

      {/* Cross sell */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-ink/10 pt-14">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display font-black tracking-[-0.035em] text-[clamp(1.8rem,4vw,3.2rem)]">
              FROM THE SAME HOUSE
            </h2>
            <Link href="/shop" className="label-mono link-sweep hidden sm:block">
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} currency={general.currency} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
