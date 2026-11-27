export { cn } from "cn";

export function formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null || Number.isNaN(value)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

export function formatDate(value: string | Date | undefined | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
