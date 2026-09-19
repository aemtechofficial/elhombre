"use client";

import { adminLogin } from "@/lib/actions";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, {
    ok: false,
    error: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form action={action} className="w-full max-w-sm border border-ink/15 p-8">
        <p className="font-display font-black text-2xl tracking-tight">
          ADMIN<span className="text-ash">.</span>
        </p>
        <p className="label-mono text-ash mt-2 mb-8">
          ENTER PASSWORD TO CONTINUE
        </p>
        <input
          type="password"
          name="password"
          required
          placeholder="PASSWORD"
          className="field"
          autoFocus
        />
        {state.error && (
          <p className="label-mono bg-ink text-paper px-3 py-2.5 mt-3">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-block btn-dark w-full mt-6 disabled:opacity-60"
        >
          {pending ? "CHECKING…" : "ENTER"} <ArrowRight size={15} />
        </button>
        <p className="label-mono text-ash mt-6 text-[10px] leading-relaxed">
          DEFAULT: noir2024 · CHANGE VIA ADMIN_PASSWORD ENV VARIABLE
        </p>
      </form>
    </div>
  );
}
