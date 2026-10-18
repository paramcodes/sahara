"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../auth";
import { db, schema } from "../db";
import { createProduct, deleteProduct, updateProduct } from "../repos/products";

const ProductCreateSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().default(""),
  priceCents: z.number().int().min(0, "Price must be positive"),
  discountType: z.enum(["none", "percent", "fixed"]).default("none"),
  discountValue: z.number().int().min(0).default(0),
  stockQty: z.number().int().nullable().optional(),
  bannerPath: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

export async function createProductAction(data: z.infer<typeof ProductCreateSchema>) {
  const _session = await requireAdmin();
  const validated = ProductCreateSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validation failed",
    };
  }

  const [org] = await db.select().from(schema.orgs).limit(1);
  if (!org) return { success: false, error: "Store not initialized." };

  try {
    const product = await createProduct({
      orgId: org.id,
      name: validated.data.name,
      description: validated.data.description,
      priceCents: validated.data.priceCents,
      discountType: validated.data.discountType,
      discountValue: validated.data.discountValue,
      stockQty: validated.data.stockQty,
      bannerPath: validated.data.bannerPath,
      featured: validated.data.featured,
      specs: validated.data.specs,
      images: validated.data.bannerPath
        ? [{ imagePath: validated.data.bannerPath, displayOrder: 0 }]
        : [],
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, product };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create product." };
  }
}

const DiscountUpdateSchema = z.object({
  productId: z.string().min(1),
  discountType: z.enum(["none", "percent", "fixed"]),
  discountValue: z.number().int().min(0),
});

export async function updateProductDiscountAction(
  productId: string,
  data: {
    discountType: "none" | "percent" | "fixed";
    discountValue: number;
  },
) {
  await requireAdmin();
  const parsed = DiscountUpdateSchema.safeParse({ productId, ...data });
  if (!parsed.success) {
    return { success: false, error: "Invalid discount parameters" };
  }

  try {
    await updateProduct(parsed.data.productId, {
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/discounts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update discount" };
  }
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await updateProduct(id, { active });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  try {
    await deleteProduct(id);
  } catch (err: any) {
    if (err?.code === "23503") {
      await updateProduct(id, { active: false });
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      return {
        success: true,
        notice: "Product has past orders, so it was deactivated instead of deleted.",
      };
    }
    throw err;
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { success: true };
}
