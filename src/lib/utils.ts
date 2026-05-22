import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 2;
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(decimals)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(decimals)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
