import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Shopify-style "schema settings" system.
 * Every group below is editable from /admin (Theme Editor)
 * and stored as JSON in the `settings` table.
 * `getSetting` merges saved data over these defaults, so the
 * storefront always renders even before anything is saved.
 */

export type FieldType = "text" | "textarea" | "checkbox" | "select" | "image";

export type SettingField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  hint?: string;
};

export const SETTING_GROUPS: {
  group: string;
  label: string;
  fields: SettingField[];
}[] = [
  {
    group: "general",
    label: "Store · General",
    fields: [
      { key: "brandName", label: "Brand name", type: "text" },
      { key: "brandSuffix", label: "Logo suffix (dot/char)", type: "text" },
      { key: "tagline", label: "Tagline (SEO + footer)", type: "text" },
      { key: "email", label: "Support email", type: "text" },
      { key: "phone", label: "WhatsApp / Phone", type: "text" },
      { key: "address", label: "Atelier address", type: "text" },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: [
          { label: "PKR (Rs)", value: "PKR" },
          { label: "USD ($)", value: "USD" },
          { label: "GBP (£)", value: "GBP" },
          { label: "EUR (€)", value: "EUR" },
          { label: "AED (د.إ)", value: "AED" },
        ],
      },
      { key: "freeShipOver", label: "Free shipping over (amount)", type: "text" },
      { key: "flatShipping", label: "Flat shipping (amount)", type: "text" },
    ],
  },
  {
    group: "announcement",
    label: "Announcement Bar",
    fields: [
      { key: "enabled", label: "Show announcement bar", type: "checkbox" },
      { key: "text", label: "Text", type: "text" },
      { key: "linkLabel", label: "Link label", type: "text" },
      { key: "linkHref", label: "Link URL", type: "text" },
    ],
  },
  {
    group: "hero",
    label: "Homepage · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow label", type: "text" },
      { key: "titleLine1", label: "Headline · line 1", type: "text" },
      { key: "titleLine2", label: "Headline · line 2 (outlined)", type: "text" },
      { key: "titleLine3", label: "Headline · line 3", type: "text" },
      { key: "subtitle", label: "Sub copy", type: "textarea" },
      { key: "ctaLabel", label: "Primary CTA label", type: "text" },
      { key: "ctaHref", label: "Primary CTA link", type: "text" },
      { key: "cta2Label", label: "Secondary CTA label", type: "text" },
      { key: "cta2Href", label: "Secondary CTA link", type: "text" },
      { key: "image", label: "Hero image", type: "image" },
      { key: "season", label: "Collection label", type: "text" },
    ],
  },
  {
    group: "marquee",
    label: "Marquee Strip",
    fields: [
      { key: "enabled", label: "Show marquee", type: "checkbox" },
      {
        key: "items",
        label: "Items (comma separated)",
        type: "textarea",
        hint: "e.g. Free shipping over Rs 10,000, 20% parfum concentration",
      },
    ],
  },
  {
    group: "home",
    label: "Homepage · Sections",
    fields: [
      { key: "dropTitle", label: "Latest drop · title", type: "text" },
      { key: "dropKicker", label: "Latest drop · kicker", type: "text" },
      { key: "editorialTitle", label: "Editorial · title", type: "text" },
      { key: "editorialBody", label: "Editorial · body", type: "textarea" },
      { key: "editorialCta", label: "Editorial · CTA label", type: "text" },
      { key: "indexTitle", label: "Collection index · title", type: "text" },
      { key: "quote", label: "Big quote", type: "textarea" },
      { key: "quoteAuthor", label: "Quote author", type: "text" },
    ],
  },
  {
    group: "footer",
    label: "Footer & Newsletter",
    fields: [
      { key: "newsletterTitle", label: "Newsletter title", type: "text" },
      { key: "newsletterBody", label: "Newsletter body", type: "textarea" },
      { key: "instagram", label: "Instagram URL", type: "text" },
      { key: "tiktok", label: "TikTok URL", type: "text" },
      { key: "youtube", label: "YouTube URL", type: "text" },
      { key: "copyright", label: "Copyright line", type: "text" },
    ],
  },
  {
    group: "integrations",
    label: "Integrations · Pixels & Analytics",
    fields: [
      {
        key: "metaPixelId",
        label: "Meta Pixel ID (Facebook / Instagram ads)",
        type: "text",
        hint: "Meta Events Manager → Data Sources → Pixel ID. Empty = off.",
      },
      {
        key: "tiktokPixelId",
        label: "TikTok Pixel ID",
        type: "text",
        hint: "TikTok Ads Manager → Tools → Events. Empty = off.",
      },
      {
        key: "gaId",
        label: "Google Analytics 4 ID (G-XXXXXXX)",
        type: "text",
        hint: "GA4 → Admin → Data Streams → Measurement ID. Empty = off.",
      },
    ],
  },
  {
    group: "seo",
    label: "SEO & Social",
    fields: [
      { key: "metaTitle", label: "Default meta title", type: "text" },
      { key: "metaDescription", label: "Default meta description", type: "textarea" },
      { key: "keywords", label: "Keywords (comma separated)", type: "textarea" },
      { key: "ogImage", label: "Default OG image", type: "image" },
    ],
  },
];

