"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Fires an analytics event once when the page mounts (small delay so pixels boot first). */
export default function TrackMount({
  event,
  payload,
}: {
  event: string;
  payload?: Record<string, unknown>;
}) {
  useEffect(() => {
    const t = setTimeout(() => track(event, payload), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
