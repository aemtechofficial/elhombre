"use client";

import { useCart } from "@/components/cart-context";
import { useEffect } from "react";

/** Mounted on the order-confirmation page: empties the cart exactly once. */
export default function CartCleaner() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
