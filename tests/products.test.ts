import { describe, expect, it, vi } from "vitest";
import { getProductById, getProductBySlug, getProducts } from "../lib/repos/products";

// Force the database layer to throw so the DB-unavailable mock-data fallback
// paths are exercised. The real schema is preserved so Drizzle expression
// builders (eq/ilike/or/sql) don't throw during query construction.
vi.mock("../lib/db", async () => {
  const actual = await vi.importActual("../lib/db");
  const throwDb = () => {
    throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
  };
  return {
    db: { select: throwDb, transaction: throwDb },
    schema: actual.schema,
  };
});

describe("Products repo — DB-unavailable fallback", () => {
  it("getProducts falls back to the active mock catalog", async () => {
    const products = await getProducts({ activeOnly: true });
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.active)).toBe(true);
  });

  it("getProducts honors orgId in the fallback (no cross-tenant leak)", async () => {
    const demo = await getProducts({ orgId: "demo-org-1", activeOnly: false });
    expect(demo.some((p) => p.orgId === "demo-org-1")).toBe(true);

    const other = await getProducts({ orgId: "nonexistent-org", activeOnly: false });
    expect(other).toHaveLength(0);
  });

  it("getProducts applies query filtering in the fallback", async () => {
    const products = await getProducts({ query: "Tumbler", activeOnly: true });
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.name.includes("Tumbler"))).toBe(true);
  });

  it("getProductBySlug falls back to mock data by slug", async () => {
    const product = await getProductBySlug("obsidian-ceramic-tumbler");
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Obsidian Ceramic Tumbler");
    // Mock products ship with specs + images
    expect(product?.specs?.length).toBeGreaterThan(0);
    expect(product?.images?.length).toBeGreaterThan(0);
  });

  it("getProductBySlug returns null on orgId mismatch in the fallback", async () => {
    const product = await getProductBySlug("obsidian-ceramic-tumbler", "other-org");
    expect(product).toBeNull();
  });

  it("getProductById falls back to mock data by id", async () => {
    const product = await getProductById("prod-1");
    expect(product).not.toBeNull();
    expect(product?.id).toBe("prod-1");
    expect(product?.slug).toBe("obsidian-ceramic-tumbler");
  });

  it("getProductById returns null for an unknown id in the fallback", async () => {
    const product = await getProductById("does-not-exist");
    expect(product).toBeNull();
  });
});
