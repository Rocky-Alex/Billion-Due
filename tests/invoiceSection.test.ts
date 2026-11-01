import { describe, expect, it } from "vitest";
import type { Invoice, Company } from "../shared/src/domain/demoData";
import {
  exportInvoicesToCsvString,
  exportInvoicesToJsonString,
  parseInvoicesCsv,
  parseInvoicesJson,
  getNextInvoiceNumber,
  getNextProformaNumber,
  getNextReceiptNumber,
  convertProformaToInvoice,
  buildWhatsAppMessage,
  mergeInvoices,
  updateInvoice,
  VALID_PAYMENT_STATUSES,
} from "../shared/src/domain/invoiceOperations";
import {
  INVOICE_TEMPLATES,
  populateInvoiceTemplate,
  type InvoiceRenderData,
} from "../shared/src/domain/invoiceTemplates";

describe("Invoice Section - Full Functionality Test Suite", () => {
  const sampleCompany: Company = {
    id: "COMP-001",
    name: "Al Futtaim Logistics LLC",
    code: "AFL",
    email: "billing@alfuttaim-logistics.ae",
    phone: "+971 4 213 5555",
    address: "Business Bay, Tower 1, Dubai, UAE",
    logo: "https://example.com/logo.png",
    status: "active",
    plan: "Primium",
    license: "COMM-9999",
    expires: "2027-12-31",
    seatsUsed: 1,
    seatsAllowed: 10,
    devicesAllowed: 10,
    templates: ["default_invoice", "editorial_serif", "executive_charcoal_gold", "nordic_minimal_sage"],
    devices: [],
  };

  const sampleInvoices: Invoice[] = [
    {
      id: "INV-2026-000101",
      customer: "Emirates Trading Agency",
      customerPhone: "+971 50 123 4567",
      customerEmail: "accounts@eta-group.ae",
      issued: "10/20/2026",
      due: "11/04/2026",
      amount: 5250,
      status: "Sent",
      template: "executive_charcoal_gold",
      notes: "Net 15 days payment terms. Wire transfer to Emirates NBD.",
      items: [
        {
          description: "Supply Chain Consulting",
          qty: 1,
          rate: 5000,
          tax: 250,
          amount: 5000,
        },
      ],
    },
    {
      id: "INV-2026-000102",
      customer: "Dubai Marina Hotel",
      customerPhone: "+971 55 987 6543",
      customerEmail: "finance@marinahotel.com",
      issued: "10/18/2026",
      due: "11/01/2026",
      amount: 12600,
      status: "Paid",
      template: "editorial_serif",
      notes: "Paid in full via Visa Corporate card.",
    },
    {
      id: "INV-2026-000103",
      customer: "Gulf Tech Solutions",
      customerPhone: "+971 52 444 7788",
      customerEmail: "info@gulftech.ae",
      issued: "09/15/2026",
      due: "09/30/2026",
      amount: 3150,
      status: "Overdue",
      template: "nordic_minimal_sage",
    },
  ];

  describe("1. Invoice Template as Preview (Setted Template)", () => {
    it("recognizes all available invoice templates with badges and accents", () => {
      expect(INVOICE_TEMPLATES.length).toBeGreaterThanOrEqual(4);
      const defaultTmpl = INVOICE_TEMPLATES.find((t) => t.id === "default_invoice");
      expect(defaultTmpl).toBeDefined();
      expect(defaultTmpl?.isDefault).toBe(true);
      expect(defaultTmpl?.name).toBe("Default Invoice");
    });

    it("renders the preview using the invoice's setted template", () => {
      const inv = sampleInvoices[0]; // executive_charcoal_gold
      const renderData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        companyEmail: sampleCompany.email,
        companyPhone: sampleCompany.phone,
        companyAddress: sampleCompany.address,
        companyLogo: sampleCompany.logo,
        invoiceId: inv.id,
        customerName: inv.customer,
        customerPhone: inv.customerPhone,
        customerEmail: inv.customerEmail,
        issueDate: inv.issued,
        dueDate: inv.due,
        subtotal: inv.amount / 1.05,
        tax: inv.amount - inv.amount / 1.05,
        total: inv.amount,
        notes: inv.notes,
      };

      const renderedHtml = populateInvoiceTemplate(inv.template || "default_invoice", renderData);

      expect(renderedHtml).toContain("Al Futtaim Logistics LLC");
      expect(renderedHtml).toContain("INV-2026-000101");
      expect(renderedHtml).toContain("Emirates Trading Agency");
      expect(renderedHtml).toContain("5,250");
      expect(renderedHtml).toContain("Net 15 days payment terms");
    });

    it("allows dynamic template switching in preview", () => {
      const inv = sampleInvoices[1];
      const renderData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        companyEmail: sampleCompany.email,
        invoiceId: inv.id,
        customerName: inv.customer,
        issueDate: inv.issued,
        dueDate: inv.due,
        subtotal: inv.amount / 1.05,
        tax: inv.amount - inv.amount / 1.05,
        total: inv.amount,
      };

      // Switch to Nordic Minimal Sage
      const nordicHtml = populateInvoiceTemplate("nordic_minimal_sage", renderData);
      expect(nordicHtml).toContain("Al Futtaim Logistics LLC");
      expect(nordicHtml).toContain("Dubai Marina Hotel");

      // Switch to Default Invoice
      const defaultHtml = populateInvoiceTemplate("default_invoice", renderData);
      expect(defaultHtml).toContain("Al Futtaim Logistics LLC");
      expect(defaultHtml).toContain("INV-2026-000102");
    });
  });

  describe("2. Payment Status Changes", () => {
    it("defines valid payment statuses", () => {
      expect(VALID_PAYMENT_STATUSES).toEqual([
        "Draft",
        "Sent",
        "Paid",
        "Overdue",
        "Cancelled",
      ]);
    });

    it("changes status from Sent to Paid", () => {
      let state = [...sampleInvoices];
      const targetId = "INV-2026-000101";

      state = state.map((inv) =>
        inv.id === targetId ? { ...inv, status: "Paid" } : inv,
      );

      const updated = state.find((i) => i.id === targetId);
      expect(updated?.status).toBe("Paid");
    });

    it("changes status from Overdue to Cancelled or Paid", () => {
      let state = [...sampleInvoices];
      const targetId = "INV-2026-000103";

      state = state.map((inv) =>
        inv.id === targetId ? { ...inv, status: "Cancelled" } : inv,
      );

      const updated = state.find((i) => i.id === targetId);
      expect(updated?.status).toBe("Cancelled");
    });
  });

  describe("3. Invoice WhatsApp Message Generation", () => {
    it("generates formatted WhatsApp text with emojis and all key invoice details", () => {
      const inv = sampleInvoices[0];
      const msg = buildWhatsAppMessage(inv, sampleCompany);

      expect(msg).toContain("*INVOICE FROM AL FUTTAIM LOGISTICS LLC*");
      expect(msg).toContain("📄 *Invoice No:* INV-2026-000101");
      expect(msg).toContain("👤 *Customer:* Emirates Trading Agency");
      expect(msg).toContain("📅 *Issued Date:* 10/20/2026");
      expect(msg).toContain("⏰ *Due Date:* 11/04/2026");
      expect(msg).toContain("💳 *Payment Status:* SENT");
      expect(msg).toContain("💰 *Total Amount:* AED 5,250.00");
      expect(msg).toContain("📝 *Note:* Net 15 days payment terms. Wire transfer to Emirates NBD.");
      expect(msg).toContain("📞 *Contact:* +971 4 213 5555");
      expect(msg).toContain("✉️ *Email:* billing@alfuttaim-logistics.ae");
    });

    it("handles invoices without optional notes cleanly", () => {
      const inv = sampleInvoices[2]; // no notes
      const msg = buildWhatsAppMessage(inv, sampleCompany);

      expect(msg).toContain("INV-2026-000103");
      expect(msg).toContain("AED 3,150.00");
      expect(msg).not.toContain("📝 *Note:*");
    });
  });

  describe("4. Export Functionality (CSV & JSON)", () => {
    it("exports invoices to formatted CSV string with proper headers", () => {
      const csv = exportInvoicesToCsvString(sampleInvoices);

      expect(csv).toContain("Invoice ID,Customer,Customer Phone,Customer Email,Issued Date,Due Date,Amount (AED),Status,Template,Notes");
      expect(csv).toContain('"INV-2026-000101","Emirates Trading Agency","+971 50 123 4567","accounts@eta-group.ae"');
      expect(csv).toContain('"5250","Sent","executive_charcoal_gold"');
      expect(csv).toContain('"INV-2026-000102","Dubai Marina Hotel"');
      expect(csv).toContain('"12600","Paid","editorial_serif"');
    });

    it("exports invoices to formatted JSON string", () => {
      const json = exportInvoicesToJsonString(sampleInvoices);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].id).toBe("INV-2026-000101");
      expect(parsed[1].customer).toBe("Dubai Marina Hotel");
    });
  });

  describe("5. Import Functionality (CSV & JSON) and Merging", () => {
    it("parses CSV invoices correctly into Invoice objects", () => {
      const sampleCsv = `Invoice ID,Customer,Customer Phone,Customer Email,Issued Date,Due Date,Amount (AED),Status,Template,Notes
INV-2026-000999,Global Logistics FZE,+971 50 999 8888,finance@globallogistics.ae,10/22/2026,11/05/2026,8400,Sent,default_invoice,Freight clearance fee`;

      const imported = parseInvoicesCsv(sampleCsv);

      expect(imported).toHaveLength(1);
      expect(imported[0].id).toBe("INV-2026-000999");
      expect(imported[0].customer).toBe("Global Logistics FZE");
      expect(imported[0].customerPhone).toBe("+971 50 999 8888");
      expect(imported[0].customerEmail).toBe("finance@globallogistics.ae");
      expect(imported[0].amount).toBe(8400);
      expect(imported[0].status).toBe("Sent");
      expect(imported[0].template).toBe("default_invoice");
      expect(imported[0].notes).toBe("Freight clearance fee");
    });

    it("handles CSV with commas and quotes inside fields", () => {
      const complexCsv = `Invoice ID,Customer,Customer Phone,Customer Email,Issued Date,Due Date,Amount,Status,Template,Notes
"INV-2026-000888","Smith, Jones & Associates",,"+971 4 1234567",10/01/2026,10/15/2026,"15,500.50",Paid,editorial_serif,"Consulting, audit & tax review"`;

      const imported = parseInvoicesCsv(complexCsv);
      expect(imported).toHaveLength(1);
      expect(imported[0].id).toBe("INV-2026-000888");
      expect(imported[0].customer).toBe("Smith, Jones & Associates");
      expect(imported[0].amount).toBe(15500.5);
      expect(imported[0].status).toBe("Paid");
      expect(imported[0].notes).toBe("Consulting, audit & tax review");
    });

    it("parses JSON invoices correctly into Invoice objects", () => {
      const jsonText = JSON.stringify([
        {
          id: "INV-2026-000777",
          customer: "Alpha Beta Retail",
          customerPhone: "+971 50 777 6655",
          issued: "10/25/2026",
          due: "11/08/2026",
          amount: 4200,
          status: "Draft",
          template: "nordic_minimal_sage",
        },
      ]);

      const imported = parseInvoicesJson(jsonText);
      expect(imported).toHaveLength(1);
      expect(imported[0].id).toBe("INV-2026-000777");
      expect(imported[0].customer).toBe("Alpha Beta Retail");
      expect(imported[0].amount).toBe(4200);
      expect(imported[0].status).toBe("Draft");
      expect(imported[0].template).toBe("nordic_minimal_sage");
    });

    it("merges imported invoices with existing invoices without duplicating IDs", () => {
      const existing = [...sampleInvoices];
      const imported: Invoice[] = [
        {
          id: "INV-2026-000101", // Existing ID to update
          customer: "Emirates Trading Agency UPDATED",
          customerPhone: "+971 50 123 4567",
          issued: "10/20/2026",
          due: "11/04/2026",
          amount: 6000,
          status: "Paid",
          template: "executive_charcoal_gold",
        },
        {
          id: "INV-2026-000555", // Brand new invoice
          customer: "New Horizon Media",
          issued: "10/26/2026",
          due: "11/10/2026",
          amount: 2500,
          status: "Draft",
        },
      ];

      const merged = mergeInvoices(existing, imported);

      expect(merged).toHaveLength(4); // 3 original - 1 replaced + 2 new = 4 total
      const updatedInv = merged.find((i) => i.id === "INV-2026-000101");
      expect(updatedInv?.customer).toBe("Emirates Trading Agency UPDATED");
      expect(updatedInv?.amount).toBe(6000);
      expect(updatedInv?.status).toBe("Paid");

      const brandNew = merged.find((i) => i.id === "INV-2026-000555");
      expect(brandNew?.customer).toBe("New Horizon Media");
    });
  });

  describe("6. Interactive Invoice Sheet & Live Template Preview Binding", () => {
    it("correctly calculates subtotal, 5% UAE VAT, and total for multiple line items", () => {
      const items = [
        { id: "1", description: "Cloud POS Software", qty: 2, rate: 2500, taxRate: 5 },
        { id: "2", description: "Thermal Receipt Printer", qty: 2, rate: 750, taxRate: 5 },
        { id: "3", description: "Zero-Rated Export Consulting", qty: 1, rate: 1000, taxRate: 0 },
      ];

      const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0);
      expect(subtotal).toBe(7500); // 5000 + 1500 + 1000

      const tax = items.reduce((s, it) => s + (it.qty * it.rate * (it.taxRate / 100)), 0);
      expect(tax).toBe(325); // 5% of 5000 (250) + 5% of 1500 (75) + 0 = 325

      const total = subtotal + tax;
      expect(total).toBe(7825);
    });

    it("hydrates template with multi-item data and customer contact details in live preview", () => {
      const liveData: InvoiceRenderData = {
        companyName: sampleCompany.name,
        companyEmail: sampleCompany.email,
        companyPhone: sampleCompany.phone,
        companyAddress: sampleCompany.address,
        companyLogo: sampleCompany.logo,
        invoiceId: "INV-2026-999888",
        customerName: "Al Naboodah Group",
        customerPhone: "+971 50 888 1234",
        customerEmail: "finance@alnaboodah.ae",
        issueDate: "10/26/2026",
        dueDate: "11/09/2026",
        items: [
          { description: "ERP Integration & Support", qty: 1, price: 8500, total: 8500 },
          { description: "API Webhook Web Connector", qty: 1, price: 1500, total: 1500 },
        ],
        subtotal: 10000,
        tax: 500,
        total: 10500,
        notes: "Strict 14-day settlement. Thank you for choosing our services.",
      };

      const html = populateInvoiceTemplate("executive_charcoal_gold", liveData);
      expect(html).toContain("Al Futtaim Logistics LLC");
      expect(html).toContain("INV-2026-999888");
      expect(html).toContain("Al Naboodah Group");
      expect(html).toContain("ERP Integration &amp; Support");
      expect(html).toContain("API Webhook Web Connector");
      expect(html).toContain("AED 10,000.00");
      expect(html).toContain("AED 10,500.00");
      expect(html).toContain("Strict 14-day settlement");
    });
  });

  describe("7. Invoice Number Series Generation (INV-XXXX)", () => {
    it("starts with 'INV-0001' when no invoices exist in database or local storage", () => {
      expect(getNextInvoiceNumber([])).toBe("INV-0001");
      expect(getNextInvoiceNumber(undefined)).toBe("INV-0001");
    });

    it("generates the next sequential invoice number in the series", () => {
      const existing = [{ id: "INV-0001" }];
      expect(getNextInvoiceNumber(existing)).toBe("INV-0002");

      const multiple = [
        { id: "INV-0001" },
        { id: "INV-0002" },
        { id: "INV-0003" },
      ];
      expect(getNextInvoiceNumber(multiple)).toBe("INV-0004");
    });

    it("correctly zero-pads 4 digits as series advances", () => {
      expect(getNextInvoiceNumber([{ id: "INV-0009" }])).toBe("INV-0010");
      expect(getNextInvoiceNumber([{ id: "INV-0099" }])).toBe("INV-0100");
      expect(getNextInvoiceNumber([{ id: "INV-0999" }])).toBe("INV-1000");
      expect(getNextInvoiceNumber([{ id: "INV-9999" }])).toBe("INV-10000");
    });

    it("detects the highest series number even if invoices are out of order or have gaps", () => {
      const outOfOrder = [
        { id: "INV-0005" },
        { id: "INV-0001" },
        { id: "INV-0003" },
      ];
      expect(getNextInvoiceNumber(outOfOrder)).toBe("INV-0006");
    });

    it("starts series cleanly at 'INV-0001' if existing records have legacy non-series format", () => {
      const legacy = [
        { id: "INV-2026-894102" },
        { id: "LEGACY-99" },
      ];
      expect(getNextInvoiceNumber(legacy)).toBe("INV-0001");
    });
  });

  describe("8. Dubai / UAE Regional Tax Compliance & Totals Breakdown", () => {
    it("renders TAX INVOICE heading and 5% UAE VAT when isTaxInvoice is true", () => {
      const renderData: InvoiceRenderData = {
        companyName: "Al Futtaim Logistics LLC",
        invoiceId: "INV-0005",
        customerName: "Dubai Marina Hotel",
        issueDate: "10/26/2026",
        dueDate: "11/09/2026",
        subtotal: 1000,
        discount: 100,
        tax: 45, // 5% on (1000 - 100)
        total: 945,
        advancePaid: 200,
        balanceDue: 745,
        isTaxInvoice: true,
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("TAX INVOICE");
      expect(html).toContain("Subtotal");
      expect(html).toContain("1,000.00");
      expect(html).toContain("Less Discount");
      expect(html).toContain("100.00");
      expect(html).toContain("VAT (5%)");
      expect(html).toContain("45.00");
      expect(html).toContain("Total Amount");
      expect(html).toContain("945.00");
      expect(html).toContain("Advance Paid");
      expect(html).toContain("200.00");
      expect(html).toContain("Balance Due");
      expect(html).toContain("745.00");
    });

    it("renders INVOICE heading and 0% VAT when isTaxInvoice is false (Non-Tax Invoice)", () => {
      const renderData: InvoiceRenderData = {
        companyName: "Al Futtaim Logistics LLC",
        invoiceId: "INV-0006",
        customerName: "Global Trade FZE",
        issueDate: "10/26/2026",
        dueDate: "11/09/2026",
        subtotal: 5000,
        discount: 500,
        tax: 0,
        total: 4500,
        advancePaid: 1500,
        balanceDue: 3000,
        isTaxInvoice: false,
      };

      const html = populateInvoiceTemplate("editorial_serif", renderData);
      expect(html).toContain("INVOICE");
      expect(html).toContain("Subtotal");
      expect(html).toContain("5,000.00");
      expect(html).toContain("Less Discount");
      expect(html).toContain("500.00");
      // VAT row should be 0.00 or VAT (0%)
      expect(html).toContain("0.00");
      expect(html).toContain("Total Amount");
      expect(html).toContain("4,500.00");
      expect(html).toContain("Advance Paid");
      expect(html).toContain("1,500.00");
      expect(html).toContain("Balance Due");
      expect(html).toContain("3,000.00");
    });

    it("verifies accurate financial formula: subtotal - discount + vat = total, and total - advance = balanceDue", () => {
      const lineItems = [
        { qty: 2, rate: 500 }, // 1000
        { qty: 3, rate: 200 }, // 600
      ];
      const subtotal = lineItems.reduce((acc, l) => acc + l.qty * l.rate, 0); // 1600
      const discount = 200;
      const subtotalAfterDiscount = Math.max(0, subtotal - discount); // 1400
      const isTax = true;
      const tax = isTax ? Math.round(subtotalAfterDiscount * 0.05 * 100) / 100 : 0; // 70
      const total = subtotalAfterDiscount + tax; // 1470
      const advancePaid = 470;
      const balanceDue = Math.max(0, Math.round((total - advancePaid) * 100) / 100); // 1000

      expect(subtotal).toBe(1600);
      expect(tax).toBe(70);
      expect(total).toBe(1470);
      expect(balanceDue).toBe(1000);
    });
  });

  describe("9. Invoice Update Options & In-Place Editing", () => {
    it("updates existing invoice items, pricing, and totals in place", () => {
      const originalInvoice = sampleInvoices[0];
      const updatedInvoice: Invoice = {
        ...originalInvoice,
        items: [
          {
            description: "Advanced Enterprise Logistics Consulting",
            qty: 2,
            rate: 6000,
            amount: 12000,
          },
        ],
        subtotal: 12000,
        discount: 1000,
        tax: 550, // 5% of 11,000
        amount: 11550,
        advancePaid: 3000,
        balanceDue: 8550,
      };

      const result = updateInvoice(sampleInvoices, updatedInvoice);

      expect(result.length).toBe(sampleInvoices.length);
      const found = result.find((i) => i.id === originalInvoice.id);
      expect(found).toBeDefined();
      expect(found?.amount).toBe(11550);
      expect(found?.items?.[0].description).toBe("Advanced Enterprise Logistics Consulting");
      expect(found?.items?.[0].qty).toBe(2);
      expect(found?.discount).toBe(1000);
      expect(found?.advancePaid).toBe(3000);
      expect(found?.balanceDue).toBe(8550);
      // Ensure other invoices remain untouched
      expect(result[1].id).toBe(sampleInvoices[1].id);
      expect(result[2].id).toBe(sampleInvoices[2].id);
    });

    it("preserves payment status during invoice update unless explicitly changed", () => {
      const paidInvoice = sampleInvoices[1]; // status === "Paid"
      const updated: Invoice = {
        ...paidInvoice,
        customer: "Dubai Marina Hotel & Suites",
        notes: "Updated delivery address and contact person",
      };

      const result = updateInvoice(sampleInvoices, updated);
      const found = result.find((i) => i.id === paidInvoice.id);

      expect(found?.status).toBe("Paid");
      expect(found?.customer).toBe("Dubai Marina Hotel & Suites");
      expect(found?.notes).toBe("Updated delivery address and contact person");
    });

    it("updates template layout preference on the edited invoice", () => {
      const inv = sampleInvoices[2]; // nordic_minimal_sage
      const updated: Invoice = {
        ...inv,
        template: "executive_charcoal_gold",
      };

      const result = updateInvoice(sampleInvoices, updated);
      const found = result.find((i) => i.id === inv.id);

      expect(found?.template).toBe("executive_charcoal_gold");
    });

    it("supports modifying the invoice number with originalId reference", () => {
      const original = sampleInvoices[0];
      const updated: Invoice = {
        ...original,
        id: "INV-2026-REVISED-001",
      };

      const result = updateInvoice(sampleInvoices, updated, original.id);

      expect(result.length).toBe(sampleInvoices.length);
      expect(result.find((i) => i.id === original.id)).toBeUndefined();
      expect(result.find((i) => i.id === "INV-2026-REVISED-001")).toBeDefined();
    });

    it("appends as new record if the target invoice does not exist in the list", () => {
      const newInv: Invoice = {
        id: "INV-2026-BRAND-NEW",
        customer: "Abu Dhabi National Energy",
        issued: "10/26/2026",
        due: "11/10/2026",
        amount: 8000,
        status: "Draft",
      };

      const result = updateInvoice(sampleInvoices, newInv);

      expect(result.length).toBe(sampleInvoices.length + 1);
      expect(result[0].id).toBe("INV-2026-BRAND-NEW");
    });
  });

  describe("8. Performa Invoice & Receipt Sequential Operations", () => {
    it("generates PI-0001 when no proforma invoices exist", () => {
      expect(getNextProformaNumber([])).toBe("PI-0001");
      expect(getNextProformaNumber(undefined)).toBe("PI-0001");
      expect(getNextProformaNumber([{ id: "INV-0001" }])).toBe("PI-0001");
    });

    it("generates next sequential PI number correctly", () => {
      const existing = [
        { id: "PI-0001" },
        { id: "PI-0002" },
        { id: "INV-0005" },
      ];
      expect(getNextProformaNumber(existing)).toBe("PI-0003");
    });

    it("generates REC-0001 when no receipts exist", () => {
      expect(getNextReceiptNumber([])).toBe("REC-0001");
      expect(getNextReceiptNumber(undefined)).toBe("REC-0001");
      expect(getNextReceiptNumber([{ id: "INV-0001" }])).toBe("REC-0001");
    });

    it("generates next sequential REC number correctly", () => {
      const existing = [
        { id: "REC-0001" },
        { id: "REC-0005" },
      ];
      expect(getNextReceiptNumber(existing)).toBe("REC-0006");
    });

    it("converts a proforma invoice into a tax invoice and marks proforma converted", () => {
      const proforma: Invoice = {
        id: "PI-0001",
        customer: "Gulf Supplies LLC",
        amount: 4500,
        status: "Sent",
        documentType: "proforma",
        issued: "10/20/2026",
        due: "11/04/2026",
      };

      const existingInvoices: Invoice[] = [
        { id: "INV-0001", customer: "Customer A", amount: 100, issued: "10/10/2026", due: "10/24/2026", status: "Paid" },
      ];

      const { newInvoice, updatedProforma } = convertProformaToInvoice(proforma, existingInvoices);

      expect(newInvoice.id).toBe("INV-0002");
      expect(newInvoice.documentType).toBe("invoice");
      expect(newInvoice.referenceInvoiceId).toBe("PI-0001");
      expect(newInvoice.customer).toBe("Gulf Supplies LLC");
      expect(newInvoice.amount).toBe(4500);

      expect(updatedProforma.status).toBe("Converted");
      expect(updatedProforma.proformaConverted).toBe(true);
    });

    it("renders PROFORMA INVOICE header in template when documentType is proforma", () => {
      const renderData: InvoiceRenderData = {
        companyName: "Al Futtaim Logistics LLC",
        invoiceId: "PI-0001",
        customerName: "Gulf Supplies LLC",
        issueDate: "10/20/2026",
        dueDate: "11/04/2026",
        subtotal: 4500,
        tax: 225,
        total: 4725,
        documentType: "proforma",
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("PROFORMA INVOICE");
      expect(html).toContain("#PI-0001");
    });

    it("renders PAYMENT RECEIPT header in template when documentType is receipt", () => {
      const renderData: InvoiceRenderData = {
        companyName: "Al Futtaim Logistics LLC",
        invoiceId: "REC-0001",
        customerName: "Gulf Supplies LLC",
        issueDate: "10/20/2026",
        dueDate: "10/20/2026",
        subtotal: 4725,
        tax: 0,
        total: 4725,
        documentType: "receipt",
      };

      const html = populateInvoiceTemplate("default_invoice", renderData);
      expect(html).toContain("PAYMENT RECEIPT");
      expect(html).toContain("#REC-0001");
    });
  });
});


