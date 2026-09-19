"use client";

import { useCart } from "@/components/cart-context";
import { formatMoney } from "@/lib/utils";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, hydrated } = useCart();
  const [currency, setCurrency] = useState("PKR");
  useEffect(() => {
    setCurrency(document.body.dataset.currency ?? "PKR");
  }, []);

  return (
    <main className="px-4 sm:px-8 py-14 sm:py-20 min-h-[60vh]">
      <p className="label-mono text-ash mb-4">YOUR CART</p>
      <h1 className="font-display font-black tracking-[-0.04em] text-[clamp(2.5rem,8vw,6rem)] leading-[0.9]">
        {hydrated && lines.length > 0 ? (
          <>
            {lines.reduce((s, l) => s + l.qty, 0)} ITEM
            {lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "S"}
          </>
        ) : (
          <span className="text-outline">EMPTY</span>
        )}
      </h1>

      {hydrated && lines.length === 0 ? (
        <div className="mt-12 max-w-sm">
          <p className="text-sm text-coal/70 leading-relaxed">
            Your cart is a blank canvas. Fill it with something black · or
            white.
          </p>
          <Link href="/shop" className="btn-block btn-dark mt-8">
            Shop the drop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid lg:grid-cols-[1fr_360px] gap-12">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {lines.map((line, i) => (
              <li key={`${line.handle}-${line.size}`} className="py-6 flex gap-5">
                <Link
                  href={`/product/${line.handle}`}
                  className="relative w-24 sm:w-28 aspect-[4/5] bg-bone overflow-hidden shrink-0"
                >
                  <Image
                    src={line.image}
                    alt={line.title}
                    fill
                    className="object-cover img-bw hover:scale-105 transition-transform duration-700"
                    sizes="112px"
                  />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="label-mono text-ash">
                        {String(i + 1).padStart(2, "0")} · SIZE {line.size}
                      </p>
                      <Link
                        href={`/product/${line.handle}`}
                        className="font-display font-bold text-lg tracking-tight link-sweep"
                      >
                        {line.title}
                      </Link>
                    </div>
                    <p className="font-display font-bold tabular-nums">
                      {formatMoney(line.priceCents * line.qty)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-ink/20">
                      <button
                        className="px-3.5 py-2"
                        onClick={() => setQty(line.handle, line.size, line.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="label-mono w-8 text-center tabular-nums">
                        {line.qty}
                      </span>
                      <button
                        className="px-3.5 py-2"
                        onClick={() => setQty(line.handle, line.size, line.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(line.handle, line.size)}
                      className="label-mono text-ash hover:text-ink flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={13} /> REMOVE
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 self-start border border-ink/15 p-6">
            <h2 className="font-display font-black text-xl tracking-tight">
              SUMMARY
            </h2>
            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-coal/70">Subtotal</span>
                <span className="tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coal/70">Shipping</span>
                <span className="label-mono text-ash">AT CHECKOUT</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3">
                <span className="font-bold">Total</span>
                <span className="font-display font-black text-xl tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>
            </div>
            <Link href="/checkout" className="btn-block btn-dark w-full mt-6">
              Checkout <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop"
              className="label-mono text-ash link-sweep block text-center mt-4"
            >
              CONTINUE SHOPPING
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
