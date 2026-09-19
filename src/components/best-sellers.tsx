"use client";

import Stars from "@/components/stars";
import { formatMoney } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type BestSellerItem = {
  handle: string;
  title: string;
  subtitle: string | null;
  priceCents: number;
  compareAtCents: number | null;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
};

export default function BestSellers({
  items,
  currency,
}: {
  items: BestSellerItem[];
  currency: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 16 : 340;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* arrows */}
      <div className="absolute -top-[72px] right-0 flex gap-2">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="w-12 h-12 border border-ink/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-paper transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="w-12 h-12 border border-ink/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-paper transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={track}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-8 sm:px-8"
      >
        {items.map((p, i) => (
          <div
            key={p.handle}
            data-card
            className="snap-start shrink-0 w-[74vw] sm:w-[330px] group"
          >
            <Link href={`/product/${p.handle}`} data-cursor="VIEW">
              <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                <Image
                  src={p.image}
                  alt={`${p.title} · EL HOMBRE bestseller`}
                  fill
                  className="object-cover img-bw transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 74vw, 330px"
                />
                {/* rank */}
                <span className="absolute top-3 left-3 font-display font-black text-4xl text-outline-paper mix-blend-difference text-paper leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i === 0 && (
                  <span className="absolute top-3 right-3 label-mono bg-gold text-paper px-2.5 py-1.5">
                    BESTSELLER
                  </span>
                )}
                {p.stock <= 10 && (
                  <span className="absolute bottom-3 left-3 label-mono bg-ink text-paper px-2.5 py-1.5">
                    LOW STOCK · {p.stock} LEFT
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <Stars rating={p.rating} size={12} />
                  <span className="label-mono text-ash text-[10px]">
                    {p.rating.toFixed(1)} ({p.reviewCount})
                  </span>
                </div>
                <h3 className="font-display font-bold text-[15px] tracking-tight mt-1.5 group-hover:underline underline-offset-4">
                  {p.title}
                </h3>
                <p className="label-mono text-ash mt-0.5 line-clamp-1">
                  {p.subtitle}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-display font-bold tabular-nums">
                    {formatMoney(p.priceCents, currency)}
                  </span>
                  {p.compareAtCents && (
                    <span className="label-mono text-ash line-through tabular-nums">
                      {formatMoney(p.compareAtCents, currency)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
