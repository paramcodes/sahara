import crypto from "node:crypto";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "sahara_cart_id";

export async function getCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const newId = crypto.randomUUID();
  cookieStore.set(CART_COOKIE_NAME, newId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return newId;
}
