"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 42 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Reveal({
  children,
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={cx(className)}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-8% 0px" }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/** Splits text into words and reveals them with a clip mask · for headlines. */
export function WordsReveal({
  text,
  className,
  delay = 0,
  as = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const Tag = as as "span";
  const words = text.split(" ");
  return (
    <Tag className={cx("inline-block", className)}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.85,
              delay: delay + i * 0.055,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
