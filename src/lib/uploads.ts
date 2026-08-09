import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

export async function savePhoto(file: File): Promise<string> {
  const ext = ALLOWED_EXTENSIONS[file.type];
  if (!ext) {
    throw new Error("僅支援 JPEG、PNG、WEBP、HEIC 格式的圖片");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);

  return filename;
}

export function uploadFilePath(filename: string): string {
  return path.join(/* turbopackIgnore: true */ UPLOAD_DIR, path.basename(filename));
}
