import AdminLogin from "@/components/admin-login";
import AdminOrders from "@/components/admin-orders";
import AdminProducts from "@/components/admin-products";
import AdminReviews from "@/components/admin-reviews";
import AdminSettings from "@/components/admin-settings";
import { adminLogout, isAdmin } from "@/lib/actions";
import {
  LayoutGrid,
  LogOut,
  Package,
  Settings2,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Theme Editor & Catalogue",
  robots: { index: false, follow: false },
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "settings", label: "Theme Settings", icon: Settings2 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "reviews", label: "Reviews", icon: Star },
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string; new?: string }>;
}) {
  if (!(await isAdmin())) {
    return (
      <main>
        <AdminLogin />
      </main>
    );
  }

  const sp = await searchParams;
  const tab = sp.tab ?? "dashboard";
  const editId = sp.edit ? Number(sp.edit) : null;

  return (
    <main className="px-4 sm:px-8 py-10 min-h-[80vh]">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-ink/10">
        <div>
          <h1 className="font-display font-black tracking-[-0.03em] text-3xl sm:text-4xl">
            CONTROL ROOM<span className="text-ash">.</span>
          </h1>
          <p className="label-mono text-ash mt-1.5">
            THEME EDITOR + CATALOGUE + ORDERS · EVERYTHING, ONE PLACE
          </p>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="btn-block btn-ghost text-ink py-3 px-5">
            <LogOut size={14} /> Logout
          </button>
        </form>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 border-b border-ink/10 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            className={`label-mono flex items-center gap-2 px-5 py-4 whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-ink font-bold"
                : "border-transparent text-ash hover:text-ink"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </Link>
        ))}
      </nav>

      <div className="pt-8">
        {tab === "dashboard" && <Dashboard />}
        {tab === "settings" && <AdminSettings />}
        {tab === "products" && (
          <AdminProducts editId={editId} isNew={sp.new === "1"} />
        )}
        {tab === "orders" && <AdminOrders />}
        {tab === "reviews" && <AdminReviews />}
      </div>
    </main>
  );
}

import { db } from "@/db";
import { orders, products, subscribers } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { count, sum } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

async function Dashboard() {
  const general = await getSetting<{ currency: string }>("general");
  let stats = { products: 0, orders: 0, revenue: 0, subscribers: 0 };
  try {
    const [p] = await db.select({ c: count() }).from(products);
    const [o] = await db
      .select({ c: count(), r: sum(orders.totalCents) })
      .from(orders);
    const [s] = await db.select({ c: count() }).from(subscribers);
    stats = {
      products: p?.c ?? 0,
      orders: o?.c ?? 0,
      revenue: Number(o?.r ?? 0),
      subscribers: s?.c ?? 0,
    };
  } catch {
    /* booting */
  }

  const cards = [
    { label: "LIVE PRODUCTS", value: String(stats.products), href: "/admin?tab=products" },
    { label: "TOTAL ORDERS", value: String(stats.orders), href: "/admin?tab=orders" },
    { label: "REVENUE", value: formatMoney(stats.revenue, general.currency), href: "/admin?tab=orders" },
    { label: "SUBSCRIBERS", value: String(stats.subscribers), href: "/admin?tab=settings" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-paper p-6 sm:p-8 hover:bg-ink hover:text-paper transition-colors group"
          >
            <p className="label-mono text-ash group-hover:text-paper/60">
              {c.label}
            </p>
            <p className="font-display font-black text-3xl sm:text-4xl mt-3 tabular-nums">
              {c.value}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "EDIT THEME",
            body: "Announcement, hero, marquee, footer, SEO. No code required.",
            href: "/admin?tab=settings",
          },
          {
            title: "ADD A PRODUCT",
            body: "New drop? Live in under two minutes.",
            href: "/admin?tab=products&new=1",
          },
          {
            title: "VIEW STOREFRONT",
            body: "See exactly what your customers see.",
            href: "/",
          },
        ].map((q) => (
          <Link
            key={q.title}
            href={q.href}
            className="border border-ink/15 p-6 hover:border-ink transition-colors"
          >
            <p className="font-display font-black tracking-tight">{q.title}</p>
            <p className="text-sm text-coal/65 mt-2">{q.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
