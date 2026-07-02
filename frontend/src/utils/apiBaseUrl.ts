/** Production Render API when Vercel build omits VITE_API_BASE_URL. */
const VERCEL_RENDER_API_URL = "https://medscope-ai-q8tg.onrender.com";

function isVercelProductionHost(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}

/**
 * Resolve axios base URL.
 * - Explicit VITE_API_BASE_URL wins (Vercel prod, custom domains).
 * - Empty in dev → Vite proxy to localhost:8000.
 * - Empty in Docker nginx → same-origin proxy.
 * - Empty on *.vercel.app → call Render API directly (no nginx proxy on Vercel).
 */
export function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.PROD && typeof window !== "undefined") {
    if (isVercelProductionHost(window.location.hostname)) {
      return VERCEL_RENDER_API_URL;
    }
  }

  return "";
}
