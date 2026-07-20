import crypto from "crypto";
import bcrypt from "bcryptjs";

const SESSION_SECRET: string = process.env.SESSION_SECRET || "eskos-enterprise-secret-key-32-bytes-long-default-2026";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function encryptSession(data: any): string {
  const text = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  // Ensure secret is exactly 32 bytes
  const key = Buffer.concat([Buffer.from(SESSION_SECRET)], 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSession(token: string): any {
  try {
    const [ivHex, encrypted] = token.split(":");
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, "hex");
    const key = Buffer.concat([Buffer.from(SESSION_SECRET)], 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}
