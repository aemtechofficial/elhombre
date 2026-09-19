"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.11, wheelMultiplier: 1.05 }}>
      <CartProvider>{children}</CartProvider>
    </ReactLenis>
  );
}
