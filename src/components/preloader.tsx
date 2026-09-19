"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader({ brandName }: { brandName: string }) {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("noir-booted")) return;
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    let n = 0;
    const tick = setInterval(() => {
      n += Math.floor(Math.random() * 14) + 6;
      if (n >= 100) {
        n = 100;
        clearInterval(tick);
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("noir-booted", "1");
          document.documentElement.style.overflow = "";
        }, 320);
      }
      setCount(n);
    }, 70);
    return () => {
      clearInterval(tick);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink text-paper"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3rem,10vw,8rem)] font-black tracking-[-0.04em] leading-none"
          >
            {brandName}
            <span className="text-ash">.</span>
          </motion.p>
          <div className="mt-6 h-px w-40 bg-smoke overflow-hidden">
            <motion.div
              className="h-full bg-paper"
              style={{ width: `${count}%` }}
            />
          </div>
          <p className="label-mono mt-4 text-ash tabular-nums">
            {String(count).padStart(3, "0")}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
