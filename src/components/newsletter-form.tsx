"use client";

import { subscribe } from "@/lib/actions";
import { ArrowRight, Check } from "lucide-react";
import { useActionState } from "react";

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, {
    ok: false,
    message: "",
  });

  return (
    <form action={action} className="w-full max-w-xl">
      <div className="flex border-b border-paper/40 focus-within:border-paper transition-colors">
        <input
          type="email"
          name="email"
          required
          placeholder="YOUR@EMAIL.COM"
          className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-ash font-mono tracking-widest"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 label-mono text-paper hover:gap-4 transition-all disabled:opacity-50"
        >
          {pending ? "JOINING" : "JOIN"} <ArrowRight size={16} />
        </button>
      </div>
      {state.message && (
        <p className="label-mono mt-3 flex items-center gap-2 text-paper/80">
          {state.ok && <Check size={13} />} {state.message}
        </p>
      )}
    </form>
  );
}
