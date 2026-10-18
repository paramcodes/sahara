"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProductAction, toggleProductActiveAction } from "@/lib/actions/admin-products";
import { formatCents } from "@/lib/pricing";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { useToast } from "../ui/Toast";

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stockQty: number | null;
  active: boolean;
  bannerPath: string | null;
}

export function ProductsManager({ initialProducts }: { initialProducts: AdminProductItem[] }) {
  const [products, setProducts] = useState<AdminProductItem[]>(initialProducts);
  const { toast } = useToast();

  const handleToggleActive = async (id: string, current: boolean) => {
    const next = !current;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: next } : p)));

    const res = await toggleProductActiveAction(id, next);
    if (res.success) {
      toast(next ? "Product activated" : "Product paused", "info");
    } else {
      toast("Could not update status", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
    const res = await deleteProductAction(id);
    if (res.success) {
      toast("Product deleted", "info");
    } else {
      toast("Could not delete product", "error");
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-black/[0.06] flex flex-col items-center">
        <h3 className="text-base font-semibold text-[var(--ink)] mb-2">
          No products in your catalog yet
        </h3>
        <p className="text-xs text-[var(--ink-secondary)] mb-6 max-w-sm">
          Add your very first product in under two minutes with photos, specs, and price.
        </p>
        <Link href="/admin/products/new">
          <Button size="md">Add Your First Product</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl bg-white border border-black/[0.06] shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#fbfbfd] text-[var(--ink-secondary)] border-b border-black/[0.06] text-xs">
          <tr>
            <th className="py-3 px-4 font-medium">Item</th>
            <th className="py-3 px-4 font-medium">Price</th>
            <th className="py-3 px-4 font-medium">Stock Status</th>
            <th className="py-3 px-4 font-medium">Active</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.04]">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-black/[0.01] transition-colors">
              <td className="py-3.5 px-4 font-medium text-[var(--ink)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/[0.03] overflow-hidden shrink-0 border border-black/[0.04]">
                    {p.bannerPath ? (
                      <img src={p.bannerPath} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        Item
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold block text-[var(--ink)]">{p.name}</span>
                    <span className="text-[11px] text-[var(--ink-tertiary)]">
                      /product/{p.slug}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4 font-semibold tabular-nums text-[var(--ink)]">
                {formatCents(p.priceCents)}
              </td>
              <td className="py-3.5 px-4 text-xs">
                {p.stockQty === null ? (
                  <Badge variant="neutral">Made to order</Badge>
                ) : p.stockQty > 0 ? (
                  <span className="text-emerald-700 font-medium">{p.stockQty} in stock</span>
                ) : (
                  <Badge variant="error">Out of stock</Badge>
                )}
              </td>
              <td className="py-3.5 px-4">
                <Switch checked={p.active} onChange={() => handleToggleActive(p.id, p.active)} />
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="inline-flex gap-2">
                  <Link href={`/product/${p.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      View ↗
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(p.id, p.name)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
