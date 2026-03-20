import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceRounded(value: string | number) {
  const numeric =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return Math.round(safe).toString();
}
