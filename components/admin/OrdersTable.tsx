"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { formatCents } from "@/lib/pricing";

export interface OrderRowData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  finalCents: number;
  status: string;
  createdAt: Date;
}

export function OrdersTable({ initialOrders }: { initialOrders: OrderRowData[] }) {
  const [orders, setOrders] = useState<OrderRowData[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStatusChange = async (
    orderId: string,
    newStatus: "confirmed" | "fulfilled" | "cancelled"
  ) => {
    setLoadingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    setLoadingId(null);

    if (res.success) {
      toast(`Order marked as ${newStatus}`, "success");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      toast(res.error || "Update failed", "error");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-black/[0.06]">
        <p className="text-sm text-[var(--ink-secondary)]">
          No orders received yet. Share your store link to start taking orders!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl bg-white border border-black/[0.06] shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#fbfbfd] text-[var(--ink-secondary)] border-b border-black/[0.06] text-xs">
          <tr>
            <th className="py-3 px-4 font-medium">Order #</th>
            <th className="py-3 px-4 font-medium">Customer</th>
            <th className="py-3 px-4 font-medium">Contact</th>
            <th className="py-3 px-4 font-medium">Total</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.04]">
          {orders.map((order) => {
            const isLoading = loadingId === order.id;
            return (
              <tr key={order.id} className="hover:bg-black/[0.01] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[var(--ink)]">
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="hover:underline text-[var(--accent)]"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-medium text-[var(--ink)]">
                  {order.customerName}
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--ink-secondary)]">
                  <div>{order.customerPhone}</div>
                  <div className="text-gray-400">{order.customerEmail}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold tabular-nums text-[var(--ink)]">
                  {formatCents(order.finalCents)}
                </td>
                <td className="py-3.5 px-4">
                  {order.status === "placed" && (
                    <Badge variant="warning">Placed</Badge>
                  )}
                  {order.status === "confirmed" && (
                    <Badge variant="accent">Confirmed</Badge>
                  )}
                  {order.status === "fulfilled" && (
                    <Badge variant="success">Fulfilled</Badge>
                  )}
                  {order.status === "cancelled" && (
                    <Badge variant="error">Cancelled</Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex gap-1.5">
                    {order.status === "placed" && (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(order.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(order.id, "fulfilled")}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    {(order.status === "placed" || order.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(order.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
