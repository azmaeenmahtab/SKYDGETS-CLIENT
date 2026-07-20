/**
 * Shared frontend utility functions.
 */

/**
 * Convert integer poisha to Bangladeshi Taka display string.
 * e.g. 150000 → "৳1,500.00"
 */
export function formatPrice(poisha: number): string {
  const taka = poisha / 100;
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(taka);
}

/**
 * Convert a string to a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format raw condition string to user-friendly format.
 */
export function formatCondition(condition: string): string {
  switch (condition) {
    case "new":
      return "New";
    case "like_new":
      return "Like New";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
    case "for_parts":
      return "For Parts";
    default:
      return condition;
  }
}
