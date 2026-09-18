// Shared helper: fetch an aircraft listing page server-side and return its
// readable text content. Returns '' when the fetch fails so callers can fall
// back to LLM web browsing.
async function fetchDirect(url) {
  try {
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    const html = await fetchResponse.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s{3,}/g, '  ')
      .trim();
    // Anti-bot / security-challenge shells carry no listing content — treat as a
    // failed fetch so callers fall back to the reader proxy / LLM web browsing.
    if (!text || /just a moment|checking your browser|captcha|challenge-platform|access denied|security check|enable javascript/i.test(text)) {
      return '';
    }
    return text.slice(0, 8000); // Keep within token limits
  } catch (_) {
    return '';
  }
}

// Pages behind anti-bot walls (Cloudflare "Just a moment...") or JS-rendered
// apps return no content on a direct fetch. Render them through a reader proxy
// so we get the real listing text, including the true advertised price.
async function fetchRendered(url) {
  // Retry — the free reader proxy rate-lips occasionally.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        console.info('reader proxy status for', url, ':', res.status);
        continue;
      }
      const text = (await res.text())
        .replace(/!\[Image[^\]]*\]\([^)]*\)/g, '') // strip image noise
        .replace(/\s{3,}/g, '  ')
        .trim();
      if (!text || /just a moment|checking your browser|captcha|challenge-platform|access denied/i.test(text)) {
        return '';
      }
      return text.slice(0, 8000);
    } catch (e) {
      console.info('reader proxy error for', url, ':', e.message);
    }
  }
  return '';
}

export async function fetchListingText(url) {
  const direct = await fetchDirect(url);
  if (direct) return direct;
  return await fetchRendered(url);
}