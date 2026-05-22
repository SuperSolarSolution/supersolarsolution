import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, fractionDigits: number = 2): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(fractionDigits)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(fractionDigits)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
