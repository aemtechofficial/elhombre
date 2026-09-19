import Stars from "@/components/stars";
import { deleteReview, setReviewApproval } from "@/lib/actions";
import { db } from "@/db";
import { reviews, type ReviewRow } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export default async function AdminReviews() {
  let rows: ReviewRow[] = [];
  try {
    rows = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(200);
  } catch {
    /* booting */
  }

  if (rows.length === 0) {
    return (
      <div className="border border-ink/15 p-16 text-center">
        <p className="font-display text-3xl font-black text-outline">NO REVIEWS YET</p>
        <p className="label-mono text-ash mt-3">
          CUSTOMER REVIEWS WILL APPEAR HERE
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="label-mono text-ash">
        {rows.length} REVIEWS · {rows.filter((r) => r.approved).length} LIVE
      </p>
      <div className="border border-ink/15 divide-y divide-ink/10">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`px-5 py-4 flex flex-wrap items-start gap-x-6 gap-y-2 ${r.approved ? "" : "opacity-50 bg-bone/50"}`}
          >
            <div className="min-w-[140px]">
              <p className="font-display font-bold text-sm">{r.name}</p>
              <Stars rating={r.rating} size={12} className="mt-1" />
              <p className="label-mono text-ash text-[10px] mt-1">
                /{r.productHandle}
              </p>
            </div>
            <div className="flex-1 min-w-[200px]">
              {r.title && (
                <p className="font-bold text-sm">{r.title}</p>
              )}
              <p className="text-sm text-coal/75 mt-0.5 line-clamp-2 max-w-2xl">
                {r.body}
              </p>
              <p className="label-mono text-ash text-[10px] mt-2">
                {new Date(r.createdAt).toLocaleDateString("en-GB")}  · {" "}
                {r.verified ? "VERIFIED" : "UNVERIFIED"}
              </p>
            </div>
            <div className="flex gap-2 ml-auto">
              <form action={setReviewApproval}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="approved" value={r.approved ? "0" : "1"} />
                <button
                  type="submit"
                  className="w-9 h-9 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                  aria-label={r.approved ? "Hide review" : "Approve review"}
                  title={r.approved ? "Hide" : "Approve"}
                >
                  {r.approved ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </form>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="w-9 h-9 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                  aria-label="Delete review"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
