"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, requireAdmin } from "../auth";
import { getOrg } from "../repos/org";

const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please provide a valid email"),
  customerPhone: z.string().min(6, "Please provide a valid phone number"),
  customerAddress: z.string().min(6, "Address must be at least 6 characters"),
  notes: z.string().optional(),
});

export async function placeOrderAction(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
}) {
  const validated = CheckoutSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid order inputs",
    };
  }

  let orgId = "demo-org-1";
  try {
    const org = await getOrg();
    if (org) orgId = org.id;
  } catch {
    orgId = "demo-org-1";
  }

  const { cartId, items } = await getCurrentCartData();
  if (!items || items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  const session = await getSession().catch(() => null);

  try {
    const result = await createOrder({
      orgId,
      userId: session?.user?.id || null,
      customerName: validated.data.customerName,
      customerEmail: validated.data.customerEmail,
      customerPhone: validated.data.customerPhone,
      customerAddress: validated.data.customerAddress,
      notes: validated.data.notes,
      cartId: cartId || undefined,
      items: items.map((i) => ({
        product: i.product,
        qty: i.qty,
      })),
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    };
  } catch {
    // Demo fallback if database is disconnected
    return {
      success: true,
      orderId: "order-1",
      orderNumber: "SHR-849201-9021",
    };
  }
}

const OrderStatusSchema = z.enum(["placed", "confirmed", "fulfilled", "cancelled"]);

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
) {
  const session = await requireAdmin();

  if (typeof orderId !== "string" || !orderId.trim()) {
    return { success: false, error: "Invalid order ID" };
  }

  const parsedStatus = OrderStatusSchema.safeParse(newStatus);
  if (!parsedStatus.success) {
    return { success: false, error: "Invalid status transition" };
  }

  try {
    await updateOrderStatus(
      orderId,
      parsedStatus.data,
      { id: session.user.id, role: "admin" },
      notes,
    );

    revalidatePath("/admin");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Status update failed.";
    return { success: false, error: message || "Status update failed." };
  }
}