export const DEFAULT_SETTINGS: Record<string, Record<string, unknown>> = {
  general: {
    brandName: "EL HOMBRE",
    brandSuffix: ".",
    tagline: "Niche perfumes for the man who never introduces himself twice.",
    email: "hola@elhombre.pk",
    phone: "+92 300 0000000",
    address: "Atelier 09, Gulberg III, Lahore, Pakistan",
    currency: "PKR",
    freeShipOver: "10000",
    flatShipping: "300",
  },
  announcement: {
    enabled: true,
    text: "OUD IMPERIAL EXTRAIT IS LIVE · FREE SHIPPING ACROSS PAKISTAN OVER RS 10,000",
    linkLabel: "SHOP THE DROP",
    linkHref: "/shop",
  },
  hero: {
    eyebrow: "MAISON DE PARFUM · LAHORE",
    titleLine1: "SCENT IS",
    titleLine2: "THE ONLY",
    titleLine3: "MEMORY",
    subtitle:
      "Hand-poured niche perfumes in pure black and pure white. 20% parfum concentration, 72-hour maceration, bottles you will keep long after the last spray. No logos. No noise. Only the man and his scent.",
    ctaLabel: "SHOP THE COLLECTION",
    ctaHref: "/shop",
    cta2Label: "LA CASA · OUR STORY",
    cta2Href: "/about",
    image: "/images/hero.jpg",
    season: "COLLECTION NOIRE · MMXXVI",
  },
  marquee: {
    enabled: true,
    items: "FREE SHIPPING OVER RS 10,000,20% PARFUM CONCENTRATION,72-HOUR MACERATION,DISPATCHED WITHIN 24 HOURS,SEALED & HAND-POURED IN LAHORE,TWO COLOURS. ONE SIGNATURE",
  },
  home: {
    dropTitle: "THE ICONS",
    dropKicker: "BESTSELLERS · RESTOCKED & NUMBERED",
    editorialTitle: "A MAN IS REMEMBERED BY HIS SCENT",
    editorialBody:
      "Clothes are seen. Scent is remembered. EL HOMBRE was built on a single obsession: bottles that look like architecture and juice that lingers like a rumour. Every composition is aged 72 hours, poured by hand, sealed in monochrome glass and numbered · because your signature should never be mass-produced.",
    editorialCta: "READ THE FULL STORY",
    indexTitle: "THE COLLECTION",
    quote:
      "The rarest thing in modern perfumery: a house that refuses colour, refuses logos, and lets the juice do all the talking.",
    quoteAuthor: "AROMA WEEKLY · HOUSE OF THE YEAR 2025",
  },
  footer: {
    newsletterTitle: "JOIN THE HOUSE",
    newsletterBody:
      "Drops sell out in hours. Join the list for early access, batch restocks and scent stories worth reading.",
    instagram: "https://www.instagram.com/elho.mbre123",
    tiktok: "",
    youtube: "",
    copyright: "EL HOMBRE Parfums · All rights reserved.",
  },
  integrations: {
    metaPixelId: "",
    tiktokPixelId: "",
    gaId: "",
  },
  seo: {
    metaTitle: "EL HOMBRE. · Niche Perfumes for Men | Black & White Luxury Fragrances",
    metaDescription:
      "EL HOMBRE is a monochrome perfume house. Hand-poured niche fragrances at 20% parfum concentration · oud, leather, musk and amber in sealed black & white flacons. Dispatched in 24 hours across Pakistan and worldwide.",
    keywords:
      "men perfume pakistan, niche fragrance, oud perfume, el hombre, luxury perfume for men, long lasting perfume, extrait de parfum",
    ogImage: "/images/hero.jpg",
  },
};

const cache = new Map<string, Record<string, unknown>>();

export async function getSetting<T = Record<string, unknown>>(
  group: string
): Promise<T> {
  const defaults = DEFAULT_SETTINGS[group] ?? {};
  try {
    if (cache.has(group)) {
      return { ...defaults, ...cache.get(group) } as T;
    }
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.group, group))
      .limit(1);
    const data = (rows[0]?.data ?? {}) as Record<string, unknown>;
    cache.set(group, data);
    return { ...defaults, ...data } as T;
  } catch {
    return { ...defaults } as T;
  }
}

export function clearSettingsCache() {
  cache.clear();
}

export type SettingsShape = typeof DEFAULT_SETTINGS;
