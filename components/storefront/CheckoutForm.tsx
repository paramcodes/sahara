"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { placeOrderAction } from "@/lib/actions/orders";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await placeOrderAction(formData);
    setIsSubmitting(false);

    if (res.success && res.orderNumber) {
      toast("Order request received!", "success");
      router.push(`/orders/${res.orderNumber}`);
    } else {
      toast(res.error || "Failed to submit order request.", "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)] tracking-tight">
          Delivery Details
        </h2>
        <p className="text-xs text-[var(--ink-secondary)] mbs-0.5">
          We will contact you via WhatsApp or phone to confirm dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="customerName"
            className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5"
          >
            Full Name *
          </label>
          <input
            id="customerName"
            type="text"
            required
            name="customerName"
            autoComplete="name"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="customerEmail"
            className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5"
          >
            Email Address *
          </label>
          <input
            id="customerEmail"
            type="email"
            required
            name="customerEmail"
            autoComplete="email"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="jane@example.com"
            className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="customerPhone"
          className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5"
        >
          Phone Number (for Order Confirmation) *
        </label>
        <input
          id="customerPhone"
          type="tel"
          required
          name="customerPhone"
          autoComplete="tel"
          value={formData.customerPhone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="customerAddress"
          className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5"
        >
          Delivery Address *
        </label>
        <textarea
          id="customerAddress"
          required
          rows={3}
          name="customerAddress"
          autoComplete="street-address"
          value={formData.customerAddress}
          onChange={handleChange}
          placeholder="Street address, apartment or suite, city, postal code"
          className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-xs font-medium text-[var(--ink-secondary)] mbe-1.5"
        >
          Special Notes or Delivery Instructions (Optional)
        </label>
        <input
          id="notes"
          type="text"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="e.g. Leave with building concierge"
          className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
        />
      </div>

      <div className="pbs-4 border-t border-black/[0.06] flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full text-base font-medium py-3.5 shadow-md"
        >
          Submit Order Request
        </Button>

        <p className="text-xs text-[var(--ink-tertiary)] text-center flex items-center justify-center gap-1.5">
          <span>🔒</span> Pay upon delivery. No card required upfront.
        </p>
      </div>
    </form>
  );
}
