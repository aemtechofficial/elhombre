"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";

export default function Accordion({
  items,
  invert = false,
}: {
  items: { title: string; content: ReactNode }[];
  invert?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cx("divide-y", invert ? "divide-paper/15" : "divide-ink/10")}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
            >
              <span className="font-display font-bold text-sm sm:text-base tracking-tight">
                {item.title}
              </span>
              <Plus
                size={18}
                strokeWidth={1.5}
                className={cx(
                  "shrink-0 transition-transform duration-500",
                  open && "rotate-45"
                )}
              />
            </button>
            <div className="acc-content" data-open={open}>
              <div className="acc-inner">
                <div
                  className={cx(
                    "pb-6 text-sm leading-relaxed max-w-prose",
                    invert ? "text-paper/70" : "text-coal/80"
                  )}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
