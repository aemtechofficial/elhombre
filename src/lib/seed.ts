import { db } from "@/db";
import {
  products,
  reviews,
  type NewProductRow,
  type NewReviewRow,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export const SEED_REVIEWS: NewReviewRow[] = [
  {
    productHandle: "el-hombre-noir",
    name: "Ahmed Raza",
    rating: 5,
    title: "Nuclear projection, classy drydown",
    body: "Two sprays at 9am and colleagues were still asking about it at 6pm. The leather-oud combination is strong but never headache-heavy. The bottle's weight alone feels premium. Best purchase this year.",
    verified: true,
  },
  {
    productHandle: "el-hombre-noir",
    name: "Bilal Sheikh",
    rating: 5,
    title: "Better than my designer bottles",
    body: "I own Sauvage and Bleu de Chanel. EL HOMBRE NOIR outlasts both in Lahore heat. Seal, batch number, packaging, everything is boutique grade. COD arrived in two days.",
    verified: true,
  },
  {
    productHandle: "el-hombre-noir",
    name: "Hamza Tariq",
    rating: 4,
    title: "Strong stuff, spray lightly",
    body: "Genuinely 10+ hours of longevity. The opening is a bit sharp for the first ten minutes, then it settles into this dark leathery cloud. Recommend for evening wear. Will try Blanco next.",
    verified: true,
  },
  {
    productHandle: "oud-imperial",
    name: "Faisal Mahmood",
    rating: 5,
    title: "King of wedding season",
    body: "Wore it to a walima and three cousins asked for the name before dinner ended. The saffron-rose opening over real oud competes with niche houses five times the price. The sealed, numbered flacon feels special.",
    verified: true,
  },
  {
    productHandle: "oud-imperial",
    name: "Zain Abbas",
    rating: 5,
    title: "Worth every rupee",
    body: "30% extrait is no joke. One spray on the collar and my shawl carried the scent for a week. Not for teenagers; this is grown-man territory.",
    verified: true,
  },
  {
    productHandle: "the-discovery-set",
    name: "Waqas Younis",
    rating: 5,
    title: "Smartest way to start",
    body: "Tried all seven scents before committing to a full bottle. Azafran Negro is now my signature. The voucher discounted the full bottle nicely, and the coffret is premium enough to gift directly.",
    verified: true,
  },
  {
    productHandle: "the-discovery-set",
    name: "Danish Ali",
    rating: 4,
    title: "Great sampler, fast delivery",
    body: "The vials are proper glass atomisers, not those tiny dabbers. Ordered Monday, it reached Karachi by Wednesday.",
    verified: true,
  },
  {
    productHandle: "blanco-absoluto",
    name: "Saad Qureshi",
    rating: 5,
    title: "Clean office scent, finally",
    body: "Soft, expensive smelling, zero headache. Exactly what I wanted for daily wear. Musk and iris done right, with compliments from day one.",
    verified: true,
  },
  {
    productHandle: "ambar-nocturno",
    name: "Usman Khalid",
    rating: 5,
    title: "Winter weapon",
    body: "Tobacco, vanilla and amber; it smells like a cigar lounge in the best way. It projected through my jacket in Murree fog. Beast mode.",
    verified: true,
  },
  {
    productHandle: "azafran-negro",
    name: "Omar Farooq",
    rating: 5,
    title: "Most complimented thing I own",
    body: "Nothing in the local market smells like this. Saffron and black rose over a smoky suede base; people lean in to ask what it is. Sillage is enormous for the first four hours.",
    verified: true,
  },
];

export async function ensureSeeded() {
  try {
    const res = await db.execute(
      sql`select count(*)::int as c from products`
    );
    const count = (res.rows?.[0] as { c: number } | undefined)?.c ?? 0;
    if (count === 0) {
      await db.insert(products).values(SEED_PRODUCTS);
    }
    const res2 = await db.execute(
      sql`select count(*)::int as c from reviews`
    );
    const rcount = (res2.rows?.[0] as { c: number } | undefined)?.c ?? 0;
    if (rcount === 0) {
      await db.insert(reviews).values(SEED_REVIEWS);
    }
  } catch {
    // DB not migrated yet · storefront pages handle empty state gracefully.
  }
}

export const SEED_PRODUCTS: NewProductRow[] = [
  {
    handle: "el-hombre-noir",
    title: "EL HOMBRE NOIR",
    subtitle: "Eau de Parfum · Smoked Oud & Leather",
    description:
      "The signature of the house. Black pepper and cold bergamot strike first, then a heart of smoked leather and iris settles into Laotian oud and dark amber. This is the scent of a man who enters quietly and is never forgotten. 20% parfum concentration · two sprays, twelve hours, one legend.",
    details: [
      "Top · black pepper, bergamot, green cardamom",
      "Heart · smoked leather, orris butter, cedarwood",
      "Base · Laotian oud, dark amber, white musk",
      "20% parfum concentration · projects 12+ hours",
      "Hand-poured, 72-hour maceration, batch-numbered",
    ],
    priceCents: 890000,
    compareAtCents: 1050000,
    images: ["/images/products/noir.jpg", "/images/hero.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["oud", "leather", "signature", "bestseller", "dark", "evening"],
    stock: 46,
    featured: true,
    isNew: true,
  },
  {
    handle: "blanco-absoluto",
    title: "BLANCO ABSOLUTO",
    subtitle: "Eau de Parfum · White Musk & Iris",
    description:
      "The other side of the man. Crisp aldehydes and Italian iris over a bed of white musk and sandalwood cream · clean enough for the boardroom, magnetic enough for midnight. The white flacon is frosted glass; the scent is pure restraint.",
    details: [
      "Top · white aldehydes, Calabrian bergamot",
      "Heart · Italian iris, cotton flower, orris",
      "Base · white musk, sandalwood cream, ambrette",
      "20% parfum concentration · skin scent that lasts 10h",
      "Frosted white flacon, magnetic cap",
    ],
    priceCents: 780000,
    images: ["/images/products/blanco.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["musk", "clean", "white", "daily", "office", "fresh"],
    stock: 60,
    featured: true,
    isNew: true,
  },
  {
    handle: "oud-imperial",
    title: "OUD IMPERIAL",
    subtitle: "Extrait de Parfum · Royal Oud & Taif Rose",
    description:
      "Our crown, at extrait strength. Hindi oud aged eight years meets Taif rose absolute and crushed saffron, anchored in labdanum and royal amber. 30% concentration in a sealed onyx flacon. One spray on the collar · the room knows who arrived.",
    details: [
      "Top · crushed saffron, cinnamon bark",
      "Heart · Taif rose absolute, aged Hindi oud",
      "Base · labdanum, royal amber, castoreum",
      "30% extrait · a single spray carries 14+ hours",
      "Onyx flacon, wax-dipped seal, numbered 1–200",
    ],
    priceCents: 1450000,
    compareAtCents: 1600000,
    images: ["/images/products/oud.jpg"],
    sizes: ["30ML", "50ML"],
    category: "Extrait de Parfum",
    tags: ["oud", "rose", "saffron", "extrait", "luxury", "evening"],
    stock: 20,
    featured: true,
    isNew: true,
  },
  {
    handle: "ambar-nocturno",
    title: "ÁMBAR NOCTURNO",
    subtitle: "Eau de Parfum · Amber, Tobacco & Vanilla",
    description:
      "Warmth weaponised. Golden amber and pipe tobacco folded into bourbon vanilla and dried fig · the olfactory equivalent of a dimly lit lounge and a confident smile. Sweet, never sugary. Made for winter nights and close conversations.",
    details: [
      "Top · dried fig, rum accord, clove",
      "Heart · pipe tobacco, honey, heliotrope",
      "Base · golden amber, bourbon vanilla, benzoin",
      "20% parfum concentration · huge winter projection",
      "Amber glass flacon, hand-applied label",
    ],
    priceCents: 920000,
    images: ["/images/products/ambar.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["amber", "tobacco", "vanilla", "winter", "warm", "sweet"],
    stock: 38,
    featured: true,
    isNew: false,
  },
  {
    handle: "cuir-de-hombre",
    title: "CUIR DE HOMBRE",
    subtitle: "Eau de Parfum · Birch, Smoke & Vetiver",
    description:
      "Old-money leather. Russian birch tar and worn saddle leather cut with smoky vetiver and a whisper of raspberry leaf. It smells like a vintage Jaguar interior and perfectly tailored shoulders. Not for boys. Not even slightly.",
    details: [
      "Top · raspberry leaf, juniper, bergamot",
      "Heart · Russian birch tar, saddle leather, styrax",
      "Base · smoky vetiver, papyrus, dark musk",
      "20% parfum concentration · 11h, dry and smoky",
      "Matte black flacon, leather-wrapped cap",
    ],
    priceCents: 1080000,
    images: ["/images/products/cuir.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["leather", "smoke", "vetiver", "masculine", "evening"],
    stock: 29,
    featured: false,
    isNew: false,
  },
  {
    handle: "vetiver-blanc",
    title: "VÉTIVER BLANC",
    subtitle: "Eau de Parfum · Mineral Vetiver & Citrus",
    description:
      "Sunlight through a white shirt. Haitian vetiver washed clean with yuzu, sea salt and flint · a fresh scent with a spine, built to survive Pakistani summers without going flat by noon.",
    details: [
      "Top · yuzu, grapefruit, sea salt",
      "Heart · Haitian vetiver, flint, white tea",
      "Base · ambroxan, clean musk, cedar",
      "20% parfum concentration · fresh for 9h in heat",
      "Polished white flacon, steel collar",
    ],
    priceCents: 820000,
    images: ["/images/products/vetiver.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["vetiver", "citrus", "fresh", "summer", "daily"],
    stock: 44,
    featured: false,
    isNew: false,
  },
  {
    handle: "azafran-negro",
    title: "AZAFRÁN NEGRO",
    subtitle: "Eau de Parfum · Black Saffron & Rosewood",
    description:
      "Persian saffron gone dark. Black rose and saffron threads dissolved into palo santo and suede · opulent, hypnotic, and absolutely not available anywhere else in the country. Our most complimented composition, three years running.",
    details: [
      "Top · Persian saffron, black rose, pink pepper",
      "Heart · palo santo, geranium, incense",
      "Base · suede, tonka, dark amberwood",
      "20% parfum concentration · enormous trail (sillage)",
      "Smoke-glass flacon, numbered batch",
    ],
    priceCents: 1190000,
    images: ["/images/products/azafran.jpg"],
    sizes: ["50ML", "100ML"],
    category: "Eau de Parfum",
    tags: ["saffron", "rose", "compliment", "evening", "smoke"],
    stock: 25,
    featured: true,
    isNew: true,
  },
  {
    handle: "the-discovery-set",
    title: "THE DISCOVERY SET",
    subtitle: "7 × 2ML · Every Icon, One Coffret",
    description:
      "Meet the whole house before you commit. Seven 2ml vials in a matte black coffret · every EDP in the collection plus Oud Imperial extrait · with a Rs 3,000 voucher toward any full bottle. The smartest first move a man can make.",
    details: [
      "7 × 2ml glass vials with atomisers",
      "Includes Oud Imperial extrait (worth Rs 2,900 alone)",
      "Rs 3,000 voucher toward any full bottle",
      "Matte black rigid coffret · gift-ready",
      "The definitive way to find your signature",
    ],
    priceCents: 350000,
    images: ["/images/products/discovery.jpg"],
    sizes: ["OS"],
    category: "Discovery & Travel",
    tags: ["discovery", "set", "gift", "samples", "coffret"],
    stock: 70,
    featured: false,
    isNew: true,
  },
  {
    handle: "noir-travel-spray",
    title: "NOIR TRAVEL SPRAY",
    subtitle: "10ML Atomiser · EL HOMBRE NOIR EDP",
    description:
      "The signature, pocket-sized. Our bestselling EL HOMBRE NOIR decanted into a machined black travel atomiser with a twist-lock mechanism · gym bag, glove box, carry-on. Refills at any boutique for half price, forever.",
    details: [
      "10ml of EL HOMBRE NOIR EDP (20% concentration)",
      "Machined black aluminium atomiser, twist-lock",
      "Airline-safe, leak-proof, pocket-sized",
      "Refillable · refills at 50% price, forever",
      "Same hand-poured batch as the full flacons",
    ],
    priceCents: 290000,
    images: ["/images/products/travel.jpg"],
    sizes: ["OS"],
    category: "Discovery & Travel",
    tags: ["travel", "atomiser", "10ml", "noir", "gift"],
    stock: 85,
    featured: false,
    isNew: false,
  },
];
