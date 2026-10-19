import { cache } from "react";
import fs from "fs";
import path from "path";
import { db, schema } from "../db";
import { MOCK_STORE_SETTINGS } from "../mock-data";

/** Public path of a local upload that actually exists on disk, else null. */
function resolveLocalUpload(publicPath: string | null): string | null {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;
  const target = path.join(process.cwd(), "public", publicPath);
  return fs.existsSync(target) ? publicPath : null;
}

/**
 * Per-request memoized lookup of the single store org.
 *
 * v1 is single-org, so this runs on nearly every page and every server
 * action. `cache()` collapses repeated calls inside one render/request into a
 * single query without adding cross-request staleness.
 */
export const getOrg = cache(async () => {
  const [row] = await db
    .select()
    .from(schema.orgs)
    .limit(1);
  return row ?? null;
});

/**
 * Store settings with graceful fallback when the database is unreachable
 * (demo/cloud fallback behavior). Memoized per request for the same reason as
 * getOrg.
 */
export const getStoreSettings = cache(async () => {
  try {
    const [row] = await db
      .select()
      .from(schema.storeSettings)
      .limit(1);
    if (!row) return MOCK_STORE_SETTINGS;

    // A deleted upload would make the hero (the LCP element) 404. Fall back to
    // the default banner instead of shipping a broken image.
    const heroPath = resolveLocalUpload(row.heroBannerPath);
    return {
      ...row,
      heroBannerPath: heroPath ?? MOCK_STORE_SETTINGS.heroBannerPath,
    };
  } catch {
    return MOCK_STORE_SETTINGS;
  }
});