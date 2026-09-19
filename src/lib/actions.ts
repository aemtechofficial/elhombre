"use server";

import { db } from "@/db";
import {
  contacts,
  orders,
  products,
  reviews,
  settings,
  subscribers,
  type OrderItem,
  type ShippingInfo,
} from "@/db/schema";
import {
  DEFAULT_SETTINGS,
  SETTING_GROUPS,
  clearSettingsCache,
  getSetting,
} from "@/lib/settings";
import { slugify, toCents } from "@/lib/utils";
import { eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/* ------------------------------ Admin auth ------------------------------ */

const ADMIN_COOKIE = "noir_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "noir2024";

export async function adminLogin(_: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password === ADMIN_PASSWORD) {
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, password, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { ok: true as const, error: "" };
  }
  return { ok: false as const, error: "Invalid password. Try again." };
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === ADMIN_PASSWORD;
}

/* --------------------------- Settings (schema) -------------------------- */

export async function saveSettingGroup(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const group = String(formData.get("group") ?? "");
  const def = SETTING_GROUPS.find((g) => g.group === group);
  if (!def) throw new Error("Unknown group");

  const data: Record<string, unknown> = {};
  for (const field of def.fields) {
    if (field.type === "checkbox") {
      data[field.key] = formData.get(field.key) === "on";
    } else {
      data[field.key] = String(formData.get(field.key) ?? "");
    }
  }

  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.group, group))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ data, updatedAt: new Date() })
      .where(eq(settings.group, group));
  } else {
    await db.insert(settings).values({ group, data });
  }
  clearSettingsCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function resetSettingGroup(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const group = String(formData.get("group") ?? "");
  const data = DEFAULT_SETTINGS[group] ?? {};
  const existing = await db
    .select({ id: settings.id })
    .from(settings)
    .where(eq(settings.group, group))
    .limit(1);
  if (existing.length) {
    await db
      .update(settings)
      .set({ data, updatedAt: new Date() })
      .where(eq(settings.group, group));
  } else {
    await db.insert(settings).values({ group, data });
  }
  clearSettingsCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

/* -------------------------------- Products ------------------------------ */

export async function saveProduct(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = Number(formData.get("id") ?? 0) || null;
  const title = String(formData.get("title") ?? "").trim();
  let handle = String(formData.get("handle") ?? "").trim();
  if (!handle) handle = slugify(title);
  handle = slugify(handle);
  if (!title || !handle) throw new Error("Title required");

  const images = [1, 2, 3]
    .map((i) => String(formData.get(`image${i}`) ?? "").trim())
    .filter(Boolean);

  const values = {
    handle,
    title,
    subtitle: String(formData.get("subtitle") ?? ""),
    description: String(formData.get("description") ?? ""),
    details: String(formData.get("details") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    priceCents: toCents(String(formData.get("price") ?? "0")),
    compareAtCents: formData.get("compareAt")
      ? toCents(String(formData.get("compareAt")))
      : null,
    images: images.length ? images : ["/images/products/noir.jpg"],
    sizes: formData.getAll("sizes").map(String),
    category: String(formData.get("category") ?? "Apparel"),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    stock: Number(formData.get("stock") ?? 0) || 0,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    isNew: formData.get("isNew") === "on",
  };
  if (values.sizes.length === 0) values.sizes = ["OS"];

  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    await db
      .insert(products)
      .values(values)
      .onConflictDoNothing({ target: products.handle });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  redirect("/admin?tab=products");
}

export async function deleteProduct(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = Number(formData.get("id") ?? 0);
  if (id) await db.delete(products).where(eq(products.id, id));
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

/* --------------------------------- Orders ------------------------------- */

export async function createOrder(_: unknown, formData: FormData) {
  let orderNumber = "";
  try {
    const rawItems = String(formData.get("items") ?? "[]");
    const parsed = JSON.parse(rawItems) as {
      handle: string;
      size: string;
      qty: number;
    }[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { ok: false as const, error: "Your cart is empty." };
    }

    const handles = parsed.map((p) => p.handle);
    const rows = await db
      .select()
      .from(products)
      .where(inArray(products.handle, handles));

    // Trust server-side prices, not the client.
    const items: OrderItem[] = [];
    for (const line of parsed) {
      const p = rows.find((r) => r.handle === line.handle && r.active);
      if (!p) continue;
      const qty = Math.max(1, Math.min(10, Math.floor(line.qty || 1)));
      items.push({
        handle: p.handle,
        title: p.title,
        size: p.sizes.includes(line.size) ? line.size : p.sizes[0],
        priceCents: p.priceCents,
        qty,
        image: p.images[0] ?? "",
      });
    }
    if (items.length === 0) {
      return { ok: false as const, error: "Those items are no longer available." };
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();
    if (!name || !email.includes("@") || !address || !city || !country) {
      return {
        ok: false as const,
        error: "Please fill in all required shipping fields.",
      };
    }

    const shipping: ShippingInfo = {
      name,
      email,
      phone,
      address,
      city,
      country,
      postal: String(formData.get("postal") ?? ""),
      note: String(formData.get("note") ?? ""),
    };

    const subtotal = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const freeOver = toCents(String(formData.get("freeShipOver") ?? "250"));
    const flat = toCents(String(formData.get("flatShipping") ?? "12"));
    const shippingCents = subtotal >= freeOver ? 0 : flat;

    orderNumber = `EH-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 90 + 10
    )}`;

    await db.insert(orders).values({
      orderNumber,
      email,
      name,
      phone,
      shipping,
      items,
      subtotalCents: subtotal,
      shippingCents,
      totalCents: subtotal + shippingCents,
      paymentMethod: String(formData.get("payment") ?? "cod"),
      status: "pending",
    });

    // Best-effort stock decrement.
    for (const item of items) {
      await db
        .update(products)
        .set({ stock: sql`greatest(0, ${products.stock} - ${item.qty})` })
        .where(eq(products.handle, item.handle));
    }
  } catch (e) {
    console.error(e);
    return {
      ok: false as const,
      error: "Something went wrong placing your order. Please retry.",
    };
  }
  redirect(`/order/${orderNumber}`);
}

/* ------------------------- COD Express (Releasit-style) ------------------------- */

export async function placeQuickOrder(_: unknown, formData: FormData) {
  let orderNumber = "";
  try {
    const handle = String(formData.get("handle") ?? "");
    const size = String(formData.get("size") ?? "");
    const qty = Math.max(1, Math.min(5, Number(formData.get("qty") ?? 1)));

    const rows = await db
      .select()
      .from(products)
      .where(eq(products.handle, handle))
      .limit(1);
    const p = rows[0];
    if (!p || !p.active) {
      return { ok: false as const, error: "This scent is unavailable right now." };
    }

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    if (!name || phone.replace(/\D/g, "").length < 10 || !address || !city) {
      return {
        ok: false as const,
        error: "Name, a valid phone number, address and city are all required.",
      };
    }

    const general = await getSetting<{
      freeShipOver: string;
      flatShipping: string;
    }>("general");

    const finalSize = p.sizes.includes(size) ? size : p.sizes[0];
    const subtotal = p.priceCents * qty;
    const freeOver = toCents(general.freeShipOver || "10000");
    const flat = toCents(general.flatShipping || "300");
    const shippingCents = subtotal >= freeOver ? 0 : flat;

    orderNumber = `EH-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 90 + 10
    )}`;

    const shipping: ShippingInfo = {
      name,
      email: "",
      phone,
      address,
      city,
      country: "Pakistan",
      note: "COD EXPRESS ORDER",
    };

    await db.insert(orders).values({
      orderNumber,
      email: `wa-${phone.replace(/\D/g, "")}@cod.express`,
      name,
      phone,
      shipping,
      items: [
        {
          handle: p.handle,
          title: p.title,
          size: finalSize,
          priceCents: p.priceCents,
          qty,
          image: p.images[0] ?? "",
        },
      ],
      subtotalCents: subtotal,
      shippingCents,
      totalCents: subtotal + shippingCents,
      paymentMethod: "cod",
      status: "pending",
    });

    await db
      .update(products)
      .set({ stock: sql`greatest(0, ${products.stock} - ${qty})` })
      .where(eq(products.handle, p.handle));
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not place the order. Please try again." };
  }
  redirect(`/order/${orderNumber}`);
}

/* -------------------- Post-purchase upsell (one click) -------------------- */

const UPSELL_DISCOUNT = 0.15; // 15% off · post-purchase exclusive

export async function addUpsellToOrder(_: unknown, formData: FormData) {
  try {
    const orderNumber = String(formData.get("orderNumber") ?? "");
    const handle = String(formData.get("handle") ?? "");
    if (!orderNumber || !handle) throw new Error("bad request");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    if (!order || order.status !== "pending") throw new Error("Order locked");

    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.handle, handle))
      .limit(1);
    if (!p || !p.active) throw new Error("Unavailable");

    const discountedPrice = Math.round(p.priceCents * (1 - UPSELL_DISCOUNT));
    const items = [...order.items];
    const existing = items.findIndex((i) => i.handle === p.handle);
    if (existing >= 0) {
      items[existing] = { ...items[existing], qty: Math.min(10, items[existing].qty + 1) };
    } else {
      items.push({
        handle: p.handle,
        title: p.title,
        size: p.sizes[0],
        priceCents: discountedPrice,
        qty: 1,
        image: p.images[0] ?? "",
      });
    }

    const newSubtotal = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const newTotal = newSubtotal + order.shippingCents;

    await db
      .update(orders)
      .set({ items, subtotalCents: newSubtotal, totalCents: newTotal })
      .where(eq(orders.orderNumber, orderNumber));

    revalidatePath(`/order/${orderNumber}`);
    return {
      ok: true as const,
      error: "",
      total: newTotal,
      message: `${p.title} added · new total below.`,
    };
  } catch {
    return { ok: false as const, error: "Could not add · try again.", total: 0, message: "" };
  }
}

/* --------------------------------- Reviews -------------------------------- */

export async function submitReview(_: unknown, formData: FormData) {
  const handle = String(formData.get("handle") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating") ?? 5)));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!handle || !name || body.length < 10) {
    return {
      ok: false as const,
      message: "Please add your name and a review of at least 10 characters.",
    };
  }
  try {
    await db.insert(reviews).values({
      productHandle: handle,
      name,
      rating,
      title,
      body,
      verified: false,
      approved: true,
    });
    revalidatePath(`/product/${handle}`);
    return {
      ok: true as const,
      message: "Thank you. Your review is now live.",
    };
  } catch {
    return { ok: false as const, message: "Save nahi hua · dobara try karein." };
  }
}

export async function setReviewApproval(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = Number(formData.get("id") ?? 0);
  const approved = formData.get("approved") === "1";
  if (id) await db.update(reviews).set({ approved }).where(eq(reviews.id, id));
  revalidatePath("/admin");
}

export async function deleteReview(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = Number(formData.get("id") ?? 0);
  if (id) await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = Number(formData.get("id") ?? 0);
  const status = String(formData.get("status") ?? "pending");
  if (id) await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin");
}

/* ----------------------------- Lead capture ----------------------------- */

export async function subscribe(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false as const, message: "Enter a valid email address." };
  }
  try {
    await db
      .insert(subscribers)
      .values({ email })
      .onConflictDoNothing({ target: subscribers.email });
    return { ok: true as const, message: "You're on the list. Welcome to the void." };
  } catch {
    return { ok: false as const, message: "Something went wrong. Try again." };
  }
}

export async function sendContact(_: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  if (!name || !email.includes("@") || !message) {
    return { ok: false as const, message: "Please complete all fields." };
  }
  try {
    await db.insert(contacts).values({ name, email, subject, message });
    return {
      ok: true as const,
      message: "Message received. The studio replies within 24 hours.",
    };
  } catch {
    return { ok: false as const, message: "Something went wrong. Try again." };
  }
}
