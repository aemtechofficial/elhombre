import { Star } from "lucide-react";
import { cx } from "@/lib/utils";

export default function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={
            i < Math.round(rating) ? "fill-gold text-gold" : "text-mist"
          }
        />
      ))}
    </span>
  );
}
