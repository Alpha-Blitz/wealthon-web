import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees)
}

export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(1)}Cr`
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(0)}K`
  return `₹${rupees}`
}
