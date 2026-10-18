/**
 * Single pricing engine for Sahara.
 * Shared by cart calculation, checkout, and admin preview.
 * All monetary amounts are integer cents.
 */

export interface DiscountableProduct {
  id: string;
  priceCents: number;
  discountType: string | null; // 'none' | 'percent' | 'fixed'
  discountValue: number | null;
  discountStartsAt?: Date | string | null;
  discountEndsAt?: Date | string | null;
  active?: boolean;
}

export interface DiscountResult {
  discountCents: number;
  finalPriceCents: number;
  isActive: boolean;
  savingsCents: number;
}

export interface CartLineItem {
  product: DiscountableProduct;
  qty: number;
}

export interface CartTotals {
  itemCount: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  priceCents: number;
  discountCents: number;
  finalPriceCents: number;
  qty: number;
}

/**
 * Evaluates whether a product's discount is currently active based on dates.
 */
export function isDiscountActive(
  discountType: string | null | undefined,
  discountValue: number | null | undefined,
  startsAt?: Date | string | null,
  endsAt?: Date | string | null,
  now: Date = new Date()
): boolean {
  if (!discountType || discountType === "none" || !discountValue || discountValue <= 0) {
    return false;
  }

  if (startsAt) {
    const startDate = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
    if (now < startDate) return false;
  }

  if (endsAt) {
    const endDate = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
    if (now > endDate) return false;
  }

  return true;
}

/**
 * Computes per-unit discount and final price in integer cents.
 */
export function calculateProductPrice(
  product: DiscountableProduct,
  now: Date = new Date()
): DiscountResult {
  const basePrice = Math.max(0, Math.round(product.priceCents || 0));
  const active = isDiscountActive(
    product.discountType,
    product.discountValue,
    product.discountStartsAt,
    product.discountEndsAt,
    now
  );

  if (!active) {
    return {
      discountCents: 0,
      finalPriceCents: basePrice,
      isActive: false,
      savingsCents: 0,
    };
  }

  let discountCents = 0;
  const val = Number(product.discountValue) || 0;

  if (product.discountType === "percent") {
    // Percent discount (e.g. 15% -> val = 15)
    const clampedPercent = Math.min(100, Math.max(0, val));
    discountCents = Math.round((basePrice * clampedPercent) / 100);
  } else if (product.discountType === "fixed") {
    // Fixed cents discount
    discountCents = Math.min(basePrice, Math.max(0, Math.round(val)));
  }

  const finalPriceCents = Math.max(0, basePrice - discountCents);

  return {
    discountCents,
    finalPriceCents,
    isActive: true,
    savingsCents: discountCents,
  };
}

/**
 * Calculates cart totals across an array of line items.
 */
export function calculateCartTotals(
  items: CartLineItem[],
  now: Date = new Date()
): CartTotals {
  let itemCount = 0;
  let subtotalCents = 0;
  let totalDiscountCents = 0;

  for (const item of items) {
    const safeQty = Math.max(0, Math.floor(item.qty || 0));
    itemCount += safeQty;

    const basePrice = Math.max(0, Math.round(item.product.priceCents || 0));
    const pricing = calculateProductPrice(item.product, now);

    subtotalCents += basePrice * safeQty;
    totalDiscountCents += pricing.discountCents * safeQty;
  }

  const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

  return {
    itemCount,
    subtotalCents,
    discountCents: totalDiscountCents,
    totalCents,
  };
}

/**
 * Creates immutable snapshot data for an order item row.
 */
export function createOrderItemSnapshot(
  product: DiscountableProduct & { name: string },
  qty: number,
  now: Date = new Date()
): OrderItemSnapshot {
  const safeQty = Math.max(1, Math.floor(qty || 1));
  const pricing = calculateProductPrice(product, now);
  const basePrice = Math.max(0, Math.round(product.priceCents || 0));

  return {
    productId: product.id,
    productName: product.name,
    priceCents: basePrice,
    discountCents: pricing.discountCents,
    finalPriceCents: pricing.finalPriceCents,
    qty: safeQty,
  };
}

/**
 * Format integer cents to currency string (e.g. 2400 -> "$24.00")
 */
export function formatCents(cents: number, currency: string = "USD"): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(safeCents / 100);
}
