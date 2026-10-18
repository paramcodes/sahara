"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Stepper } from "../ui/Stepper";
import { useToast } from "../ui/Toast";
import { addToCartAction } from "@/lib/actions/cart";

export function AddToCartForm({
  productId,
  stockQty,
}: {
  productId: string;
  stockQty: number | null;
}) {
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isOutOfStock = stockQty !== null && stockQty <= 0;
  const maxAvailable = stockQty !== null ? stockQty : 99;

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCartAction(productId, qty);
      toast("Added to your shopping bag", "success");
    } catch {
      toast("Failed to add to bag. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isOutOfStock) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-[var(--error)] text-center text-sm font-medium">
        This item is currently sold out.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--ink-secondary)]">
          Quantity
        </span>
        <Stepper
          value={qty}
          min={1}
          max={maxAvailable}
          onChange={setQty}
        />
      </div>

      <Button
        size="lg"
        onClick={handleAddToCart}
        isLoading={isLoading}
        className="w-full text-base font-medium py-3.5 shadow-md"
      >
        Add to Bag
      </Button>

      <p className="text-xs text-[var(--ink-tertiary)] text-center flex items-center justify-center gap-1.5">
        <svg
          className="w-3.5 h-3.5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Pay on delivery — confirm by message
      </p>
    </div>
  );
}
