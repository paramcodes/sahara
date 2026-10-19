import crypto from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { MOCK_ORDERS } from "../mock-data";
import { calculateCartTotals, createOrderItemSnapshot } from "../pricing";
import { DEFAULT_PAGE_SIZE } from "./products";

export type OrderStatus = "placed" | "confirmed" | "fulfilled" | "cancelled";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["fulfilled", "cancelled"],
  fulfilled: [], // terminal
  cancelled: [], // terminal
};

export function canTransition(current: OrderStatus, target: OrderStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

export async function createOrder(data: {
  orgId: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  cartId?: string;
  items: {
    product: typeof schema.products.$inferSelect;
    qty: number;
  }[];
}) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  const orderId = crypto.randomUUID();
  const orderNumber = `SHR-${Date.now().toString().slice(-6)}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const now = new Date();

  return await db.transaction(async (tx) => {
    // 1. Fetch fresh product data inside transaction to avoid stale prices or inactive items
    const freshItems: {
      product: typeof schema.products.$inferSelect;
      qty: number;
    }[] = [];

    // Batch-load all products in one round trip instead of one query per item
    const productIds = Array.from(new Set(data.items.map((i) => i.product.id)));
    const loadedProducts = await tx
      .select()
      .from(schema.products)
      .where(inArray(schema.products.id, productIds));
    const productById = new Map(loadedProducts.map((p) => [p.id, p]));

    for (const item of data.items) {
      const freshProduct = productById.get(item.product.id);

      if (!freshProduct?.active) {
        throw new Error(`Product "${item.product.name}" is currently unavailable.`);
      }

      // Atomic decrement: the stock guard lives in the UPDATE's WHERE clause so
      // two concurrent checkouts cannot both read the same count and oversell.
      let currentProduct = freshProduct;
      if (freshProduct.stockQty !== null) {
        const updated = await tx
          .update(schema.products)
          .set({ stockQty: sql`${schema.products.stockQty} - ${item.qty}` })
          .where(
            and(
              eq(schema.products.id, freshProduct.id),
              sql`${schema.products.stockQty} >= ${item.qty}`,
            ),
          )
          .returning({
            stockQty: schema.products.stockQty,
          });

        if (updated.length === 0) {
          throw new Error(
            `Insufficient stock for "${freshProduct.name}". Only ${freshProduct.stockQty} remaining.`,
          );
        }

        currentProduct = {
          ...freshProduct,
          stockQty: updated[0].stockQty,
        };
        // Keep in-memory value authoritative for duplicate lines in one cart
        productById.set(freshProduct.id, currentProduct);
      }

      freshItems.push({ product: currentProduct, qty: item.qty });
    }

    const totals = calculateCartTotals(freshItems, now);
    const snapshots = freshItems.map((item) =>
      createOrderItemSnapshot(item.product, item.qty, now),
    );

    // 2. Insert order
    await tx.insert(schema.orders).values({
      id: orderId,
      orgId: data.orgId,
      userId: data.userId || null,
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      notes: data.notes || null,
      totalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      finalCents: totals.totalCents,
      status: "placed",
    });

    // 3. Insert order item snapshots
    for (const snap of snapshots) {
      await tx.insert(schema.orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        productId: snap.productId,
        productName: snap.productName,
        priceCents: snap.priceCents,
        discountCents: snap.discountCents,
        finalPriceCents: snap.finalPriceCents,
        qty: snap.qty,
      });
    }

    // 4. Record initial status history
    await tx.insert(schema.orderStatusHistory).values({
      id: crypto.randomUUID(),
      orderId,
      status: "placed",
      actorRole: data.userId ? "buyer" : "guest",
      actorId: data.userId || null,
      notes: "Order placed by customer via store request.",
    });

    // 5. Clear cart if cartId provided
    if (data.cartId) {
      await tx.delete(schema.cartItems).where(eq(schema.cartItems.cartId, data.cartId));
    }

    return {
      orderId,
      orderNumber,
      totalCents: totals.totalCents,
    };
  });
}

export async function getOrderById(orderId: string) {
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  const history = await db
    .select()
    .from(schema.orderStatusHistory)
    .where(eq(schema.orderStatusHistory.orderId, order.id))
    .orderBy(desc(schema.orderStatusHistory.createdAt));

  return {
    ...order,
    items,
    history,
  };
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, orderNumber))
      .limit(1);

    if (!order) return null;

    const items = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, order.id));

    const history = await db
      .select()
      .from(schema.orderStatusHistory)
      .where(eq(schema.orderStatusHistory.orderId, order.id))
      .orderBy(desc(schema.orderStatusHistory.createdAt));

    return {
      ...order,
      items,
      history,
    };
  } catch {
    const found = MOCK_ORDERS.find((o) => o.orderNumber === orderNumber);
    return found || null;
  }
}

export async function getOrders(options?: {
  orgId?: string;
  userId?: string;
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit && options.limit > 0 ? options.limit : DEFAULT_PAGE_SIZE;
  const offset = options?.offset && options.offset > 0 ? options.offset : 0;

  try {
    const conditions = [];

    if (options?.orgId) {
      conditions.push(eq(schema.orders.orgId, options.orgId));
    }
    if (options?.userId) {
      conditions.push(eq(schema.orders.userId, options.userId));
    }
    if (options?.status) {
      conditions.push(eq(schema.orders.status, options.status));
    }

    return await db
      .select()
      .from(schema.orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit)
      .offset(offset);
  } catch {
    let list = MOCK_ORDERS;
    if (options?.status) {
      list = list.filter((o) => o.status === options.status);
    }
    return list.slice(offset, offset + limit);
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actor: { id?: string; role: "admin" | "system" },
  notes?: string,
) {
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error("Order not found.");
  }

  const currentStatus = order.status as OrderStatus;
  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(`Cannot transition order status from "${currentStatus}" to "${newStatus}".`);
  }

  await db.transaction(async (tx) => {
    // If transitioning to cancelled, restore product stock
    if (newStatus === "cancelled") {
      const items = await tx
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId));

      const productIds = Array.from(new Set(items.map((i) => i.productId)));
      if (productIds.length > 0) {
        const prods = await tx
          .select()
          .from(schema.products)
          .where(inArray(schema.products.id, productIds));
        const prodById = new Map(prods.map((p) => [p.id, p]));

        for (const item of items) {
          const prod = prodById.get(item.productId);
          if (prod && prod.stockQty !== null) {
            await tx
              .update(schema.products)
              .set({ stockQty: prod.stockQty + item.qty })
              .where(eq(schema.products.id, prod.id));
            prodById.set(prod.id, { ...prod, stockQty: prod.stockQty + item.qty });
          }
        }
      }
    }

    // Update order status
    await tx
      .update(schema.orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId));

    // Record audit trail
    await tx.insert(schema.orderStatusHistory).values({
      id: crypto.randomUUID(),
      orderId,
      status: newStatus,
      actorId: actor.id || null,
      actorRole: actor.role,
      notes: notes || `Status updated to ${newStatus}`,
    });
  });

  return getOrderById(orderId);
}
