import { useEffect } from "react";

/**
 * Injects a JSON-LD structured data script into the document head.
 * Helps Google rich snippets and AI models parse page content.
 *
 * @param {object} data - The JSON-LD object to inject.
 */
export default function JsonLd({ data }) {
  useEffect(() => {
    if (!data) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", "dynamic");
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);
  return null;
}