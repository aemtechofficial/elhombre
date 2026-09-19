import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    handle: varchar("handle", { length: 160 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }).default(""),
    description: text("description").default(""),
    details: jsonb("details").$type<string[]>().default([]),
    priceCents: integer("price_cents").notNull().default(0),
    compareAtCents: integer("compare_at_cents"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    sizes: jsonb("sizes").$type<string[]>().notNull().default(["OS"]),
    category: varchar("category", { length: 80 }).notNull().default("Apparel"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    stock: integer("stock").notNull().default(25),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    isNew: boolean("is_new").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("products_handle_idx").on(t.handle),
    index("products_category_idx").on(t.category),
    index("products_active_idx").on(t.active),
  ]
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

export type OrderItem = {
  handle: string;
  title: string;
  size: string;
  priceCents: number;
  qty: number;
  image: string;
};

export type ShippingInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal?: string;
  note?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 40 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 60 }).default(""),
    shipping: jsonb("shipping").$type<ShippingInfo>().notNull(),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    paymentMethod: varchar("payment_method", { length: 60 })
      .notNull()
      .default("cod"),
    status: varchar("status", { length: 40 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("orders_number_idx").on(t.orderNumber)]
);

export type OrderRow = typeof orders.$inferSelect;

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  group: varchar("group", { length: 80 }).notNull().unique(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productHandle: varchar("product_handle", { length: 160 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    rating: integer("rating").notNull().default(5),
    title: varchar("title", { length: 180 }).default(""),
    body: text("body").notNull(),
    verified: boolean("verified").notNull().default(false),
    approved: boolean("approved").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productHandle)]
);

export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
