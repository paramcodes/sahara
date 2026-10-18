"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCartSessionId } from "../cart-session";
import { getSession } from "../auth";
import {
  getOrCreateCart,
  getCartWithItems,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
} from "../repos/cart";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";

async function resolveCart() {
  const [org] = await db.select().from(schema.orgs).limit(1);
  if (!org) throw new Error("No store organization initialized.");

  const session = await getSession();
  const sessionId = await getCartSessionId();

  const cart = await getOrCreateCart(
    org.id,
    session?.user?.id,
    sessionId
  );

  return { cart, orgId: org.id };
}

const AddToCartSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(99).default(1),
});

const UpdateQtySchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().int().min(0).max(99),
});

export async function addToCartAction(productId: string, qty: number = 1) {
  const parsed = AddToCartSchema.safeParse({ productId, qty });
  if (!parsed.success) {
    throw new Error("Invalid product quantity");
  }

  const { cart } = await resolveCart();

  // Verify product is active
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, parsed.data.productId))
    .limit(1);

  if (!product || !product.active) {
    throw new Error("Product is unavailable");
  }

  await addToCart(cart.id, parsed.data.productId, parsed.data.qty);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCartItemQtyAction(itemId: string, qty: number) {
  const parsed = UpdateQtySchema.safeParse({ itemId, qty });
  if (!parsed.success) {
    throw new Error("Invalid quantity input");
  }

  const { cart } = await resolveCart();
  await updateCartItemQty(cart.id, parsed.data.itemId, parsed.data.qty);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCartItemAction(itemId: string) {
  if (typeof itemId !== "string" || !itemId.trim()) {
    throw new Error("Invalid item ID");
  }

  const { cart } = await resolveCart();
  await removeCartItem(cart.id, itemId);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCurrentCartData() {
  try {
    const { cart } = await resolveCart();
    const items = await getCartWithItems(cart.id);
    return {
      cartId: cart.id,
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        qty: i.qty,
        product: i.product,
      })),
    };
  } catch {
    return { cartId: null, items: [] };
  }
}
