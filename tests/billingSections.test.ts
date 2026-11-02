import { describe, expect, it } from "vitest";
import type { Invoice, Company } from "../shared/src/domain/demoData";
import {
  getNextInvoiceNumber,
  getNextProformaNumber,
  getNextReceiptNumber,
  convertProformaToInvoice,
  exportInvoicesToCsvString,
  exportInvoicesToJsonString,
} from "../shared/src/domain/invoiceOperations";
import {
  populateInvoiceTemplate,
  type InvoiceRenderData,
} from "../shared/src/domain/invoiceTemplates";

describe("4 Core Billing & Accounting In-App Sections", () => {
  const sampleCompany: Company = {
    id: "COMP-TEST",
    name: "Al Buraq General Trading LLC",
    code: "ABT",
    email: "accounts@alburaq-trading.ae",
    phone: "+971 4 299 8888",
    address: "Deira Commercial District, Dubai, UAE",
    status: "active",
    plan: "Business",
    license: "COMM-8899",
    expires: "2027-12-31",
    seatsUsed: 1,
    seatsAllowed: 5,
    devicesAllowed: 5,
    templates: ["default_invoice", "editorial_serif"],
    devices: [],
  };

  const sampleInvoices: Invoice[] = [
    {
      id: "INV-0001",
      customer: "Emirates Steel Industries",
      amount: 15750,
      status: "Sent",
      documentType: "invoice",
      issued: "10/01/2026",
      due: "10/15/2026",
      subtotal: 15000,
      tax: 750,
      balanceDue: 15750,
      items: [{ description: "Galvanized Steel Pipes", qty: 50, rate: 300, amount: 15000 }],
    },
    {
      id: "INV-0002",
      customer: "Dubai Port World",
      amount: 8400,
      status: "Paid",
      documentType: "invoice",
      issued: "10/05/2026",
      due: "10/20/2026",
      subtotal: 8000,
      tax: 400,
      balanceDue: 0,
      advancePaid: 8400,
      items: [{ description: "Logistics Consumables", qty: 20, rate: 400, amount: 8000 }],
    },
    {
      id: "PI-0001",
      customer: "Sharjah Construction Group",
      amount: 25000,
      status: "Pending",
      documentType: "proforma",
      issued: "10/10/2026",
      due: "10/24/2026",
      subtotal: 23809.52,
      tax: 1190.48,
      items: [{ description: "Precast Concrete Slabs", qty: 100, rate: 250, amount: 25000 }],
    },
    {
      id: "REC-0001",
      customer: "Dubai Port World",
      amount: 8400,
      status: "Paid",
      documentType: "receipt",
      paymentMethod: "Bank Transfer",
      referenceInvoiceId: "INV-0002",
      issued: "10/06/2026",
      due: "10/06/2026",
      notes: "Direct wire transfer ref: DXB-WT-9921",
    },
  ];

  describe("1. Invoice Section (Official Commercial & Tax Invoices)", () => {
    it("filters and isolates official invoices from proformas and receipts", () => {
      const official = sampleInvoices.filter(
        (i) =>
          i.documentType === "invoice" ||
          (!i.documentType && !i.id.startsWith("PI-") && !i.id.startsWith("REC-")),
      );

      expect(official).toHaveLength(2);
      expect(official.map((i) => i.id)).toEqual(["INV-0001", "INV-0002"]);
      expect(official.some((i) => i.id.startsWith("PI-"))).toBe(false);
      expect(official.some((i) => i.id.startsWith("REC-"))).toBe(false);
    });

    it("generates next sequential INV-xxxx number without clash", () => {
      expect(getNextInvoiceNumber(sampleInvoices)).toBe("INV-0003");
    });

    it("renders official TAX INVOICE title in template", () => {
      const renderData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        invoiceId: "INV-0001",
        customerName: "Emirates Steel Industries",
        issueDate: "10/01/2026",
        dueDate: "10/15/2026",
        subtotal: 15000,
        tax: 750,
        total: 15750,
        isTaxInvoice: true,
        documentType: "invoice",
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("TAX INVOICE");
      expect(html).toContain("#INV-0001");
      expect(html).toContain("Emirates Steel Industries");
    });
  });

  describe("2. Performa Invoice Section (Estimates & Quotations)", () => {
    it("filters proforma invoices cleanly", () => {
      const proformas = sampleInvoices.filter(
        (i) => i.documentType === "proforma" || i.id.startsWith("PI-"),
      );

      expect(proformas).toHaveLength(1);
      expect(proformas[0].id).toBe("PI-0001");
      expect(proformas[0].customer).toBe("Sharjah Construction Group");
    });

    it("generates next sequential PI-xxxx number correctly", () => {
      expect(getNextProformaNumber(sampleInvoices)).toBe("PI-0002");
    });

    it("renders PROFORMA INVOICE header in rendered template preview", () => {
      const renderData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        invoiceId: "PI-0001",
        customerName: "Sharjah Construction Group",
        issueDate: "10/10/2026",
        dueDate: "10/24/2026",
        subtotal: 23809.52,
        tax: 1190.48,
        total: 25000,
        documentType: "proforma",
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("PROFORMA INVOICE");
      expect(html).toContain("#PI-0001");
    });

    it("1-click converts a Proforma Invoice to an official Tax Invoice", () => {
      const proforma = sampleInvoices[2]; // PI-0001
      const { newInvoice, updatedProforma } = convertProformaToInvoice(
        proforma,
        sampleInvoices,
      );

      // New invoice assertions
      expect(newInvoice.id).toBe("INV-0003");
      expect(newInvoice.documentType).toBe("invoice");
      expect(newInvoice.customer).toBe("Sharjah Construction Group");
      expect(newInvoice.amount).toBe(25000);
      expect(newInvoice.referenceInvoiceId).toBe("PI-0001");
      expect(newInvoice.status).toBe("Sent");
      expect(newInvoice.isTaxInvoice).toBe(true);

      // Proforma update assertions
      expect(updatedProforma.status).toBe("Converted");
      expect(updatedProforma.proformaConverted).toBe(true);
    });
  });

  describe("3. Receipts Section (Settlement Vouchers)", () => {
    it("filters receipts cleanly from other documents", () => {
      const receipts = sampleInvoices.filter(
        (i) => i.documentType === "receipt" || i.id.startsWith("REC-"),
      );

      expect(receipts).toHaveLength(1);
      expect(receipts[0].id).toBe("REC-0001");
      expect(receipts[0].paymentMethod).toBe("Bank Transfer");
      expect(receipts[0].referenceInvoiceId).toBe("INV-0002");
    });

    it("generates sequential REC-xxxx voucher numbers correctly", () => {
      expect(getNextReceiptNumber(sampleInvoices)).toBe("REC-0002");
    });

    it("renders PAYMENT RECEIPT header in voucher template", () => {
      const renderData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        invoiceId: "REC-0001",
        customerName: "Dubai Port World",
        issueDate: "10/06/2026",
        dueDate: "10/06/2026",
        subtotal: 8400,
        tax: 0,
        total: 8400,
        documentType: "receipt",
        paymentMethod: "Bank Transfer",
        referenceInvoiceId: "INV-0002",
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("PAYMENT RECEIPT");
      expect(html).toContain("#REC-0001");
    });
  });

  describe("4. Payments Section (Ledger & Reconciliation)", () => {
    it("computes invoiced vs collected and receivables outstanding accurately", () => {
      const official = sampleInvoices.filter(
        (i) =>
          i.documentType === "invoice" ||
          (!i.documentType && !i.id.startsWith("PI-") && !i.id.startsWith("REC-")),
      );

      const totalInvoiced = official.reduce((s, i) => s + i.amount, 0); // 15750 + 8400 = 24150
      const collected = official
        .filter((i) => i.status === "Paid")
        .reduce((s, i) => s + i.amount, 0); // 8400
      const pendingDue = totalInvoiced - collected; // 15750
      const rate = (collected / totalInvoiced) * 100;

      expect(totalInvoiced).toBe(24150);
      expect(collected).toBe(8400);
      expect(pendingDue).toBe(15750);
      expect(rate.toFixed(1)).toBe("34.8");
    });

    it("reconciles payment against an invoice and marks balance cleared", () => {
      const targetInvoice = sampleInvoices[0]; // INV-0001: 15750 due
      const paymentAmount = 15750;

      const updatedAdvance = (targetInvoice.advancePaid || 0) + paymentAmount;
      const balanceDue = Math.max(0, targetInvoice.amount - updatedAdvance);
      const isSettled = balanceDue <= 0;

      const settledInvoice: Invoice = {
        ...targetInvoice,
        status: isSettled ? "Paid" : "Sent",
        advancePaid: updatedAdvance,
        balanceDue,
        paymentMethod: "Credit Card",
      };

      expect(settledInvoice.status).toBe("Paid");
      expect(settledInvoice.balanceDue).toBe(0);
      expect(settledInvoice.advancePaid).toBe(15750);
      expect(settledInvoice.paymentMethod).toBe("Credit Card");

      // Generated linked receipt
      const receipt: Invoice = {
        id: getNextReceiptNumber(sampleInvoices),
        customer: settledInvoice.customer,
        amount: paymentAmount,
        issued: "10/12/2026",
        due: "10/12/2026",
        status: "Paid",
        documentType: "receipt",
        paymentMethod: "Credit Card",
        referenceInvoiceId: settledInvoice.id,
      };

      expect(receipt.id).toBe("REC-0002");
      expect(receipt.referenceInvoiceId).toBe("INV-0001");
      expect(receipt.amount).toBe(15750);
    });

    it("exports ledger records to CSV properly", () => {
      const receipts = sampleInvoices.filter(
        (i) => i.documentType === "receipt" || i.id.startsWith("REC-"),
      );
      const csv = exportInvoicesToCsvString(receipts);

      expect(csv).toContain("REC-0001");
      expect(csv).toContain("Dubai Port World");
      expect(csv).toContain("8400");
    });
  });
});

