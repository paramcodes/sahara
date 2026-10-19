"use client";

import type React from "react";
import { useState } from "react";
import { updateProductDiscountAction } from "@/lib/actions/admin-products";
import { formatCents } from "@/lib/pricing";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export interface DiscountProductItem {
  id: string;
  name: string;
  priceCents: number;
  discountType: string | null;
  discountValue: number | null;
  discountStartsAt: Date | string | null;
  discountEndsAt: Date | string | null;
}

export function DiscountsManager({ products }: { products: DiscountProductItem[] }) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<string>("10");
  const [isSaving, setIsSaving] = useState(false);

  const activeDiscounts = products.filter(
    (p) => p.discountType && p.discountType !== "none" && (p.discountValue || 0) > 0,
  );

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSaving(true);

    const val = parseInt(discountValue, 10);
    const res = await updateProductDiscountAction(selectedProduct, {
      discountType,
      discountValue: Number.isNaN(val) ? 0 : val,
    });

    setIsSaving(false);
    if (res.success) {
      toast("Discount promotion applied successfully!", "success");
    } else {
      toast(res.error || "Failed to apply discount", "error");
    }
  };

  const handleClearDiscount = async (productId: string) => {
    const res = await updateProductDiscountAction(productId, {
      discountType: "none",
      discountValue: 0,
    });
    if (res.success) {
      toast("Discount cleared", "info");
    } else {
      toast("Failed to clear discount", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Active Discounts Table */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-sm overflow-clip p-6">
        <h2 className="text-base font-semibold text-[var(--ink)] mbe-4">
          Active Promotional Rules ({activeDiscounts.length})
        </h2>

        {activeDiscounts.length === 0 ? (
          <p className="text-xs text-[var(--ink-secondary)]">
            No active discounts currently applied to items.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {activeDiscounts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-medium text-[var(--ink)] block">{p.name}</span>
                  <span className="text-xs text-[var(--ink-tertiary)]">
                    Regular: {formatCents(p.priceCents)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="accent">
                    {p.discountType === "percent"
                      ? `${p.discountValue}% OFF`
                      : `-$${((p.discountValue || 0) / 100).toFixed(2)}`}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleClearDiscount(p.id)}>
                    Clear
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <form
        onSubmit={handleApplyDiscount}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-6 max-w-xl"
      >
        <h2 className="text-base font-semibold text-[var(--ink)]">Configure Product Promotion</h2>

        <div>
          <label className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5">
            Select Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatCents(p.priceCents)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5">
              Promotion Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)]"
            >
              <option value="percent">Percentage Off (%)</option>
              <option value="fixed">Fixed Amount Off (Cents)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5">
              {discountType === "percent" ? "Percentage (e.g. 20 for 20%)" : "Amount (cents)"}
            </label>
            <input
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)]"
            />
          </div>
        </div>

        <Button type="submit" size="md" isLoading={isSaving} className="self-start">
          Apply Promotion
        </Button>
      </form>
    </div>
  );
}
