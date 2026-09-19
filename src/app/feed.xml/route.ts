import { db } from "@/db";
import { products } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function esc(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Meta Catalog / Google Merchant product feed.
 * Paste this URL into Meta Commerce Manager → Data Sources → Scheduled feed:
 *   https://your-domain.com/feed.xml
 * Powers: Instagram Shop tagging, dynamic retargeting ads, Advantage+ shopping.
 */
export async function GET() {
  const general = await getSetting<{
    brandName: string;
    brandSuffix: string;
    currency: string;
  }>("general");
  const seo = await getSetting<{ metaTitle: string; metaDescription: string }>(
    "seo"
  );

  let rows: (typeof products.$inferSelect)[] = [];
  try {
    rows = await db.select().from(products).where(eq(products.active, true));
  } catch {
    /* DB booting */
  }

  const brand = esc(`${general.brandName}${general.brandSuffix}`);
  const items = rows
    .map((p) => {
      const onSale = p.compareAtCents && p.compareAtCents > p.priceCents;
      const price = `${((onSale ? p.compareAtCents : p.priceCents)! / 100).toFixed(0)} ${general.currency}`;
      const sale = onSale
        ? `\n      <g:sale_price>${(p.priceCents / 100).toFixed(0)} ${general.currency}</g:sale_price>`
        : "";
      const extraImages = (p.images ?? [])
        .slice(1)
        .map((img) => `\n      <g:additional_image_link>${SITE_URL}${img}</g:additional_image_link>`)
        .join("");
      return `    <item>
      <g:id>${esc(p.handle)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc((p.description ?? "").slice(0, 4000))}</g:description>
      <g:link>${SITE_URL}/product/${esc(p.handle)}</g:link>
      <g:image_link>${SITE_URL}${esc(p.images[0] ?? "")}</g:image_link>${extraImages}
      <g:brand>${brand}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:price>${price}</g:price>${sale}
      <g:product_type>${esc(p.category)}</g:product_type>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(seo.metaTitle)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(seo.metaDescription)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
