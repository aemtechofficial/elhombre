import type { ProductRow } from "@/db/schema";
import { formatMoney } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({
  product,
  currency,
  index = 0,
  priority = false,
}: {
  product: ProductRow;
  currency: string;
  index?: number;
  priority?: boolean;
}) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      href={`/product/${product.handle}`}
      className="group block"
      data-cursor="VIEW"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Image
          src={product.images[0] ?? "/images/products/noir.jpg"}
          alt={`${product.title} · ${product.subtitle ?? ""}`}
          fill
          priority={priority}
          className="object-cover img-bw transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* index stamp */}
        <span className="absolute top-3 left-3 label-mono text-ink/60 mix-blend-difference invert">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {soldOut && (
            <span className="label-mono bg-ink text-paper px-2.5 py-1.5">
              SOLD OUT
            </span>
          )}
          {!soldOut && product.isNew && (
            <span className="label-mono bg-paper/90 text-ink px-2.5 py-1.5">
              NEW
            </span>
          )}
          {!soldOut && product.compareAtCents && (
            <span className="label-mono bg-gold text-paper px-2.5 py-1.5">
              −{Math.round((1 - product.priceCents / product.compareAtCents) * 100)}%
            </span>
          )}
        </div>
        {/* quick view bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <p className="bg-ink text-paper label-mono text-center py-3.5">
            {soldOut ? "NOTIFY ME" : "VIEW PRODUCT →"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-[15px] tracking-tight leading-tight group-hover:underline underline-offset-4">
            {product.title}
          </h3>
          <p className="label-mono text-ash mt-1">{product.category}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-[15px] tabular-nums">
            {formatMoney(product.priceCents, currency)}
          </p>
          {product.compareAtCents && (
            <p className="label-mono text-ash line-through tabular-nums">
              {formatMoney(product.compareAtCents, currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
