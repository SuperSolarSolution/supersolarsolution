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

export function getOrdinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
