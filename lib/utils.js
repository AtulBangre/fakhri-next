import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatINR(number) {
    if (!number) return "0";
    const cleanNumber = typeof number === 'string' ? parseFloat(number.replace(/[^0-9.-]+/g, "")) : Number(number);
    if (isNaN(cleanNumber)) return "0";
    return new Intl.NumberFormat('en-IN').format(cleanNumber);
}
