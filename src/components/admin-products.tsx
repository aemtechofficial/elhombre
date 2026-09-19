import { deleteProduct, saveProduct } from "@/lib/actions";
import { db } from "@/db";
import { products, type ProductRow } from "@/db/schema";
import {
  ALL_SIZES,
  CATEGORIES,
  PRODUCT_IMAGES,
  formatMoney,
} from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function AdminProducts({
  editId,
  isNew,
}: {
  editId: number | null;
  isNew: boolean;
}) {
  let all: ProductRow[] = [];
  let editing: ProductRow | null = null;
  try {
    all = await db.select().from(products).orderBy(desc(products.id));
    if (editId) {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.id, editId))
        .limit(1);
      editing = rows[0] ?? null;
    }
  } catch {
    /* booting */
  }

  const showForm = isNew || editing;

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex items-center justify-between">
          <p className="label-mono text-ash">
            {all.length} PRODUCT{all.length === 1 ? "" : "S"} IN CATALOGUE
          </p>
          <Link href="/admin?tab=products&new=1" className="btn-block btn-dark py-3 px-6">
            <Plus size={14} /> New product
          </Link>
        </div>
      )}

      {/* ------------------------------- Editor ------------------------------- */}
      {showForm && (
        <form
          action={saveProduct}
          className="border border-ink/15 p-5 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-xl tracking-tight">
              {editing ? `EDIT · ${editing.title}` : "NEW PRODUCT"}
            </h3>
            <Link href="/admin?tab=products" className="label-mono link-sweep text-ash">
              CANCEL
            </Link>
          </div>
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label-mono text-ash block mb-1.5">Title *</label>
              <input
                name="title"
                required
                defaultValue={editing?.title ?? ""}
                className="field"
              />
            </div>
            <div>
              <label className="label-mono text-ash block mb-1.5">
                Handle (URL slug · blank = auto)
              </label>
              <input
                name="handle"
                defaultValue={editing?.handle ?? ""}
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono text-ash block mb-1.5">Subtitle</label>
              <input
                name="subtitle"
                defaultValue={editing?.subtitle ?? ""}
                placeholder="480gsm brushed-back fleece · Jet Black"
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono text-ash block mb-1.5">
                Description (SEO)
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editing?.description ?? ""}
                className="field resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono text-ash block mb-1.5">
                Details · one per line (PDP accordion)
              </label>
              <textarea
                name="details"
                rows={4}
                defaultValue={(editing?.details ?? []).join("\n")}
                className="field resize-y"
              />
            </div>
            <div>
              <label className="label-mono text-ash block mb-1.5">
                Price ({`current currency`})
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={editing ? (editing.priceCents / 100).toString() : ""}
                className="field"
              />
            </div>
            <div>
              <label className="label-mono text-ash block mb-1.5">
                Compare-at price (optional)
              </label>
              <input
                name="compareAt"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  editing?.compareAtCents
                    ? (editing.compareAtCents / 100).toString()
                    : ""
                }
                className="field"
              />
            </div>
            <div>
              <label className="label-mono text-ash block mb-1.5">Category</label>
              <select
                name="category"
                defaultValue={editing?.category ?? "Apparel"}
                className="field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-mono text-ash block mb-1.5">Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={editing?.stock ?? 25}
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono text-ash block mb-1.5">
                Tags (comma separated · powers search)
              </label>
              <input
                name="tags"
                defaultValue={(editing?.tags ?? []).join(", ")}
                className="field"
              />
            </div>
          </div>

          {/* images */}
          <div>
            <label className="label-mono text-ash block mb-2">
              Images (slot 1 = main)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => (
                <div key={slot}>
                  <select
                    name={`image${slot}`}
                    defaultValue={editing?.images?.[slot - 1] ?? ""}
                    className="field"
                  >
                    <option value=""> ·  empty  · </option>
                    {PRODUCT_IMAGES.map((img) => (
                      <option key={img} value={img}>
                        {img.replace("/images/", "")}
                      </option>
                    ))}
                  </select>
                  {editing?.images?.[slot - 1] && (
                    <div className="relative w-full aspect-[4/5] mt-2 border border-ink/10">
                      <Image
                        src={editing.images[slot - 1]}
                        alt=""
                        fill
                        className="object-cover img-bw"
                        sizes="150px"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* sizes */}
          <div>
            <label className="label-mono text-ash block mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 border border-ink/15 px-3.5 py-2.5 cursor-pointer has-checked:bg-ink has-checked:text-paper transition-colors"
                >
                  <input
                    type="checkbox"
                    name="sizes"
                    value={s}
                    defaultChecked={(editing?.sizes ?? ["M"]).includes(s)}
                    className="accent-white w-0 h-0"
                  />
                  <span className="label-mono">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* flags */}
          <div className="flex flex-wrap gap-6">
            {[
              { key: "active", label: "Active (visible in shop)", def: true },
              { key: "featured", label: "Featured (homepage)", def: false },
              { key: "isNew", label: "New badge", def: true },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name={f.key}
                  defaultChecked={
                    editing ? Boolean(editing[f.key as keyof ProductRow]) : f.def
                  }
                  className="w-4 h-4 accent-black"
                />
                <span className="label-mono">{f.label}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-block btn-dark">
            {editing ? "Save changes" : "Create product"}
          </button>
        </form>
      )}

      {/* ------------------------------- Table ------------------------------- */}
      {!showForm && (
        <div className="border border-ink/15 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-ink text-paper label-mono text-left">
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {all.map((p) => (
                <tr key={p.id} className="hover:bg-bone/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-bone overflow-hidden shrink-0">
                        <Image
                          src={p.images[0] ?? "/images/products/noir.jpg"}
                          alt=""
                          fill
                          className="object-cover img-bw"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="font-bold">{p.title}</p>
                        <p className="label-mono text-ash text-[10px]">
                          /{p.handle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 label-mono text-ash">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(p.priceCents)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className={p.stock <= 5 ? "font-black" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.active ? (
                        <span className="label-mono text-[9px] bg-ink text-paper px-2 py-1">
                          LIVE
                        </span>
                      ) : (
                        <span className="label-mono text-[9px] bg-mist text-ash px-2 py-1">
                          HIDDEN
                        </span>
                      )}
                      {p.featured && (
                        <span className="label-mono text-[9px] border border-ink/30 px-2 py-1">
                          HOME
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin?tab=products&edit=${p.id}`}
                        className="w-9 h-9 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="w-9 h-9 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
