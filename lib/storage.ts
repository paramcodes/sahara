import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export interface StorageProvider {
  save(buffer: Buffer | Uint8Array, originalFilename: string, mimeType: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
}

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function verifyImageSignature(buffer: Buffer | Uint8Array, mimeType: string): boolean {
  if (buffer.length < 8) return false;
  // JPEG: FF D8 FF
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType.includes("png")) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  // WebP: RIFF .... WEBP
  if (mimeType.includes("webp")) {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  }
  return false;
}

export class LocalDiskProvider implements StorageProvider {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir =
      uploadDir || process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async save(
    buffer: Buffer | Uint8Array,
    _originalFilename: string,
    mimeType: string,
  ): Promise<string> {
    const normalizedMime = mimeType.toLowerCase();
    const safeExt = MIME_TO_EXTENSION[normalizedMime];
    if (!safeExt) {
      throw new Error(`Invalid file format "${mimeType}". Only JPG, PNG, and WebP are allowed.`);
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error("File exceeds 5MB limit.");
    }

    if (!verifyImageSignature(buffer, normalizedMime)) {
      throw new Error("File content signature does not match image format.");
    }

    await this.ensureDir();

    // Derived strictly from MIME whitelist, user extension ignored
    const safeName = `${crypto.randomUUID()}${safeExt}`;
    const targetPath = path.resolve(this.uploadDir, safeName);
    if (!targetPath.startsWith(path.resolve(this.uploadDir))) {
      throw new Error("Invalid destination path.");
    }

    await fs.writeFile(targetPath, buffer);

    // Return public relative path
    return `/uploads/${safeName}`;
  }

  async delete(filePath: string): Promise<void> {
    if (!filePath?.startsWith("/uploads/")) {
      return;
    }
    const safeName = path.basename(filePath);
    const targetPath = path.resolve(this.uploadDir, safeName);
    if (!targetPath.startsWith(path.resolve(this.uploadDir))) {
      return;
    }
    try {
      await fs.unlink(targetPath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  getUrl(filePath: string): string {
    return filePath;
  }
}

// Default storage instance
export const storage: StorageProvider = new LocalDiskProvider();
