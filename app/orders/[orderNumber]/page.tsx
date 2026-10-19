import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/pricing";
import { getOrderByNumber } from "@/lib/repos/orders";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const steps = [
    { key: "placed", label: "Request Placed" },
    { key: "confirmed", label: "Confirmed by Merchant" },
    { key: "fulfilled", label: "Fulfilled / Delivered" },
  ];

  const currentStatusIndex =
    order.status === "cancelled" ? -1 : steps.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {/* Success Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm mbe-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mbe-3 animate-pop-in">
            ✓
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--accent)] mbe-1">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mbe-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] max-w-md">
            Thank you, {order.customerName}. We have received your order request and will reach out
            to schedule delivery.
          </p>

          {/* Stepper Status Bar */}
          {order.status === "cancelled" ? (
            <div className="mbs-6">
              <Badge variant="error">Order Cancelled</Badge>
            </div>
          ) : (
            <div className="w-full max-w-md mbs-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting Bar */}
                <div className="absolute inset-is-6 inset-ie-6 inset-bs-3 h-0.5 bg-black/[0.06] -z-0" />
                <div
                  className="absolute inset-is-6 inset-ie-6 inset-bs-3 h-0.5 bg-[var(--accent)] -z-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    transform: `scaleX(${
                      currentStatusIndex <= 0 ? 0 : currentStatusIndex === 1 ? 0.5 : 0.8
                    })`,
                  }}
                />

                {steps.map((step, idx) => {
                  const isDone = idx <= currentStatusIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isDone
                            ? "bg-[var(--accent)] text-white shadow-sm"
                            : "bg-white border-2 border-black/[0.1] text-gray-400"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-[var(--ink-secondary)] mbs-2 text-center max-w-[80px]">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Items */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--ink)]">Items Ordered</h2>
            <div className="flex flex-col divide-y divide-black/[0.04]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex justify-between items-center text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-medium text-[var(--ink)] block">{item.productName}</span>
                    <span className="text-xs text-[var(--ink-secondary)]">
                      Qty: {item.qty} × {formatCents(item.finalPriceCents)}
                    </span>
                  </div>
                  <span className="font-semibold text-[var(--ink)] tabular-nums">
                    {formatCents(item.finalPriceCents * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pbs-3 border-t border-black/[0.06] flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-[var(--ink-secondary)]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCents(order.totalCents)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatCents(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base text-[var(--ink)] pbs-2 border-t border-black/[0.04]">
                <span>Total Due on Delivery</span>
                <span className="tabular-nums">{formatCents(order.finalCents)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--ink)]">Delivery Information</h2>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[var(--ink-secondary)]">
              <div>
                <span className="text-[var(--ink-tertiary)] block text-[11px]">Recipient</span>
                <span className="font-medium text-[var(--ink)]">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[var(--ink-tertiary)] block text-[11px]">Contact</span>
                <span className="text-[var(--ink)]">{order.customerEmail}</span>
                <span className="block text-[var(--ink)]">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-[var(--ink-tertiary)] block text-[11px]">Address</span>
                <span className="text-[var(--ink)] leading-relaxed">{order.customerAddress}</span>
              </div>
              {order.notes && (
                <div>
                  <span className="text-[var(--ink-tertiary)] block text-[11px]">
                    Special Instructions
                  </span>
                  <span className="text-[var(--ink)]">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Audit History */}
            {order.history && order.history.length > 0 && (
              <div className="pbs-4 border-t border-black/[0.06]">
                <h3 className="text-xs font-semibold text-[var(--ink-tertiary)] uppercase tracking-wider mbe-2">
                  Timeline
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  {order.history.map((h) => (
                    <div key={h.id} className="flex justify-between text-gray-500">
                      <span>{h.notes || h.status}</span>
                      <span className="tabular-nums">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mbs-8 flex justify-center">
          <Link href="/#catalog">
            <Button variant="secondary" size="md">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
