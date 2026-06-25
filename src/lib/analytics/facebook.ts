declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

const PIXEL_ID = "894303023002590";

export function initFacebookPixel() {
  if (typeof window === "undefined") return;

  if (window.fbq) return;

  !(function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;

    const n: any = function (...args: any[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };

    if (!f._fbq) f._fbq = n;

    f.fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;

    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq?.("init", PIXEL_ID);
}

export function trackPageView() {
  window.fbq?.("track", "PageView");
}

export function track(event: string, data?: Record<string, any>) {
  window.fbq?.("track", event, data);
}
