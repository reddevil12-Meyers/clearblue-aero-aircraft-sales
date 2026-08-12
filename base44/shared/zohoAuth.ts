import { secrets } from "base44:runtime";

const TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";
const API_BASE = "https://www.zohoapis.com/crm/v2";

// Simple in-memory cache of the access token (per isolate lifetime).
let cachedToken = null as string | null;
let cachedExpiry = 0;

export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedExpiry - 60_000) {
    return cachedToken;
  }

  const clientId = secrets.get("ZOHO_CLIENT_ID");
  const clientSecret = secrets.get("ZOHO_CLIENT_SECRET");
  const refreshToken = secrets.get("ZOHO_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Zoho credentials (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Zoho token exchange failed: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token as string;
  cachedExpiry = now + ((data.expires_in_secs as number) || 3600) * 1000;
  return cachedToken;
}

export function zohoApiBase(): string {
  return API_BASE;
}