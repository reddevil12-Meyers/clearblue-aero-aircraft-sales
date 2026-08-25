import { useEffect } from "react";

/**
 * Marks the page as non-indexable (`noindex, nofollow`) for search engines.
 * Use on authenticated/private pages, auth screens, and 404 fallbacks so they
 * are dropped from Google's index and stop consuming crawl budget.
 *
 * On unmount it restores `index, follow` so a subsequent public page that does
 * not set its own robots meta (e.g. async inventory detail) isn't left noindex.
 */
export default function useNoIndex() {
  useEffect(() => {
    let el = document.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, nofollow");
    return () => {
      el.setAttribute("content", "index, follow");
    };
  }, []);
}