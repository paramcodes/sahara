import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  rateLimit: {
    window: 60, // 60 seconds
    max: 100, // 100 requests per window
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Security: prevent client from elevating to admin during signup
      },
      orgId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: (() => {
    if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
      throw new Error(
        "CRITICAL: BETTER_AUTH_SECRET environment variable is missing in production.",
      );
    }
    return process.env.BETTER_AUTH_SECRET || "dev_secret_must_be_at_least_32_characters_long_12345";
  })(),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * Server-side helper to fetch current session and user
 */
export async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Route protection: requires an authenticated user or redirects to login
 */
export async function requireSession(redirectTo = "/auth/login") {
  const session = await getSession();
  if (!session?.user) {
    redirect(redirectTo);
  }
  return session;
}

/**
 * Route protection: requires admin role or redirects
 */
export async function requireAdmin(redirectTo = "/auth/login") {
  const session = await requireSession(redirectTo);
  if (session.user.role !== "admin") {
    redirect("/auth/forbidden");
  }
  return session;
}
