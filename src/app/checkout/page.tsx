import CheckoutForm from "@/components/checkout-form";
import { getSetting } from "@/lib/settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout · ships within 24 hours, duties included.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const general = await getSetting<{
    currency: string;
    freeShipOver: string;
    flatShipping: string;
  }>("general");

  return (
    <main className="px-4 sm:px-8 py-14 sm:py-20 min-h-[70vh]">
      <p className="label-mono text-ash mb-4">FINAL STEP</p>
      <h1 className="font-display font-black tracking-[-0.04em] text-[clamp(2.5rem,8vw,6rem)] leading-[0.9]">
        CHECKOUT
      </h1>
      <CheckoutForm
        currency={general.currency}
        freeShipOver={parseFloat(general.freeShipOver || "250") * 100}
        flatShipping={parseFloat(general.flatShipping || "12") * 100}
      />
    </main>
  );
}
