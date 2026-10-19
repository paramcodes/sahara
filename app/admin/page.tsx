import { OrdersTable } from "@/components/admin/OrdersTable";
import { getOrders } from "@/lib/repos/orders";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const pendingCount = orders.filter((o) => o.status === "placed").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const fulfilledCount = orders.filter((o) => o.status === "fulfilled").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            Merchant Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mbs-0.5">
            Orders Inbox
          </h1>
        </div>

        {/* Quick KPI stats */}
        <div className="flex gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[var(--ink-secondary)] block">New Requests</span>
            <span className="text-base font-bold text-[var(--ink)] tabular-nums">
              {pendingCount}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[var(--ink-secondary)] block">Confirmed</span>
            <span className="text-base font-bold text-[var(--ink)] tabular-nums">
              {confirmedCount}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[var(--ink-secondary)] block">Delivered</span>
            <span className="text-base font-bold text-emerald-600 tabular-nums">
              {fulfilledCount}
            </span>
          </div>
        </div>
      </div>

      <OrdersTable
        initialOrders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerEmail: o.customerEmail,
          finalCents: o.finalCents,
          status: o.status,
          createdAt: o.createdAt,
        }))}
      />
    </div>
  );
}
