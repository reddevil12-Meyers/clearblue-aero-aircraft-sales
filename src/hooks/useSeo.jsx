import { useEffect } from "react";

const SITE_ORIGIN = "https://clearblueaero.com";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets per-page <title>, meta description, canonical link, and Open Graph /
 * Twitter tags synchronously on mount so crawlers capture them without waiting
 * for async data. Pass a stable `path` (route) for a correct canonical URL.
 */
export default function useSeo({ title, description, path, image }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    const url = path ? `${SITE_ORIGIN}${path}` : window.location.href;
    upsertLink("canonical", url);
    upsertMeta("property", "og:url", url);
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    }
    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("property", "og:type", "website");
    // Explicitly assert indexability — overrides any platform-injected noindex meta
    upsertMeta("name", "robots", "index, follow");
  }, [title, description, path, image]);
}