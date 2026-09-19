"use client";

import { submitReview } from "@/lib/actions";
import { CheckCircle2, Star } from "lucide-react";
import { useActionState, useState } from "react";
import { cx } from "@/lib/utils";

export default function ReviewForm({ handle }: { handle: string }) {
  const [rating, setRating] = useState(5);
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReview, {
    ok: false,
    message: "",
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-block btn-ghost text-ink w-full sm:w-auto"
      >
        WRITE A REVIEW
      </button>
    );
  }

  if (state.ok) {
    return (
      <div className="border border-ink/15 p-8 text-center">
        <CheckCircle2 size={30} strokeWidth={1.25} className="mx-auto" />
        <p className="label-mono mt-4">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="border border-ink/15 p-6 sm:p-8 space-y-4">
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <p className="label-mono text-ash mb-2">YOUR RATING</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
            >
              <Star
                size={24}
                strokeWidth={1.25}
                className={cx(
                  "transition-colors",
                  n <= rating ? "fill-gold text-gold" : "text-mist hover:text-ash"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="YOUR NAME *" className="field" />
        <input name="title" placeholder="HEADLINE (OPTIONAL)" className="field" />
      </div>
      <textarea
        name="body"
        required
        rows={4}
        placeholder="HOW WAS THE SCENT? PROJECTION? LONGEVITY? *"
        className="field resize-none"
      />
      {state.message && !state.ok && (
        <p className="label-mono bg-ink text-paper px-4 py-3">{state.message}</p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-block btn-dark disabled:opacity-60">
          {pending ? "PUBLISHING…" : "PUBLISH REVIEW"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-block btn-ghost text-ink"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
