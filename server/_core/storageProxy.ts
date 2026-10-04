import type { Express } from "express";
import { ENV } from "./env";

// Storage keys are app-scoped paths (e.g. "atlas/figura_ab12cd34.jpg").
// Reject anything that looks like path traversal, an absolute path, a
// protocol-relative URL, or unexpected characters before it ever reaches
// the Forge presign call. This does not change who can load images — it
// only prevents the key from being abused to request paths outside the
// app's intended storage namespace.
const SAFE_KEY_PATTERN = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;

function isSafeStorageKey(key: string): boolean {
  if (!key) return false;
  if (key.includes("..")) return false;
  if (key.startsWith("/")) return false;
  if (!SAFE_KEY_PATTERN.test(key)) return false;
  return true;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0];
    if (!rawKey) {
      res.status(400).send("Missing storage key");
      return;
    }

    let key: string;
    try {
      key = decodeURIComponent(rawKey);
    } catch {
      res.status(400).send("Invalid storage key");
      return;
    }

    if (!isSafeStorageKey(key)) {
      console.error(`[StorageProxy] rejected unsafe key: ${rawKey}`);
      res.status(400).send("Invalid storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
