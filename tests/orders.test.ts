import { describe, it, expect } from "vitest";
import { canTransition } from "../lib/repos/orders";

describe("Order State Machine", () => {
  it("allows valid forward transitions", () => {
    expect(canTransition("placed", "confirmed")).toBe(true);
    expect(canTransition("placed", "cancelled")).toBe(true);
    expect(canTransition("confirmed", "fulfilled")).toBe(true);
    expect(canTransition("confirmed", "cancelled")).toBe(true);
  });

  it("blocks backward or invalid transitions", () => {
    expect(canTransition("confirmed", "placed")).toBe(false);
    expect(canTransition("fulfilled", "placed")).toBe(false);
    expect(canTransition("fulfilled", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
    expect(canTransition("cancelled", "fulfilled")).toBe(false);
  });
});
