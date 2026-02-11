import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatINR(number) {
    if (isNaN(number)) return "0";
    return new Intl.NumberFormat('en-IN').format(number);
}
