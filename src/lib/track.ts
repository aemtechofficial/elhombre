/**
 * Universal e-commerce event tracker.
 * Fires Meta Pixel (fbq), TikTok Pixel (ttq) and GA4 (gtag)  · 
 * whichever the store owner enabled in /admin → Integrations.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (event: string, params?: Record<string, unknown>) => void;
      load?: (id: string) => void;
      page?: () => void;
      push?: (args: unknown[]) => void;
      [k: string]: unknown;
    } & Record<string, unknown>;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_EVENT_MAP: Record<string, string> = {
  PageView: "page_view",
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  CompleteRegistration: "sign_up",
};

const TIKTOK_EVENT_MAP: Record<string, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
  PageView: "Pageview",
};

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const p = params ?? {};
  try {
    window.fbq?.("track", event, p);
    const ttqEvent = TIKTOK_EVENT_MAP[event] ?? event;
    if (ttqEvent !== "Pageview") window.ttq?.track?.(ttqEvent, p);
    window.gtag?.(
      "event",
      GA_EVENT_MAP[event] ?? event.toLowerCase(),
      p as Record<string, string | number | boolean>
    );
  } catch {
    /* tracking must never break the store */
  }
}
