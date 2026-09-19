export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs ",
  GBP: "£",
  EUR: "€",
  AED: "د.إ ",
};

export function formatMoney(cents: number, currency = "USD") {
  const amount = cents / 100;
  const sym = SYMBOLS[currency] ?? `${currency} `;
  const num =
    currency === "PKR"
      ? Math.round(amount).toLocaleString("en-PK")
      : amount.toLocaleString("en-US", {
          minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        });
  return `${sym}${num}`;
}

export function toCents(value: string | number): number {
  const n = typeof value === "number" ? value : parseFloat(value || "0");
  return Math.round(n * 100);
}

export function slugify(input: string) {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

export const CATEGORIES = [
  "Eau de Parfum",
  "Extrait de Parfum",
  "Discovery & Travel",
] as const;

export const ALL_SIZES = ["2ML", "10ML", "30ML", "50ML", "100ML", "OS"] as const;

export const PRODUCT_IMAGES = [
  "/images/products/noir.jpg",
  "/images/products/blanco.jpg",
  "/images/products/oud.jpg",
  "/images/products/ambar.jpg",
  "/images/products/cuir.jpg",
  "/images/products/vetiver.jpg",
  "/images/products/azafran.jpg",
  "/images/products/discovery.jpg",
  "/images/products/travel.jpg",
  "/images/products/still.jpg",
  "/images/hero.jpg",
  "/images/editorial.jpg",
] as const;

export function productUrl(handle: string) {
  return `/product/${handle}`;
}
