"use client";

import { updateOrderStatus } from "@/lib/actions";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrderStatusForm({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  return (
    <form
      action={updateOrderStatus}
      className="flex gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="field !py-1.5 !px-2.5 !w-auto label-mono text-[10px]"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>
      <button type="submit" className="label-mono bg-ink text-paper px-3 py-1.5">
        SET
      </button>
    </form>
  );
}
