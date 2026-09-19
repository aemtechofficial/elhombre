import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/faq",
    "/shipping",
    "/contact",
    "/search",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ handle: products.handle, createdAt: products.createdAt })
      .from(products)
      .where(eq(products.active, true));
    productRoutes = rows.map((r) => ({
      url: `${SITE_URL}/product/${r.handle}`,
      lastModified: r.createdAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    /* DB not ready */
  }

  return [...staticRoutes, ...productRoutes];
}
