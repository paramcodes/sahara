import { describe, expect, it } from "vitest";
import { LocalDiskProvider } from "../lib/storage";

describe("Storage Provider", () => {
  const provider = new LocalDiskProvider("/tmp/sahara-test-uploads");

  it("rejects unauthorized mime types", async () => {
    const dummyBuffer = Buffer.from("executable code");
    await expect(
      provider.save(dummyBuffer, "malware.exe", "application/x-msdownload"),
    ).rejects.toThrow("Invalid file format");
  });

  it("rejects oversized buffers above 5MB", async () => {
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 10);
    await expect(provider.save(largeBuffer, "huge.jpg", "image/jpeg")).rejects.toThrow(
      "File exceeds 5MB limit",
    );
  });

  it("saves valid image and returns public URL", async () => {
    // Valid WebP signature: RIFF
    const validBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
    const path = await provider.save(validBuffer, "photo.webp", "image/webp");
    expect(path).toMatch(/^\/uploads\/[0-9a-f-]+\.webp$/);
  });
});
