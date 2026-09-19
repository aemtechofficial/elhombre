"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatMoney } from "@/lib/utils";

export default function CartDrawer({
  freeShipOver,
  flatShipping,
  currency,
}: {
  freeShipOver: number;
  flatShipping: number;
  currency: string;
}) {
  const { lines, open, setOpen, setQty, remove, subtotal } = useCart();
  const progress = Math.min(1, subtotal / freeShipOver);
  const remaining = Math.max(0, freeShipOver - subtotal);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md bg-paper text-ink flex flex-col border-l border-ink/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
              <h2 className="font-display text-lg font-black tracking-tight">
                YOUR CART{" "}
                <span className="text-ash font-medium">
                  ({lines.reduce((s, l) => s + l.qty, 0)})
                </span>
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-ink/10 bg-bone">
              {remaining > 0 ? (
                <p className="label-mono text-coal">
                  {formatMoney(remaining, currency)} AWAY FROM FREE SHIPPING
                </p>
              ) : (
                <p className="label-mono text-coal">
                  FREE SHIPPING UNLOCKED · WORLDWIDE
                </p>
              )}
              <div className="mt-2 h-1 bg-mist overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <p className="font-display text-3xl font-black text-outline">
                    EMPTY
                  </p>
                  <p className="label-mono text-ash">
                    NOTHING HERE · YET.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="btn-block btn-dark mt-2"
                  >
                    Shop the drop
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-ink/10">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={`${line.handle}-${line.size}`}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="py-4 flex gap-4"
                      >
                        <div className="relative w-20 h-24 bg-bone overflow-hidden shrink-0">
                          <Image
                            src={line.image}
                            alt={line.title}
                            fill
                            className="object-cover img-bw"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between gap-2">
                            <Link
                              href={`/product/${line.handle}`}
                              onClick={() => setOpen(false)}
                              className="font-display font-bold text-sm tracking-tight link-sweep"
                            >
                              {line.title}
                            </Link>
                            <button
                              onClick={() => remove(line.handle, line.size)}
                              aria-label="Remove item"
                              className="text-ash hover:text-ink transition-colors"
                            >
                              <Trash2 size={15} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="label-mono text-ash mt-1">
                            SIZE · {line.size}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border border-ink/20">
                              <button
                                className="px-2.5 py-1.5"
                                onClick={() =>
                                  setQty(line.handle, line.size, line.qty - 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="label-mono w-8 text-center tabular-nums">
                                {line.qty}
                              </span>
                              <button
                                className="px-2.5 py-1.5"
                                onClick={() =>
                                  setQty(line.handle, line.size, line.qty + 1)
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="font-display font-bold text-sm tabular-nums">
                              {formatMoney(line.priceCents * line.qty, currency)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5 bg-paper">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="label-mono text-ash">SUBTOTAL</span>
                  <span className="font-display text-xl font-black tabular-nums">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <p className="label-mono text-ash mb-4">
                  {subtotal >= freeShipOver
                    ? "SHIPPING · FREE"
                    : `SHIPPING · ${formatMoney(flatShipping, currency)} AT CHECKOUT`}
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-block btn-dark w-full"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="btn-block btn-ghost w-full mt-2"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
