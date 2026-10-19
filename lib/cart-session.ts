import crypto from "node:crypto";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "sahara_cart_id";

/**
 * Resolve the guest cart id.
 *
 * `persist` must only be true from a Server Action or Route Handler: writing a
 * cookie during a Server Component render throws in Next.js. During render we
 * still hand back a stable-per-render id so reads work, but nothing is written
 * and no cart row is created until a mutation actually happens.
 */
export async function getCartSessionId(options?: { persist?: boolean }): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const newId = crypto.randomUUID();

  if (options?.persist) {
    cookieStore.set(CART_COOKIE_NAME, newId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return newId;
}
