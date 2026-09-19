"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { cx } from "@/lib/utils";

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid lg:grid-cols-[72px_1fr] gap-3">
      {/* thumbs */}
      {images.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cx(
                "relative w-16 lg:w-full aspect-[4/5] overflow-hidden bg-bone border transition-colors",
                active === i ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover img-bw"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      {/* main */}
      <div className="order-1 lg:order-2 relative aspect-[4/5] overflow-hidden bg-bone">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${title} · view ${active + 1}`}
              fill
              priority
              className="object-cover img-bw"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 label-mono bg-paper/85 px-2.5 py-1.5 tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
