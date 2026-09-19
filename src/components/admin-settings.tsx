import {
  DEFAULT_SETTINGS,
  SETTING_GROUPS,
  getSetting,
  type SettingField,
} from "@/lib/settings";
import { PRODUCT_IMAGES } from "@/lib/utils";
import { resetSettingGroup, saveSettingGroup } from "@/lib/actions";
import { RotateCcw, Save } from "lucide-react";

function Field({
  group,
  field,
  value,
}: {
  group: string;
  field: SettingField;
  value: unknown;
}) {
  const id = `${group}-${field.key}`;
  const label = (
    <label htmlFor={id} className="label-mono text-ash block mb-1.5">
      {field.label}
    </label>
  );

  if (field.type === "checkbox") {
    return (
      <label
        htmlFor={id}
        className="flex items-center gap-3 cursor-pointer select-none py-1"
      >
        <input
          id={id}
          name={field.key}
          type="checkbox"
          defaultChecked={Boolean(value)}
          className="w-4 h-4 accent-black"
        />
        <span className="label-mono">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          id={id}
          name={field.key}
          rows={3}
          defaultValue={String(value ?? "")}
          className="field resize-y"
        />
        {field.hint && (
          <p className="label-mono text-ash mt-1 text-[10px]">{field.hint}</p>
        )}
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        {label}
        <select id={id} name={field.key} defaultValue={String(value ?? "")} className="field">
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        {label}
        <select id={id} name={field.key} defaultValue={String(value ?? "")} className="field">
          {PRODUCT_IMAGES.map((img) => (
            <option key={img} value={img}>
              {img}
            </option>
          ))}
        </select>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={String(value || PRODUCT_IMAGES[0])}
          alt=""
          className="mt-2 w-24 h-28 object-cover img-bw border border-ink/10"
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        id={id}
        name={field.key}
        defaultValue={String(value ?? "")}
        className="field"
      />
    </div>
  );
}

export default async function AdminSettings() {
  const groups = await Promise.all(
    SETTING_GROUPS.map(async (g) => ({
      ...g,
      values: await getSetting<Record<string, unknown>>(g.group),
    }))
  );

  return (
    <div className="space-y-8">
      <p className="label-mono text-ash leading-relaxed">
        THEME EDITOR · ANYTHING SAVED HERE APPLIES ACROSS THE STOREFRONT
        INSTANTLY (LIKE SHOPIFY THEME SETTINGS). EACH SECTION SAVES
        INDEPENDENTLY.
      </p>
      {groups.map((g) => (
        <section key={g.group} className="border border-ink/15">
          <header className="px-5 py-3.5 bg-ink text-paper flex items-center justify-between">
            <h3 className="label-mono">{g.label}</h3>
            <span className="label-mono text-paper/40">/{g.group}</span>
          </header>
          <form action={saveSettingGroup} className="p-5">
            <input type="hidden" name="group" value={g.group} />
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
              {g.fields.map((f) => (
                <Field
                  key={f.key}
                  group={g.group}
                  field={f}
                  value={g.values[f.key] ?? DEFAULT_SETTINGS[g.group]?.[f.key]}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn-block btn-dark py-3 px-6">
                <Save size={14} /> Save
              </button>
              <button
                type="submit"
                formAction={resetSettingGroup}
                className="btn-block btn-ghost text-ink py-3 px-6"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </form>
        </section>
      ))}
    </div>
  );
}
