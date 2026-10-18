export interface DiscountableProduct {
  id: string;
  priceCents: number;
  discountType: string | null;
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

export function isDiscountActive(
  discountType: string | null | undefined,
  discountValue: number | null | undefined,
  startsAt?: Date | string | null,
  endsAt?: Date | string | null,
  now: Date = new Date(),
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

export function calculateProductPrice(
  product: DiscountableProduct,
  now: Date = new Date(),
): DiscountResult {
  const basePrice = Math.max(0, Math.round(product.priceCents || 0));
  const active = isDiscountActive(
    product.discountType,
    product.discountValue,
    product.discountStartsAt,
    product.discountEndsAt,
    now,
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
    const clampedPercent = Math.min(100, Math.max(0, val));
    discountCents = Math.round((basePrice * clampedPercent) / 100);
  } else if (product.discountType === "fixed") {
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

export function calculateCartTotals(items: CartLineItem[], now: Date = new Date()): CartTotals {
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

export function createOrderItemSnapshot(
  product: DiscountableProduct & { name: string },
  qty: number,
  now: Date = new Date(),
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

export function formatCents(cents: number, currency: string = "USD"): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(safeCents / 100);
}
