"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import CartDrawer from "@/components/cart-drawer";

const NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "La Casa", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Header({
  brandName,
  brandSuffix,
  freeShipOver,
  flatShipping,
  currency,
}: {
  brandName: string;
  brandSuffix: string;
  freeShipOver: number;
  flatShipping: number;
  currency: string;
}) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", menu);
    return () => document.documentElement.classList.remove("lenis-stopped");
  }, [menu]);

  return (
    <>
      <header className="sticky top-0 z-[90] mix-blend-difference text-[#f4f4f1]">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4">
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-sweep label-mono"
                data-active={pathname === item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-xl sm:text-2xl font-black tracking-[-0.03em]"
            aria-label={`${brandName} · home`}
          >
            {brandName}
            <span className="opacity-50">{brandSuffix}</span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-7">
            <Link href="/search" aria-label="Search" className="link-sweep">
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 group"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="label-mono tabular-nums border border-current rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-[#f4f4f1] group-hover:text-[#0a0a0a] transition-colors">
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[95] bg-ink text-paper flex flex-col"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-display text-xl font-black">
                {brandName}
                <span className="opacity-50">{brandSuffix}</span>
              </span>
              <button onClick={() => setMenu(false)} aria-label="Close menu">
                <X size={26} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-6 gap-2">
              {[...NAV, { label: "Search", href: "/search" }].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.07,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-4 py-2"
                  >
                    <span className="label-mono text-ash">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-5xl font-black tracking-[-0.03em] group-hover:translate-x-3 transition-transform duration-500">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      size={22}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="label-mono px-6 pb-8 text-ash"
            >
              BLACK / WHITE · NOTHING IN BETWEEN
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        freeShipOver={freeShipOver}
        flatShipping={flatShipping}
        currency={currency}
      />
    </>
  );
}
