import { getDomain } from "tldts";
import { DEFAULT_SETTINGS } from "./settings.js";

export const IMPORT_PREVIEW_TTL_MS = 2 * 60_000;
export { DEFAULT_SETTINGS, normalizeSettings, TAB_REPOSITORY_PLUGIN_ID, TAB_REPOSITORY_VIEW_ID } from "./settings.js";
export type TabRepositorySettings = typeof DEFAULT_SETTINGS;

export function normalizeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function getGeneralDomain(value: string): string {
  const parsed = new URL(value);
  return getDomain(parsed.hostname, { allowPrivateDomains: true }) || parsed.hostname.toLowerCase();
}

export function compareTabLabels(
  left: { title?: string | null; url: string },
  right: { title?: string | null; url: string },
) {
  const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });
  return collator.compare(left.title || left.url, right.title || right.url)
    || collator.compare(left.url, right.url);
}

export function extractJsonUrls(value: unknown) {
  const entries = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as any).urls)
      ? (value as any).urls
      : [];
  const valid: string[] = [];
  let invalid = 0;
  for (const entry of entries) {
    const rawValue = typeof entry === "string"
      ? entry
      : entry && typeof entry === "object"
        ? (entry as any).url
        : null;
    const url = normalizeHttpUrl(rawValue);
    if (url) valid.push(url);
    else invalid += 1;
  }
  return { urls: valid, invalid, total: entries.length };
}

export function isSystemicBrowserError(code: unknown) {
  return [
    "native_plugin_disabled",
    "permission_not_declared",
    "permission_denied",
    "target_not_configured",
    "target_offline",
    "pairing_required",
    "protocol_incompatible",
    "timeout",
  ].includes(String(code || ""));
}
