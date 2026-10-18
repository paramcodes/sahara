"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { createProductAction } from "@/lib/actions/admin-products";

export function AddProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState("");
  const [priceDollars, setPriceDollars] = useState("");
  const [description, setDescription] = useState("");
  const [stockQty, setStockQty] = useState<string>("");
  const [bannerPath, setBannerPath] = useState("");
  const [featured, setFeatured] = useState(false);

  // Dynamic specs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Material", value: "" },
    { key: "Dimensions", value: "" },
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setBannerPath(data.url);
        toast("Photo uploaded successfully!", "success");
      } else {
        toast(data.error || "Upload failed", "error");
      }
    } catch {
      toast("Upload failed. Check your network or file size.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSpecRow = () => {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    setSpecs((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Please provide a product title", "error");
      return;
    }

    const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      toast("Please enter a valid price", "error");
      return;
    }

    setIsSubmitting(true);

    const cleanSpecs = specs.filter((s) => s.key.trim() && s.value.trim());

    const res = await createProductAction({
      name: name.trim(),
      description: description.trim(),
      priceCents,
      discountType: "none",
      discountValue: 0,
      stockQty: stockQty === "" ? null : parseInt(stockQty, 10),
      bannerPath: bannerPath || null,
      featured,
      specs: cleanSpecs,
    });

    setIsSubmitting(false);

    if (res.success && res.product) {
      toast("Product published live!", "success");
      router.push("/admin/products");
    } else {
      toast(res.error || "Failed to publish product", "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-8 max-w-2xl"
    >
      {/* 1. Photo First per spec */}
      <div>
        <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
          1. Product Photography (Photo First)
        </label>
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-2xl bg-black/[0.03] border-2 border-dashed border-black/[0.1] flex items-center justify-center overflow-hidden shrink-0">
            {bannerPath ? (
              <img
                src={bannerPath}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
            ) : isUploading ? (
              <span className="text-xs text-[var(--ink-secondary)] animate-pulse">
                Uploading...
              </span>
            ) : (
              <span className="text-xs text-gray-400 text-center px-2">
                No photo chosen
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex">
              <span className="px-4 py-2 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-xs font-medium text-[var(--ink)] cursor-pointer transition-colors">
                Choose Image File
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-[var(--ink-tertiary)]">
              JPG, PNG, WebP up to 5MB.
            </span>
            <input
              type="text"
              value={bannerPath}
              onChange={(e) => setBannerPath(e.target.value)}
              placeholder="Or paste external image URL"
              className="text-xs bg-black/[0.03] border border-black/[0.08] rounded-lg p-2 text-[var(--ink)]"
            />
          </div>
        </div>
      </div>

      {/* 2. Core Info */}
      <div className="flex flex-col gap-4">
        <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
          2. Essential Details
        </label>

        <div>
          <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Product Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Stoneware Espresso Cup"
            className="w-full text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              Price (USD $) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              placeholder="38.00"
              className="w-full text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              Stock Quantity (Leave blank if made to order)
            </label>
            <input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              placeholder="Unlimited / Made to order"
              className="w-full text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Story, material composition, texture, and inspiration..."
            className="w-full text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
          />
        </div>
      </div>

      {/* 3. Specifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
            3. Specifications Table (Optional)
          </label>
          <button
            type="button"
            onClick={handleAddSpecRow}
            className="text-xs text-[var(--apple-blue)] font-medium hover:underline cursor-pointer"
          >
            + Add Spec Row
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Key (e.g. Material)"
                value={spec.key}
                onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                className="w-1/3 text-xs bg-black/[0.03] border border-black/[0.08] rounded-lg p-2.5"
              />
              <input
                type="text"
                placeholder="Value (e.g. 100% Linen)"
                value={spec.value}
                onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                className="flex-1 text-xs bg-black/[0.03] border border-black/[0.08] rounded-lg p-2.5"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="w-7 h-7 text-xs text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="shadow-md text-sm font-medium px-8"
        >
          Publish Live to Storefront
        </Button>

        <span className="text-xs text-[var(--ink-secondary)]">
          Takes effect immediately on catalog
        </span>
      </div>
    </form>
  );
}
