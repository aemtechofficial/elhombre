"use client";

import type { ProductRow } from "@/db/schema";
import { addUpsellToOrder } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";
import { Check, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useActionState } from "react";

/**
 * Releasit-style post-purchase one-click upsell.
 * COD orders stay editable while "pending" · one tap appends
 * the item at 15% off and updates the order total.
 */
export default function OrderUpsell({
  orderNumber,
  product,
  currency,
}: {
  orderNumber: string;
  product: ProductRow;
  currency: string;
}) {
  const [state, action, pending] = useActionState(addUpsellToOrder, {
    ok: false,
    error: "",
    total: 0,
    message: "",
  });
  const offer = Math.round(product.priceCents * 0.85);

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-ink text-paper px-6 sm:px-8 py-7">
      <p className="label-mono text-paper/50">WAIT · ONE LAST THING</p>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative w-16 h-20 bg-coal overflow-hidden shrink-0">
          <Image
            src={product.images[0] ?? ""}
            alt={product.title}
            fill
            className="object-cover img-bw"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-black tracking-tight truncate">
            {product.title}
          </p>
          <p className="label-mono text-paper/50 mt-1 line-clamp-1">
            {product.subtitle}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="tabular-nums font-bold">
              {formatMoney(offer, currency)}
            </span>
            <span className="tabular-nums text-paper/40 line-through text-sm">
              {formatMoney(product.priceCents, currency)}
            </span>
            <span className="label-mono bg-paper text-ink px-2 py-0.5 text-[9px]">
              −15% POST-ORDER
            </span>
          </div>
        </div>
        <form action={action}>
          <input type="hidden" name="orderNumber" value={orderNumber} />
          <input type="hidden" name="handle" value={product.handle} />
          <button
            type="submit"
            disabled={pending || state.ok}
            className="btn-block btn-light py-3 px-5 disabled:opacity-70 shrink-0"
          >
            {state.ok ? (
              <>
                <Check size={15} /> ADDED
              </>
            ) : pending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Plus size={15} /> ADD
              </>
            )}
          </button>
        </form>
      </div>
      {state.ok && (
        <p className="label-mono mt-4 text-paper/75">
          {state.message} NEW TOTAL: {formatMoney(state.total, currency)} · pay
          the courier this amount.
        </p>
      )}
      {state.error && (
        <p className="label-mono mt-4 bg-paper text-ink px-3 py-2">
          {state.error}
        </p>
      )}
    </div>
  );
}
