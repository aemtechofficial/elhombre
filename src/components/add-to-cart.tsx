"use client";

import { useCart } from "@/components/cart-context";
import type { ProductRow } from "@/db/schema";
import { track } from "@/lib/track";
import { formatMoney } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { cx } from "@/lib/utils";

export default function AddToCart({
  product,
  currency,
}: {
  product: ProductRow;
  currency: string;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [qty, setQtyLocal] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  useEffect(() => {
    if (added) {
      const t = setTimeout(() => setAdded(false), 1800);
      return () => clearTimeout(t);
    }
  }, [added]);

  const handleAdd = () => {
    if (!size) {
      setError("SELECT A VOLUME FIRST");
      return;
    }
    add({
      handle: product.handle,
      title: product.title,
      size,
      priceCents: product.priceCents,
      qty,
      image: product.images[0] ?? "",
    });
    track("AddToCart", {
      content_ids: [product.handle],
      content_name: product.title,
      content_type: "product",
      value: (product.priceCents * qty) / 100,
      currency,
    });
    setAdded(true);
  };

  return (
    <div className="mt-8">
      {/* Size selector */}
      <div className="flex items-center justify-between mb-3">
        <p className="label-mono text-ash">
          VOLUME {size ? ` ·  ${size}` : ""}
        </p>
        {size === null && error && (
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="label-mono text-ink underline underline-offset-4"
          >
            {error}
          </motion.p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSize(s);
              setError("");
            }}
            className={cx(
              "min-w-14 px-3 py-3 border label-mono transition-all duration-300",
              size === s
                ? "bg-gold text-paper border-gold"
                : "border-ink/20 hover:border-gold"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Qty + Add */}
      <div className="mt-5 flex gap-2">
        <div className="flex items-center border border-ink/20">
          <button
            className="px-4 py-4"
            onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="label-mono w-8 text-center tabular-nums">{qty}</span>
          <button
            className="px-4 py-4"
            onClick={() => setQtyLocal((q) => Math.min(10, q + 1))}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>
        <motion.button
          onClick={handleAdd}
          disabled={soldOut}
          whileTap={{ scale: 0.98 }}
          className={cx(
            "btn-block flex-1",
            soldOut
              ? "bg-mist text-ash cursor-not-allowed"
              : added
                ? "bg-coal text-paper"
                : "btn-dark"
          )}
        >
          {soldOut ? (
            "SOLD OUT"
          ) : added ? (
            <>
              <Check size={16} /> ADDED
            </>
          ) : (
            <>
              ADD TO CART · {formatMoney(product.priceCents * qty, currency)}
            </>
          )}
        </motion.button>
      </div>

      {!soldOut && product.stock <= 8 && (
        <p className="label-mono mt-4 flex items-center gap-2 text-ink">
          <span className="w-1.5 h-1.5 bg-ink rounded-full pulse-dot" />
          LOW STOCK · ONLY {product.stock} LEFT
        </p>
      )}
    </div>
  );
}
