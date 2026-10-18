"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, schema } from "../db";
import { getSession } from "../auth";
import crypto from "crypto";

const ReviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().trim().min(2, "Name must be at least 2 characters").max(64, "Name must be under 64 characters"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(4, "Review must be at least 4 characters").max(2000, "Review must be under 2000 characters"),
});

export async function postReviewAction(data: {
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
}) {
  const validated = ReviewSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid review inputs",
    };
  }

  const [org] = await db.select().from(schema.orgs).limit(1);
  if (!org) return { success: false, error: "Store not found" };

  const session = await getSession();

  try {
    await db.insert(schema.reviews).values({
      id: crypto.randomUUID(),
      orgId: org.id,
      productId: validated.data.productId,
      userId: session?.user?.id || null,
      authorName: validated.data.authorName,
      rating: validated.data.rating,
      comment: validated.data.comment,
      approved: true,
    });

    revalidatePath(`/product/[slug]`, "page");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to post review." };
  }
}
