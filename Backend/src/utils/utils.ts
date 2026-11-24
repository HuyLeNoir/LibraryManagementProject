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

// 1. String (chuỗi bất kỳ, kể cả chuỗi rỗng "")
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

// 2. Non-empty string (chuỗi có ký tự thực tế sau khi trim)
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

// 3. Number hợp lệ (loại trừ NaN và Infinity)
export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

// 4. Số nguyên (Integer)
export function isInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value);
}

// 5. Boolean
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

// 6. Plain Object (object thuần, không phải null và không phải Array)
export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 7. Array
export function isArrayOf<T>(
    value: unknown,
    itemGuard: (item: unknown) => item is T,
): value is T[] {
    return Array.isArray(value) && value.every(itemGuard);
}

// 8. Enum (string enum)
export function isEnumValue<T extends Record<string, string>>(
    enumObj: T,
    value: unknown,
): value is T[keyof T] {
    return typeof value === "string" && Object.values(enumObj).includes(value as T[keyof T]);
}

export function calculateOverdueFee(
    ngayDuKienTra: Date,
    ngayTra: Date,
    phiPhatMoiNgay = 10000,
): number {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const dueMs = ngayDuKienTra.getTime();
    const returnMs = ngayTra.getTime();

    if (Number.isNaN(dueMs) || Number.isNaN(returnMs)) {
        throw new Error("Ngày dự kiến trả hoặc ngày trả không hợp lệ");
    }

    if (returnMs <= dueMs) {
        return 0;
    }

    const soNgayTre = Math.ceil((returnMs - dueMs) / MS_PER_DAY);
    return soNgayTre * phiPhatMoiNgay;
}
