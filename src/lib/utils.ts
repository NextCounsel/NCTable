import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to display as "dd MMM, yyyy" (e.g., "24 May, 2005")
 * @param date - The date to format (Date object, string, or number)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    return format(dateObj, "dd MMM, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Format a date string from API that might be in different formats
 * @param dateString - The date string from API
 * @returns Formatted date string
 */
export function formatApiDate(dateString: string): string {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "dd MMM, yyyy");
  } catch (error) {
    console.error("Error formatting API date:", error);
    return dateString; // Return original if formatting fails
  }
}
