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
    window: 60,
    max: 100,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      orgId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
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

export async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

export async function requireSession(redirectTo = "/auth/login") {
  const session = await getSession();
  if (!session?.user) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireAdmin(redirectTo = "/auth/login") {
  const session = await requireSession(redirectTo);
  if (session.user.role !== "admin") {
    redirect("/auth/forbidden");
  }
  return session;
}
