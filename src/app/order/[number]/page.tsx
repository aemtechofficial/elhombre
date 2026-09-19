import CartCleaner from "@/components/cart-cleaner";
import JsonLd from "@/components/json-ld";
import OrderUpsell from "@/components/order-upsell";
import TrackMount from "@/components/track-mount";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { formatMoney } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const general = await getSetting<{
    currency: string;
    email: string;
    phone: string;
    brandName: string;
  }>("general");

  let order = null;
  let upsell: (typeof products.$inferSelect) | null = null;
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, decodeURIComponent(number)))
      .limit(1);
    order = rows[0] ?? null;
    if (order && order.status === "pending") {
      const notInOrder = order.items.map((i) => i.handle);
      // prefer the travel spray, else any active product not in the order
      const candidates = await db
        .select()
        .from(products)
        .where(eq(products.active, true));
      upsell =
        candidates.find(
          (p) => p.handle === "noir-travel-spray" && !notInOrder.includes(p.handle)
        ) ??
        candidates.find((p) => !notInOrder.includes(p.handle)) ??
        null;
    }
  } catch {
    /* booting */
  }
  if (!order) notFound();

  const waDigits = (general.phone ?? "").replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    `Hello ${general.brandName}! I would like to confirm my COD order ${order.orderNumber}:\n` +
      order.items.map((i) => `• ${i.title} (${i.size}) × ${i.qty}`).join("\n") +
      `\nTotal: ${formatMoney(order.totalCents, general.currency)}\nName: ${order.name}\nCity: ${order.shipping.city}`
  );

  return (
    <main className="px-4 sm:px-8 py-16 sm:py-24 min-h-[70vh]">
      <CartCleaner />
      <TrackMount
        event="Purchase"
        payload={{
          content_ids: order.items.map((i) => i.handle),
          value: order.totalCents / 100,
          currency: general.currency,
          num_items: order.items.reduce((s, i) => s + i.qty, 0),
        }}
      />
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle2 size={42} strokeWidth={1.25} className="mx-auto" />
        <p className="label-mono text-ash mt-6">ORDER CONFIRMED</p>
        <h1 className="font-display font-black tracking-[-0.035em] text-[clamp(2.2rem,7vw,4.5rem)] leading-[0.95] mt-3">
          THANK YOU, {order.name.split(" ")[0].toUpperCase()}.
        </h1>
        <p className="mt-4 text-sm text-coal/75 leading-relaxed max-w-md mx-auto">
          Your order{" "}
          <span className="font-bold text-ink tabular-nums">
            {order.orderNumber}
          </span>{" "}
          is locked in. Confirmation is on its way to {order.email} · and your
          pieces ship within 24 hours.
        </p>
        <p className="label-mono text-ash mt-3">
          PAYMENT: {order.paymentMethod === "cod" ? "CASH ON DELIVERY" : "BANK TRANSFER"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-12 border border-ink/15">
        <div className="px-6 py-4 border-b border-ink/10 flex justify-between label-mono text-ash">
          <span>RECEIPT</span>
          <span>{order.orderNumber}</span>
        </div>
        <ul className="divide-y divide-ink/10">
          {order.items.map((item, i) => (
            <li key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="relative w-12 h-14 bg-bone overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover img-bw"
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm">{item.title}</p>
                <p className="label-mono text-ash text-[10px]">
                  SIZE {item.size} × {item.qty}
                </p>
              </div>
              <p className="text-sm tabular-nums">
                {formatMoney(item.priceCents * item.qty, general.currency)}
              </p>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-ink/10 space-y-1.5 text-sm">
          <div className="flex justify-between text-coal/70">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatMoney(order.subtotalCents, general.currency)}
            </span>
          </div>
          <div className="flex justify-between text-coal/70">
            <span>Shipping</span>
            <span className="tabular-nums">
              {order.shippingCents === 0
                ? "FREE"
                : formatMoney(order.shippingCents, general.currency)}
            </span>
          </div>
          <div className="flex justify-between font-display font-black text-lg pt-2">
            <span>TOTAL</span>
            <span className="tabular-nums">
              {formatMoney(order.totalCents, general.currency)}
            </span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-ink/10 bg-bone">
          <p className="label-mono text-ash">SHIPPING TO</p>
          <p className="text-sm mt-1.5">
            {order.shipping.name} · {order.shipping.address}, {order.shipping.city},{" "}
            {order.shipping.country}
          </p>
        </div>
      </div>

      {upsell && (
        <OrderUpsell
          orderNumber={order.orderNumber}
          product={upsell}
          currency={general.currency}
        />
      )}

      <div className="text-center mt-12 space-y-4">
        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="btn-block btn-dark w-full sm:w-auto"
          >
            <MessageCircle size={16} /> CONFIRM ORDER ON WHATSAPP
          </a>
        )}
        <div>
          <Link href="/shop" className="btn-block btn-ghost text-ink">
            Continue shopping <ArrowRight size={16} />
          </Link>
        </div>
        <p className="label-mono text-ash mt-2">
          QUESTIONS? {general.email}
        </p>
      </div>
    </main>
  );
}
