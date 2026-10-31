import { describe, it, expect } from "vitest";
import type { Customer, Product, Invoice } from "../shared/src/domain/demoData";
import {
  DEFAULT_COMPUTER_PRODUCTS,
  WARRANTY_OPTIONS,
  isDummyProduct,
} from "../shared/src/domain/computerCatalog";

describe("Customer and Product Management", () => {
  describe("Customer Auto-Sync and Financial Metrics", () => {
    it("should calculate customer lifetime invoiced, total paid, and total due correctly", () => {
      const customer: Customer = {
        id: "cust-1",
        name: "Al Baraka Trading LLC",
        phone: "+971 50 111 2222",
        email: "finance@albaraka.ae",
      };

      const invoices: Invoice[] = [
        {
          id: "INV-001",
          customer: "Al Baraka Trading LLC",
          issued: "2026-10-01",
          due: "2026-10-15",
          amount: 5000,
          status: "Paid",
        },
        {
          id: "INV-002",
          customer: "Al Baraka Trading LLC",
          issued: "2026-10-10",
          due: "2026-10-24",
          amount: 3200,
          status: "Sent",
        },
        {
          id: "INV-003",
          customer: "Al Baraka Trading LLC",
          issued: "2026-10-12",
          due: "2026-10-20",
          amount: 1800,
          status: "Overdue",
        },
      ];

      // Financial calculations as done in CustomerManager
      const custInvoices = invoices.filter(
        (i) => i.customer.trim().toLowerCase() === customer.name.trim().toLowerCase()
      );
      const totalInvoiced = custInvoices.reduce((sum, i) => sum + i.amount, 0);
      const totalPaid = custInvoices
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + i.amount, 0);
      const totalDue = custInvoices
        .filter((i) => i.status !== "Paid")
        .reduce((sum, i) => sum + i.amount, 0);

      expect(totalInvoiced).toBe(10000);
      expect(totalPaid).toBe(5000);
      expect(totalDue).toBe(5000);
      expect(custInvoices).toHaveLength(3);
    });

    it("should automatically sync new customer from invoice creation", () => {
      let customers: Customer[] = [
        {
          id: "cust-1",
          name: "Existing Customer",
          phone: "971500000000",
        },
      ];

      const newInvoice: Invoice = {
        id: "INV-105",
        customer: "New Tech Solutions LLC",
        customerPhone: "+971 55 987 6543",
        customerEmail: "contact@newtech.ae",
        issued: "2026-10-26",
        due: "2026-11-09",
        amount: 4500,
        status: "Draft",
      };

      // Auto-sync function as executed when saving invoice
      const syncCustomer = (inv: Invoice, currentList: Customer[]): Customer[] => {
        const nameKey = inv.customer.trim().toLowerCase();
        const existingIdx = currentList.findIndex(
          (c) => c.name.trim().toLowerCase() === nameKey
        );
        if (existingIdx >= 0) {
          const updated = [...currentList];
          updated[existingIdx] = {
            ...updated[existingIdx],
            phone: inv.customerPhone || updated[existingIdx].phone,
            email: inv.customerEmail || updated[existingIdx].email,
          };
          return updated;
        } else {
          return [
            {
              id: `cust-${Date.now()}`,
              name: inv.customer.trim(),
              phone: inv.customerPhone || "",
              email: inv.customerEmail || "",
              createdAt: inv.issued,
            },
            ...currentList,
          ];
        }
      };

      customers = syncCustomer(newInvoice, customers);
      expect(customers).toHaveLength(2);
      expect(customers[0].name).toBe("New Tech Solutions LLC");
      expect(customers[0].phone).toBe("+971 55 987 6543");
      expect(customers[0].email).toBe("contact@newtech.ae");

      // Now save another invoice for same customer with updated phone
      const secondInvoice: Invoice = {
        id: "INV-106",
        customer: "New Tech Solutions LLC",
        customerPhone: "+971 50 888 9999",
        issued: "2026-10-27",
        due: "2026-11-10",
        amount: 1500,
        status: "Paid",
      };

      customers = syncCustomer(secondInvoice, customers);
      // Length should not increase
      expect(customers).toHaveLength(2);
      // Phone should be updated
      expect(customers[0].phone).toBe("+971 50 888 9999");
      // Existing email should be preserved
      expect(customers[0].email).toBe("contact@newtech.ae");
    });
  });

  describe("Product Catalog and Autocomplete Filtering", () => {
    const products: Product[] = [
      {
        id: "prod-1",
        name: "Standard Consultation & Advisory",
        sku: "SRV-CONS-01",
        price: 350.0,
        tax: 5,
        stock: null,
        category: "Services",
      },
      {
        id: "prod-2",
        name: "Enterprise Software License",
        sku: "SFT-ENT-02",
        price: 1200.0,
        tax: 5,
        stock: null,
        category: "Software",
      },
      {
        id: "prod-3",
        name: "Hardware Terminal Device",
        sku: "HW-TRM-04",
        price: 1850.0,
        tax: 5,
        stock: 12,
        category: "Hardware",
      },
    ];

    it("should filter matching products by description query", () => {
      const query = "soft";
      const matches = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe("Enterprise Software License");
      expect(matches[0].price).toBe(1200.0);
      expect(matches[0].tax).toBe(5);
    });

    it("should filter matching products by SKU query", () => {
      const query = "HW-TRM";
      const matches = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe("Hardware Terminal Device");
      expect(matches[0].stock).toBe(12);
    });

    it("should return empty if no catalog items match query", () => {
      const query = "Nonexistent Widget XYZ";
      const matches = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
      expect(matches).toHaveLength(0);
    });

    it("should accurately populate line item when product is chosen", () => {
      const selected = products[1]; // Enterprise Software License
      const lineItem = {
        description: selected.name,
        qty: 2,
        rate: selected.price,
        taxRate: selected.tax,
      };

      const lineTotal = lineItem.qty * lineItem.rate;
      const lineTax = lineTotal * (lineItem.taxRate / 100);
      const grandTotal = lineTotal + lineTax;

      expect(lineItem.description).toBe("Enterprise Software License");
      expect(lineTotal).toBe(2400.0);
      expect(lineTax).toBe(120.0);
      expect(grandTotal).toBe(2520.0);
    });

    it("should support rich Laptop & Desktop hardware attributes (Brand, Specs, Warranty, S/N)", () => {
      const laptop: Product = {
        id: "prod-lap-1",
        name: "ThinkPad T14 Gen 3",
        brand: "Lenovo",
        category: "Laptops",
        specs: "Intel Core i7-1260P, 16GB DDR4, 512GB NVMe SSD, 14\" WUXGA",
        condition: "Brand New",
        warranty: "1 Year Official Warranty",
        serialNumber: "SN-THINK-99182",
        sku: "LAP-THINK-01",
        price: 3450.0,
        tax: 5,
        stock: 8,
      };

      expect(laptop.brand).toBe("Lenovo");
      expect(laptop.category).toBe("Laptops");
      expect(laptop.specs).toContain("Core i7");
      expect(laptop.warranty).toBe("1 Year Official Warranty");
      expect(laptop.condition).toBe("Brand New");

      // Verify rich invoice line description generation
      const descParts: string[] = [];
      if (laptop.brand && !laptop.name.toLowerCase().includes(laptop.brand.toLowerCase())) {
        descParts.push(`${laptop.brand} ${laptop.name}`);
      } else {
        descParts.push(laptop.name);
      }
      if (laptop.specs) descParts.push(`- ${laptop.specs}`);
      if (laptop.condition && laptop.condition !== "Brand New") {
        descParts.push(`(${laptop.condition})`);
      }
      if (laptop.serialNumber) descParts.push(`[S/N: ${laptop.serialNumber}]`);
      if (laptop.warranty) descParts.push(`[${laptop.warranty}]`);

      const richLineDescription = descParts.join(" ");
      expect(richLineDescription).toContain("Lenovo ThinkPad T14 Gen 3");
      expect(richLineDescription).toContain("Intel Core i7");
      expect(richLineDescription).toContain("[S/N: SN-THINK-99182]");
      expect(richLineDescription).toContain("[1 Year Official Warranty]");
    });

    it("should ensure initial catalog has all dummy data removed", () => {
      expect(DEFAULT_COMPUTER_PRODUCTS).toEqual([]);
      expect(DEFAULT_COMPUTER_PRODUCTS.length).toBe(0);
    });

    it("should correctly identify legacy dummy/demo products and preserve user-created items", () => {
      // Legacy generic consultation dummy items from old template
      expect(isDummyProduct({ id: "prod-1", sku: "SRV-CON-01", name: "Standard Consultation & Advisory" })).toBe(true);
      expect(isDummyProduct({ id: "prod-2", sku: "SRV-AUD-02", name: "Enterprise Compliance Audit" })).toBe(true);
      expect(isDummyProduct({ id: "prod-3", sku: "SRV-RET-03", name: "Monthly Retainer Services" })).toBe(true);
      expect(isDummyProduct({ id: "prod-4", sku: "HW-TRM-04", name: "Security & Licensing Assessment" })).toBe(true);

      // Real user created product
      const userProduct: Product = {
        id: "prod-1729987654321",
        name: "HP Victus Gaming 15",
        brand: "HP",
        category: "Laptops",
        sku: "LAP-782",
        specs: "Ryzen 5 7535HS, 16GB RAM, RTX 3050",
        condition: "Brand New",
        warranty: WARRANTY_OPTIONS[0],
        price: 2650,
        tax: 5,
        stock: 4,
      };
      expect(isDummyProduct(userProduct)).toBe(false);
    });

    it("should support testing warranty options customized for PC hardware sales", () => {
      expect(WARRANTY_OPTIONS).toContain("1 Month Testing Warranty");
      expect(WARRANTY_OPTIONS).toContain("15 Days Testing Warranty");
      expect(WARRANTY_OPTIONS).toContain("7 Days Testing Warranty");
      expect(WARRANTY_OPTIONS).toContain("3 Days Testing Warranty");
      expect(WARRANTY_OPTIONS).toContain("No Warranty");
    });
  });
});
