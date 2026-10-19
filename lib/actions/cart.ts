"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "../auth";
import {
  getOrCreateCart,
  findCart,
  getCartWithItems,
  addToCart,
  updateCartItemQty,
  removeCartItem,
} from "../repos/cart";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { getOrg } from "../repos/org";
import { MOCK_PRODUCTS } from "../mock-data";
import {
  addToCart,
  getCartWithItems,
  getOrCreateCart,
  removeCartItem,
  updateCartItemQty,
} from "../repos/cart";

/**
 * `create: true` for mutations — the guest cookie can only be written inside a
 * Server Action. Read paths pass `create: false` so a page render never writes
 * a cookie (throws in RSC) or inserts a cart row for a visitor who has not
 * added anything yet.
 */
async function resolveCart({ create = false }: { create?: boolean } = {}) {
  const org = await getOrg();
  if (!org) throw new Error("No store organization initialized.");

  const session = await getSession();
  const sessionId = await getCartSessionId({ persist: create });
  const userId = session?.user?.id;

  const cart = create
    ? await getOrCreateCart(org.id, userId, sessionId)
    : await findCart(org.id, userId, sessionId);

  return { cart, orgId: org.id };
}

/** Mutation path: guarantees a cart row exists before touching cart items. */
async function resolveWritableCart() {
  const { cart } = await resolveCart({ create: true });
  if (!cart) throw new Error("Could not resolve a cart.");
  return cart;
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

  const cart = await resolveWritableCart();

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, parsed.data.productId))
    .limit(1);

  if (!product?.active) {
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

  const cart = await resolveWritableCart();
  await updateCartItemQty(cart.id, parsed.data.itemId, parsed.data.qty);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCartItemAction(itemId: string) {
  if (typeof itemId !== "string" || !itemId.trim()) {
    throw new Error("Invalid item ID");
  }

  const cart = await resolveWritableCart();
  await removeCartItem(cart.id, itemId);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCurrentCartData() {
  try {
    const { cart } = await resolveCart();
    if (!cart) {
      return { cartId: "", items: [] };
    }
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
    return {
      cartId: "demo-cart-1",
      items: [
        {
          id: "demo-ci-1",
          productId: "prod-1",
          qty: 1,
          product: MOCK_PRODUCTS[0],
        },
      ],
    };
  }
}
