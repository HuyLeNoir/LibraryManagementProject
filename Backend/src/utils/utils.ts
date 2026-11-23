import crypto from "node:crypto";

export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHex] = storedHash.split(":");
    if (!salt || !originalHex) return false;

    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(originalHex, "hex");

    if (derivedBuffer.length !== originalBuffer.length) return false;
    return crypto.timingSafeEqual(derivedBuffer, originalBuffer);
}
