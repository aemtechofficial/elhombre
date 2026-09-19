"use client";

import { useCart } from "@/components/cart-context";
import { createOrder } from "@/lib/actions";
import { track } from "@/lib/track";
import { formatMoney } from "@/lib/utils";
import { ArrowRight, Banknote, Landmark, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

export default function CheckoutForm({
  currency,
  freeShipOver,
  flatShipping,
}: {
  currency: string;
  freeShipOver: number;
  flatShipping: number;
}) {
  const { lines, subtotal, clear, hydrated } = useCart();
  const [state, action, pending] = useActionState(createOrder, {
    ok: false,
    error: "",
  });
  const [payment, setPayment] = useState("cod");
  const submitted = useRef(false);

  // Clear the cart once the order goes through (action redirects after).
  useEffect(() => {
    if (pending) submitted.current = true;
  }, [pending]);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      clear();
    }
  }, [pending, state.error, clear]);

  const shippingCents = subtotal >= freeShipOver ? 0 : flatShipping;

  if (hydrated && lines.length === 0 && !submitted.current) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-4xl font-black text-outline">EMPTY CART</p>
        <p className="label-mono text-ash mt-4">
          ADD SOMETHING BEFORE CHECKING OUT
        </p>
        <Link href="/shop" className="btn-block btn-dark mt-8">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={() =>
        track("InitiateCheckout", {
          content_ids: lines.map((l) => l.handle),
          value: (subtotal + shippingCents) / 100,
          currency,
          num_items: lines.reduce((s, l) => s + l.qty, 0),
        })
      }
      className="grid lg:grid-cols-[1fr_400px] gap-12 mt-10"
    >
      {/* ---------- Left: details ---------- */}
      <div className="space-y-10">
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            lines.map((l) => ({ handle: l.handle, size: l.size, qty: l.qty }))
          )}
        />
        <input type="hidden" name="freeShipOver" value={freeShipOver / 100} />
        <input type="hidden" name="flatShipping" value={flatShipping / 100} />

        <section>
          <h2 className="label-mono text-ash mb-5 flex items-center gap-3">
            <span className="text-ink">01</span> CONTACT
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="name" required placeholder="FULL NAME *" className="field" />
            <input
              name="email"
              type="email"
              required
              placeholder="EMAIL *"
              className="field"
            />
            <input
              name="phone"
              placeholder="PHONE / WHATSAPP"
              className="field sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <h2 className="label-mono text-ash mb-5 flex items-center gap-3">
            <span className="text-ink">02</span> SHIPPING ADDRESS
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="address"
              required
              placeholder="STREET ADDRESS *"
              className="field sm:col-span-2"
            />
            <input name="city" required placeholder="CITY *" className="field" />
            <input name="postal" placeholder="POSTAL CODE" className="field" />
            <input
              name="country"
              required
              placeholder="COUNTRY *"
              className="field"
            />
            <input
              name="note"
              placeholder="DELIVERY NOTE (OPTIONAL)"
              className="field"
            />
          </div>
        </section>

        <section>
          <h2 className="label-mono text-ash mb-5 flex items-center gap-3">
            <span className="text-ink">03</span> PAYMENT
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                id: "cod",
                icon: Banknote,
                title: "CASH ON DELIVERY",
                body: "Pay the courier when your order arrives.",
              },
              {
                id: "bank",
                icon: Landmark,
                title: "BANK TRANSFER",
                body: "We share account details on WhatsApp after checkout.",
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayment(m.id)}
                className={cx(
                  "text-left border p-5 transition-colors",
                  payment === m.id
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 hover:border-ink"
                )}
              >
                <m.icon size={20} strokeWidth={1.5} />
                <p className="label-mono mt-3">{m.title}</p>
                <p
                  className={cx(
                    "text-xs mt-1.5 leading-relaxed",
                    payment === m.id ? "text-paper/70" : "text-coal/60"
                  )}
                >
                  {m.body}
                </p>
              </button>
            ))}
          </div>
          <input type="hidden" name="payment" value={payment} />
        </section>

        {state.error && (
          <p className="label-mono bg-ink text-paper px-4 py-3">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || lines.length === 0}
          className="btn-block btn-dark w-full sm:w-auto disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> PLACING ORDER
            </>
          ) : (
            <>
              PLACE ORDER · {formatMoney(subtotal + shippingCents, currency)}{" "}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* ---------- Right: summary ---------- */}
      <aside className="lg:sticky lg:top-24 self-start bg-ink text-paper p-6 sm:p-8">
        <h2 className="label-mono text-paper/60">ORDER SUMMARY</h2>
        <ul className="mt-6 space-y-4">
          {lines.map((l) => (
            <li key={`${l.handle}-${l.size}`} className="flex gap-4 items-center">
              <div className="relative w-14 h-16 bg-coal overflow-hidden shrink-0">
                <Image
                  src={l.image}
                  alt={l.title}
                  fill
                  className="object-cover img-bw"
                  sizes="56px"
                />
                <span className="absolute -top-0 -right-0 bg-paper text-ink label-mono text-[9px] px-1.5 py-0.5">
                  {l.qty}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{l.title}</p>
                <p className="label-mono text-paper/50 text-[10px]">
                  SIZE {l.size}
                </p>
              </div>
              <p className="text-sm tabular-nums">
                {formatMoney(l.priceCents * l.qty, currency)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-5 border-t border-paper/15 space-y-2 text-sm">
          <div className="flex justify-between text-paper/70">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-paper/70">
            <span>Shipping</span>
            <span className="tabular-nums">
              {shippingCents === 0 ? "FREE" : formatMoney(shippingCents, currency)}
            </span>
          </div>
          <div className="flex justify-between font-display font-black text-lg pt-3 border-t border-paper/15">
            <span>TOTAL</span>
            <span className="tabular-nums">
              {formatMoney(subtotal + shippingCents, currency)}
            </span>
          </div>
        </div>
        <p className="label-mono text-paper/40 mt-5 text-[10px] leading-relaxed">
          SECURE CHECKOUT · DUTIES INCLUDED · 30-DAY RETURNS
        </p>
      </aside>
    </form>
  );
}
