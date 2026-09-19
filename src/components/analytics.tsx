"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

type LooseWindow = Record<string, any>;

/**
 * Injects Meta Pixel, TikTok Pixel and GA4 · driven entirely by
 * /admin → Theme Settings → Integrations. All fields empty = zero
 * scripts, zero performance cost.
 */
export default function Analytics({
  metaId,
  tiktokId,
  gaId,
}: {
  metaId?: string;
  tiktokId?: string;
  gaId?: string;
}) {
  const pathname = usePathname();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const w = window as unknown as LooseWindow;

    /* ------------------------------- Meta Pixel ------------------------------ */
    if (metaId) {
      if (!w.fbq) {
        const fbq: any = function (...args: unknown[]) {
          fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
        };
        fbq.queue = [];
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        w.fbq = fbq;
        w._fbq = fbq;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
      }
      w.fbq("init", metaId);
      w.fbq("track", "PageView");
    }

    /* ------------------------------ TikTok Pixel ----------------------------- */
    if (tiktokId) {
      const ttq: any = w.ttq ?? [];
      if (!ttq.methods) {
        ttq.methods = [
          "page", "track", "identify", "instances", "debug", "on", "off",
          "once", "ready", "alias", "group", "enableCookie", "disableCookie",
        ];
        for (const m of ttq.methods) {
          ttq[m] = (...args: unknown[]) => {
            ttq.push([m, ...args]);
          };
        }
        ttq.load = (appId: string) => {
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${appId}&lib=ttq`;
          document.head.appendChild(s);
          ttq.push(["init", appId]);
        };
      }
      w.ttq = ttq;
      ttq.load(tiktokId);
      ttq.page();
    }

    /* --------------------------------- GA4 ----------------------------------- */
    if (gaId) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
      w.dataLayer = w.dataLayer ?? [];
      const gtag = (...args: unknown[]) => {
        w.dataLayer.push(args);
      };
      w.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId);
    }
  }, [metaId, tiktokId, gaId]);

  // SPA route-change PageViews
  useEffect(() => {
    if (!booted.current) return;
    const t = setTimeout(() => track("PageView"), 800);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
