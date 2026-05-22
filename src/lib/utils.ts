import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, maximumFractionDigits: number = 2): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(maximumFractionDigits)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(maximumFractionDigits)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
