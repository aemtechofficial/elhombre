"use client";

import { sendContact } from "@/lib/actions";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, {
    ok: false,
    message: "",
  });

  if (state.ok) {
    return (
      <div className="border border-ink/15 p-10 sm:p-14 text-center">
        <CheckCircle2 size={36} strokeWidth={1.25} className="mx-auto" />
        <h2 className="font-display font-black text-2xl tracking-tight mt-5">
          MESSAGE RECEIVED.
        </h2>
        <p className="label-mono text-ash mt-3">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="YOUR NAME *" className="field" />
        <input
          name="email"
          type="email"
          required
          placeholder="YOUR EMAIL *"
          className="field"
        />
      </div>
      <select name="subject" className="field" defaultValue="Order help">
        <option>Order help</option>
        <option>Sizing advice</option>
        <option>Returns & exchanges</option>
        <option>Wholesale / press</option>
        <option>Something else</option>
      </select>
      <textarea
        name="message"
        required
        rows={6}
        placeholder="YOUR MESSAGE *"
        className="field resize-none"
      />
      {state.message && !state.ok && (
        <p className="label-mono bg-ink text-paper px-4 py-3">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-block btn-dark disabled:opacity-60">
        {pending ? "SENDING…" : "SEND MESSAGE"} <ArrowRight size={15} />
      </button>
    </form>
  );
}
