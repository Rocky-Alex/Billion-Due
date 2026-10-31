import type { Product } from "./demoData";

export const COMPUTER_CATEGORIES = [
  "Laptops",
  "Desktops",
  "Gaming PCs",
  "Monitors",
  "Components",
  "Accessories",
  "Software",
  "Services",
] as const;

export const COMPUTER_BRANDS = [
  "Apple",
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "MSI",
  "Samsung",
  "Kingston",
  "Crucial",
  "Logitech",
  "Microsoft",
  "Custom Rig",
  "Other",
] as const;

export const WARRANTY_OPTIONS = [
  "1 Month Testing Warranty",
  "15 Days Testing Warranty",
  "7 Days Testing Warranty",
  "3 Days Testing Warranty",
  "No Warranty",
] as const;

export const CONDITION_OPTIONS = [
  "Brand New",
  "Refurbished (Grade A)",
  "Open Box",
  "Used",
] as const;

export const DEFAULT_COMPUTER_PRODUCTS: Product[] = [];


export const DUMMY_PRODUCT_SKUS = new Set([
  "SRV-CON-01",
  "SRV-AUD-02",
  "SRV-RET-03",
  "HW-TRM-04",
]);

export const DUMMY_PRODUCT_IDS = new Set([
  "prod-1",
  "prod-2",
  "prod-3",
  "prod-4",
]);

export function isDummyProduct(p: Partial<Product> | null | undefined): boolean {
  if (!p) return false;
  if (p.id && DUMMY_PRODUCT_IDS.has(p.id)) return true;
  if (p.sku && DUMMY_PRODUCT_SKUS.has(p.sku)) return true;
  const name = (p.name || "").trim().toLowerCase();
  if (
    name === "standard consultation & advisory" ||
    name === "enterprise compliance audit" ||
    name === "monthly retainer services" ||
    name === "security & licensing assessment"
  ) {
    return true;
  }
  return false;
}


