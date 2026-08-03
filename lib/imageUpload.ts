import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export const maxImageSize = 5 * 1024 * 1024;

export function getImageExtension(fileType: string) {
  return allowedTypes.get(fileType);
}

export function getAllowedImageTypes() {
  return allowedTypes;
}

export async function persistInventoryImage(file: File) {
  const extension = getImageExtension(file.type);
  if (!extension) {
    throw new Error("Inventory images must be JPG, PNG, WEBP, or GIF.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `data:${file.type};base64,${bytes.toString("base64")}`;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "inventory");
  const resolvedPath = path.resolve(uploadsDir);
  const expectedPath = path.resolve(process.cwd(), "public", "uploads", "inventory");
  if (!resolvedPath.startsWith(expectedPath)) {
    throw new Error("Invalid upload path.");
  }

  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const destination = path.join(uploadsDir, filename);
  const resolvedDest = path.resolve(destination);
  if (!resolvedDest.startsWith(resolvedPath)) {
    throw new Error("Invalid file destination.");
  }

  await writeFile(destination, bytes);
  return `/uploads/inventory/${filename}`;
}
