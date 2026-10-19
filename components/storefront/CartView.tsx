"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { removeCartItemAction, updateCartItemQtyAction } from "@/lib/actions/cart";
import { calculateCartTotals, calculateProductPrice, formatCents } from "@/lib/pricing";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Stepper } from "../ui/Stepper";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  discountType: string | null;
  discountValue: number | null;
  discountStartsAt: Date | string | null;
  discountEndsAt: Date | string | null;
  bannerPath: string | null;
  stockQty: number | null;
}

export interface CartItemView {
  id: string;
  productId: string;
  qty: number;
  product: CartProduct;
}

export function CartView({ initialItems }: { initialItems: CartItemView[] }) {
  const [items, setItems] = useState<CartItemView[]>(initialItems);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleQtyChange = async (itemId: string, newQty: number) => {
    setLoadingItemId(itemId);
    setItems((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, qty: newQty } : item))
        .filter((item) => item.qty > 0),
    );

    await updateCartItemQtyAction(itemId, newQty);
    setLoadingItemId(null);
  };

  const handleRemove = async (itemId: string) => {
    setLoadingItemId(itemId);
    setRemovingIds((prev) => new Set(prev).add(itemId));
    await new Promise((resolve) => setTimeout(resolve, 200));
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    await removeCartItemAction(itemId);
    setLoadingItemId(null);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Explore our collection of handcrafted essentials and add your favorites."
        actionText="Browse Collection"
        actionHref="/#catalog"
      />
    );
  }

  const totals = calculateCartTotals(items.map((i) => ({ product: i.product, qty: i.qty })));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
      {/* Cart Items List */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {items.map((item) => {
          const pricing = calculateProductPrice(item.product);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.04] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                removingIds.has(item.id) ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black/[0.03] overflow-clip shrink-0 border border-black/[0.04]">
                  {item.product.bannerPath ? (
                    <Image
                      src={item.product.bannerPath}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      Item
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="text-sm sm:text-base font-medium text-[var(--ink)] hover:underline"
                  >
                    {item.product.name}
                  </Link>

                  <div className="text-xs text-[var(--ink-secondary)] mbs-1">
                    {pricing.isActive ? (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--ink)]">
                          <span className="sr-only">Sale price: </span>
                          {formatCents(pricing.finalPriceCents)}
                        </span>
                        <span className="line-through text-gray-500">
                          <span className="sr-only">Original price: </span>
                          {formatCents(item.product.priceCents)}
                        </span>
                      </span>
                    ) : (
                      <span>{formatCents(item.product.priceCents)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Remove */}
              <div className="flex items-center gap-3">
                <Stepper
                  value={item.qty}
                  min={1}
                  max={item.product.stockQty || 99}
                  onChange={(val) => handleQtyChange(item.id, val)}
                  disabled={loadingItemId === item.id || removingIds.has(item.id)}
                />

                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove ${item.product.name} from bag`}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[var(--ink-secondary)] hover:text-[var(--error)] flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-black/[0.1]"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-5 sticky inset-bs-20">
        <h2 className="text-base font-semibold text-[var(--ink)] tracking-tight">Order Summary</h2>

        <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[var(--ink-secondary)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[var(--ink)] tabular-nums">
              {formatCents(totals.subtotalCents)}
            </span>
          </div>

          {totals.discountCents > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discounts Applied</span>
              <span className="tabular-nums">-{formatCents(totals.discountCents)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Estimated Shipping</span>
            <span className="text-emerald-700 font-medium">Complimentary</span>
          </div>

          <div className="pbs-3 border-t border-black/[0.06] flex justify-between text-base font-semibold text-[var(--ink)]">
            <span>Total</span>
            <span className="tabular-nums">{formatCents(totals.totalCents)}</span>
          </div>
        </div>

        <Link href="/checkout">
          <Button size="lg" className="w-full text-sm font-medium py-3.5 shadow-md">
            Proceed to Request Order
          </Button>
        </Link>

        <p className="text-[11px] text-[var(--ink-tertiary)] text-center">
          Payment is collected upon delivery. No card required upfront.
        </p>
      </div>
    </div>
  );
}
