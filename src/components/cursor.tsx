"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;
      if (target) {
        setHovering(true);
        setLabel(target.getAttribute("data-cursor") ?? "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="cursor-dot hidden md:block"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="cursor-ring hidden md:flex items-center justify-center"
        data-hover={hovering && !label}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hovering ? (label ? 3.1 : 1.8) : 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      />
      {label && (
        <motion.div
          className="cursor-label hidden md:block"
          style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        >
          <span className="label-mono text-[9px]">{label}</span>
        </motion.div>
      )}
    </>
  );
}
