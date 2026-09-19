"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  handle: string;
  title: string;
  size: string;
  priceCents: number;
  qty: number;
  image: string;
};

type CartContextValue = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (handle: string, size: string) => void;
  setQty: (handle: string, size: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "noir-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {
        /* ignore */
      }
    }
  }, [lines, hydrated]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const i = prev.findIndex(
        (l) => l.handle === line.handle && l.size === line.size
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + line.qty) };
        return next;
      }
      return [...prev, line];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((handle: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)));
  }, []);

  const setQty = useCallback((handle: string, size: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.handle === handle && l.size === size))
        : prev.map((l) =>
            l.handle === handle && l.size === size
              ? { ...l, qty: Math.min(10, qty) }
              : l
          )
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { subtotal, count } = useMemo(() => {
    return {
      subtotal: lines.reduce((s, l) => s + l.priceCents * l.qty, 0),
      count: lines.reduce((s, l) => s + l.qty, 0),
    };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, add, remove, setQty, clear, subtotal, count, open, setOpen, hydrated }),
    [lines, add, remove, setQty, clear, subtotal, count, open, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
