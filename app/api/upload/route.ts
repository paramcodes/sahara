import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const savedUrl = await storage.save(buffer, file.name, file.type);

    return NextResponse.json({ url: savedUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
