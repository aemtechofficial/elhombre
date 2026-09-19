import OrderStatusForm from "@/components/order-status-form";
import { db } from "@/db";
import { orders, type OrderRow } from "@/db/schema";
import { formatMoney } from "@/lib/utils";
import { desc } from "drizzle-orm";

export default async function AdminOrders() {
  let rows: OrderRow[] = [];
  try {
    rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(100);
  } catch {
    /* booting */
  }

  if (rows.length === 0) {
    return (
      <div className="border border-ink/15 p-16 text-center">
        <p className="font-display text-3xl font-black text-outline">NO ORDERS YET</p>
        <p className="label-mono text-ash mt-3">
          ORDERS PLACED AT /CHECKOUT WILL APPEAR HERE
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="label-mono text-ash">{rows.length} RECENT ORDERS</p>
      {rows.map((o) => (
        <details key={o.id} className="border border-ink/15 group">
          <summary className="px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 cursor-pointer list-none hover:bg-bone/60 transition-colors">
            <span className="font-display font-black tracking-tight tabular-nums">
              {o.orderNumber}
            </span>
            <span className="label-mono text-ash">
              {new Date(o.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-sm font-bold">{o.name}</span>
            <span className="label-mono text-ash">
              {o.items.reduce((s, i) => s + i.qty, 0)} ITEMS  · {" "}
              {o.paymentMethod.toUpperCase()}
            </span>
            <span className="font-display font-black tabular-nums ml-auto">
              {formatMoney(o.totalCents)}
            </span>
            <OrderStatusForm id={o.id} status={o.status} />
          </summary>
          <div className="border-t border-ink/10 px-5 py-4 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="label-mono text-ash mb-2">ITEMS</p>
              <ul className="space-y-1.5 text-sm">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span>
                      {i.title} <span className="text-ash"> ·  {i.size} × {i.qty}</span>
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(i.priceCents * i.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label-mono text-ash mb-2">CUSTOMER</p>
              <p className="text-sm">
                {o.shipping.name}
                <br />
                {o.email}
                {o.phone && (
                  <>
                    <br />
                    {o.phone}
                  </>
                )}
                <br />
                {o.shipping.address}, {o.shipping.city}, {o.shipping.country}
              </p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
