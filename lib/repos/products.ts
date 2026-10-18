import crypto from "node:crypto";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { MOCK_PRODUCTS } from "../mock-data";

export async function getProducts(options?: {
  orgId?: string;
  activeOnly?: boolean;
  query?: string;
}) {
  const conditions = [];

  if (options?.orgId) {
    conditions.push(eq(schema.products.orgId, options.orgId));
  }

  if (options?.activeOnly !== false) {
    conditions.push(eq(schema.products.active, true));
  }

  if (options?.query && options.query.trim().length > 0) {
    const q = `%${options.query.trim()}%`;
    conditions.push(
      or(
        ilike(schema.products.name, q),
        ilike(schema.products.description, q),
        sql`EXISTS (
          SELECT 1 FROM ${schema.productSpecs}
          WHERE ${schema.productSpecs.productId} = ${schema.products.id}
          AND (${schema.productSpecs.key} ILIKE ${q} OR ${schema.productSpecs.value} ILIKE ${q})
        )`,
      ),
    );
  }

  try {
    const items = await db
      .select()
      .from(schema.products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.products.featured), desc(schema.products.createdAt));

    return items;
  } catch (_err) {
    let list = [...MOCK_PRODUCTS];
    if (options?.activeOnly !== false) {
      list = list.filter((p) => p.active);
    }
    if (options?.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specs.some((s) => s.key.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)),
      );
    }
    return list;
  }
}

export async function getProductBySlug(slug: string, orgId?: string) {
  const conditions = [eq(schema.products.slug, slug)];
  if (orgId) {
    conditions.push(eq(schema.products.orgId, orgId));
  }

  try {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(and(...conditions))
      .limit(1);

    if (!product) return null;

    const specs = await db
      .select()
      .from(schema.productSpecs)
      .where(eq(schema.productSpecs.productId, product.id))
      .orderBy(asc(schema.productSpecs.displayOrder));

    const images = await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, product.id))
      .orderBy(asc(schema.productImages.displayOrder));

    return {
      ...product,
      specs,
      images,
    };
  } catch (_err) {
    const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return found || null;
  }
}

export async function getProductById(id: string) {
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .limit(1);

  if (!product) return null;

  const specs = await db
    .select()
    .from(schema.productSpecs)
    .where(eq(schema.productSpecs.productId, product.id))
    .orderBy(asc(schema.productSpecs.displayOrder));

  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, product.id))
    .orderBy(asc(schema.productImages.displayOrder));

  return {
    ...product,
    specs,
    images,
  };
}

export async function createProduct(data: {
  orgId: string;
  name: string;
  slug?: string;
  description: string;
  priceCents: number;
  discountType?: string;
  discountValue?: number;
  discountStartsAt?: Date | null;
  discountEndsAt?: Date | null;
  stockQty?: number | null;
  bannerPath?: string | null;
  active?: boolean;
  featured?: boolean;
  specs?: { key: string; value: string; displayOrder?: number }[];
  images?: { imagePath: string; displayOrder?: number; altText?: string }[];
}) {
  const id = crypto.randomUUID();
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  await db.transaction(async (tx) => {
    await tx.insert(schema.products).values({
      id,
      orgId: data.orgId,
      name: data.name,
      slug,
      description: data.description || "",
      priceCents: data.priceCents,
      discountType: data.discountType || "none",
      discountValue: data.discountValue || 0,
      discountStartsAt: data.discountStartsAt,
      discountEndsAt: data.discountEndsAt,
      stockQty: data.stockQty !== undefined ? data.stockQty : null,
      bannerPath: data.bannerPath || null,
      active: data.active !== undefined ? data.active : true,
      featured: data.featured || false,
    });

    if (data.specs && data.specs.length > 0) {
      for (let i = 0; i < data.specs.length; i++) {
        const s = data.specs[i];
        if (s.key && s.value) {
          await tx.insert(schema.productSpecs).values({
            id: crypto.randomUUID(),
            productId: id,
            key: s.key,
            value: s.value,
            displayOrder: s.displayOrder !== undefined ? s.displayOrder : i,
          });
        }
      }
    }

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (img.imagePath) {
          await tx.insert(schema.productImages).values({
            id: crypto.randomUUID(),
            productId: id,
            imagePath: img.imagePath,
            displayOrder: img.displayOrder !== undefined ? img.displayOrder : i,
            altText: img.altText || data.name,
          });
        }
      }
    }
  });

  return getProductById(id);
}

export async function updateProduct(
  id: string,
  data: Partial<typeof schema.products.$inferInsert> & {
    specs?: { key: string; value: string }[];
  },
) {
  await db.transaction(async (tx) => {
    const { specs, ...fields } = data;
    if (Object.keys(fields).length > 0) {
      await tx
        .update(schema.products)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(schema.products.id, id));
    }

    if (specs !== undefined) {
      await tx.delete(schema.productSpecs).where(eq(schema.productSpecs.productId, id));

      for (let i = 0; i < specs.length; i++) {
        const s = specs[i];
        if (s.key && s.value) {
          await tx.insert(schema.productSpecs).values({
            id: crypto.randomUUID(),
            productId: id,
            key: s.key,
            value: s.value,
            displayOrder: i,
          });
        }
      }
    }
  });

  return getProductById(id);
}

export async function deleteProduct(id: string) {
  await db.delete(schema.products).where(eq(schema.products.id, id));
}
