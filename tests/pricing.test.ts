import { describe, expect, it } from "vitest";
import {
  calculateCartTotals,
  calculateProductPrice,
  createOrderItemSnapshot,
  formatCents,
  isDiscountActive,
} from "../lib/pricing";

describe("Pricing Engine", () => {
  it("formats integer cents into readable USD currency", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(2400)).toBe("$24.00");
    expect(formatCents(12999)).toBe("$129.99");
  });

  describe("calculateProductPrice", () => {
    it("returns base price when discountType is none", () => {
      const res = calculateProductPrice({
        id: "p1",
        priceCents: 5000,
        discountType: "none",
        discountValue: 0,
      });
      expect(res.discountCents).toBe(0);
      expect(res.finalPriceCents).toBe(5000);
      expect(res.isActive).toBe(false);
    });

    it("applies percent discounts correctly", () => {
      const res = calculateProductPrice({
        id: "p2",
        priceCents: 10000,
        discountType: "percent",
        discountValue: 15,
      });
      expect(res.discountCents).toBe(1500);
      expect(res.finalPriceCents).toBe(8500);
      expect(res.isActive).toBe(true);
    });

    it("applies fixed discounts correctly and clamps to base price", () => {
      const res = calculateProductPrice({
        id: "p3",
        priceCents: 3000,
        discountType: "fixed",
        discountValue: 1000,
      });
      expect(res.discountCents).toBe(1000);
      expect(res.finalPriceCents).toBe(2000);

      const oversized = calculateProductPrice({
        id: "p4",
        priceCents: 1500,
        discountType: "fixed",
        discountValue: 3000,
      });
      expect(oversized.discountCents).toBe(1500);
      expect(oversized.finalPriceCents).toBe(0);
    });

    it("respects start and end date windows", () => {
      const past = new Date("2026-01-01T00:00:00Z");
      const future = new Date("2026-12-31T23:59:59Z");
      const now = new Date("2026-06-15T12:00:00Z");

      expect(isDiscountActive("percent", 20, past, future, now)).toBe(true);

      expect(isDiscountActive("percent", 20, future, null, now)).toBe(false);

      expect(isDiscountActive("percent", 20, null, past, now)).toBe(false);
    });
  });

  describe("calculateCartTotals", () => {
    it("computes accurate subtotal, discounts, and final total", () => {
      const items = [
        {
          product: {
            id: "p1",
            priceCents: 2000,
            discountType: "none",
            discountValue: 0,
          },
          qty: 2,
        },
        {
          product: {
            id: "p2",
            priceCents: 10000,
            discountType: "percent",
            discountValue: 20,
          },
          qty: 1,
        },
      ];

      const totals = calculateCartTotals(items);
      expect(totals.itemCount).toBe(3);
      expect(totals.subtotalCents).toBe(14000);
      expect(totals.discountCents).toBe(2000);
      expect(totals.totalCents).toBe(12000);
    });
  });

  describe("createOrderItemSnapshot", () => {
    it("creates an immutable snapshot with base and discounted unit prices", () => {
      const snapshot = createOrderItemSnapshot(
        {
          id: "prod-1",
          name: "Handmade Ceramic Mug",
          priceCents: 3400,
          discountType: "fixed",
          discountValue: 400,
        },
        3,
      );

      expect(snapshot.productId).toBe("prod-1");
      expect(snapshot.productName).toBe("Handmade Ceramic Mug");
      expect(snapshot.priceCents).toBe(3400);
      expect(snapshot.discountCents).toBe(400);
      expect(snapshot.finalPriceCents).toBe(3000);
      expect(snapshot.qty).toBe(3);
    });
  });
});
