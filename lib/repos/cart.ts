import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../db";

export async function getOrCreateCart(orgId: string, userId?: string, sessionId?: string) {
  let cart = null;

  if (userId) {
    [cart] = await db
      .select()
      .from(schema.carts)
      .where(and(eq(schema.carts.orgId, orgId), eq(schema.carts.userId, userId)))
      .limit(1);
  } else if (sessionId) {
    [cart] = await db
      .select()
      .from(schema.carts)
      .where(and(eq(schema.carts.orgId, orgId), eq(schema.carts.sessionId, sessionId)))
      .limit(1);
  }

  if (!cart) {
    const id = crypto.randomUUID();
    const [newCart] = await db
      .insert(schema.carts)
      .values({
        id,
        orgId,
        userId: userId || null,
        sessionId: sessionId || null,
      })
      .returning();
    cart = newCart;
  }

  return cart;
}

export async function getCartWithItems(cartId: string) {
  const items = await db
    .select({
      id: schema.cartItems.id,
      cartId: schema.cartItems.cartId,
      productId: schema.cartItems.productId,
      qty: schema.cartItems.qty,
      product: schema.products,
    })
    .from(schema.cartItems)
    .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .where(eq(schema.cartItems.cartId, cartId));

  return items;
}

export async function addToCart(cartId: string, productId: string, qty: number = 1) {
  const [existing] = await db
    .select()
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    const newQty = existing.qty + qty;
    await db
      .update(schema.cartItems)
      .set({ qty: newQty })
      .where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({
      id: crypto.randomUUID(),
      cartId,
      productId,
      qty,
    });
  }

  await db.update(schema.carts).set({ updatedAt: new Date() }).where(eq(schema.carts.id, cartId));
}

export async function updateCartItemQty(cartId: string, itemId: string, qty: number) {
  if (qty <= 0) {
    await db
      .delete(schema.cartItems)
      .where(and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cartId)));
  } else {
    await db
      .update(schema.cartItems)
      .set({ qty })
      .where(and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cartId)));
  }
}

export async function removeCartItem(cartId: string, itemId: string) {
  await db
    .delete(schema.cartItems)
    .where(and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cartId)));
}

export async function clearCart(cartId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
}
