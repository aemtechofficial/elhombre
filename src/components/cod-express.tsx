"use client";

import type { ProductRow } from "@/db/schema";
import { placeQuickOrder } from "@/lib/actions";
import { formatMoney, cx } from "@/lib/utils";
import { ChevronDown, Loader2, Zap } from "lucide-react";
import { useActionState, useState } from "react";

/**
 * Releasit-style express COD form · one screen, four fields,
 * zero checkout friction. Huge for Pakistani COD conversion.
 */
export default function CodExpress({
  product,
  currency,
}: {
  product: ProductRow;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [state, action, pending] = useActionState(placeQuickOrder, {
    ok: false,
    error: "",
  });

  if (product.stock <= 0) return null;

  return (
    <div className="mt-4 border border-gold">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-bone transition-colors"
      >
        <span className="flex items-center gap-3">
          <Zap size={17} strokeWidth={1.5} />
          <span className="text-left">
            <span className="label-mono block font-bold">
              ORDER IN 30 SECONDS · CASH ON DELIVERY
            </span>
            <span className="label-mono text-ash text-[10px] block mt-0.5">
              NO EMAIL. NO ACCOUNT. JUST 4 FIELDS.
            </span>
          </span>
        </span>
        <ChevronDown
          size={18}
          className={cx("shrink-0 transition-transform duration-500", open && "rotate-180")}
        />
      </button>

      <div className="acc-content" data-open={open}>
        <div className="acc-inner">
          <form action={action} className="px-5 pb-5 pt-2 space-y-3 border-t border-ink/10">
            <input type="hidden" name="handle" value={product.handle} />
            <input type="hidden" name="size" value={size} />

            {product.sizes.length > 1 && (
              <div>
                <p className="label-mono text-ash mb-2">
                  VOLUME · {size}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cx(
                        "px-3 py-2 border label-mono text-[10px] transition-colors",
                        size === s
                          ? "bg-gold text-paper border-gold"
                          : "border-ink/20 hover:border-gold"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input name="name" required placeholder="FULL NAME *" className="field" />
              <input
                name="phone"
                required
                inputMode="tel"
                placeholder="WHATSAPP NUMBER *"
                className="field"
              />
            </div>
            <input
              name="address"
              required
              placeholder="COMPLETE ADDRESS *"
              className="field"
            />
            <div className="grid grid-cols-2 gap-3">
              <input name="city" required placeholder="CITY *" className="field" />
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="field"
                name="qty"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    QTY · {n}
                  </option>
                ))}
              </select>
            </div>

            {state.error && (
              <p className="label-mono bg-ink text-paper px-4 py-3">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-block btn-dark w-full disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> PLACING…
                </>
              ) : (
                <>
                  <Zap size={15} /> CONFIRM COD ORDER · {formatMoney(product.priceCents * qty, currency)}
                </>
              )}
            </button>
            <p className="label-mono text-ash text-[10px] text-center leading-relaxed">
              COURIER CALLS BEFORE DISPATCH · PAY ON DELIVERY
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
