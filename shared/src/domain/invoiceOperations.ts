import type { Company, Invoice } from "./demoData";

export const VALID_PAYMENT_STATUSES = [
  "Draft",
  "Sent",
  "Paid",
  "Overdue",
  "Cancelled",
] as const;

export type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

export function exportInvoicesToCsvString(invoices: Invoice[]): string {
  const headers = [
    "Invoice ID",
    "Customer",
    "Customer Phone",
    "Customer Email",
    "Issued Date",
    "Due Date",
    "Amount (AED)",
    "Status",
    "Template",
    "Notes",
  ];
  const rows = invoices.map((inv) => [
    inv.id,
    inv.customer,
    inv.customerPhone || "",
    inv.customerEmail || "",
    inv.issued,
    inv.due,
    inv.amount,
    inv.status,
    inv.template || "default_invoice",
    inv.notes || "",
  ]);
  return [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\r\n");
}

export function exportInvoicesToJsonString(invoices: Invoice[]): string {
  return JSON.stringify(invoices, null, 2);
}

export function parseCsvRaw(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        // ignore CR
      } else if (char === "\n") {
        row.push(cell.trim());
        if (row.length > 0 && row.some((c) => c !== "")) {
          lines.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== "")) {
      lines.push(row);
    }
  }
  return lines;
}

/**
 * Generates the next sequential invoice number in the series "INV-XXXX" (e.g. INV-0001, INV-0002).
 * Inspects all existing invoice IDs, extracts the highest number in the series, and increments by 1.
 */
export function getNextInvoiceNumber(
  existingInvoices?: Array<{ id?: string }>,
): string {
  if (!existingInvoices || existingInvoices.length === 0) {
    return "INV-0001";
  }

  let maxNum = 0;
  for (const inv of existingInvoices) {
    if (!inv || !inv.id) continue;
    // Match INV-XXXX series (e.g., INV-0001, INV-1, or INV-1002)
    const match = String(inv.id).trim().match(/^INV-(\d{1,5})$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `INV-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Generates the next sequential proforma invoice number in the series "PI-XXXX" (e.g. PI-0001, PI-0002).
 */
export function getNextProformaNumber(
  existingInvoices?: Array<{ id?: string; documentType?: string }>,
): string {
  if (!existingInvoices || existingInvoices.length === 0) {
    return "PI-0001";
  }

  let maxNum = 0;
  for (const inv of existingInvoices) {
    if (!inv || !inv.id) continue;
    const match = String(inv.id).trim().match(/^PI-(\d{1,5})$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `PI-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Generates the next sequential receipt voucher number in the series "REC-XXXX" (e.g. REC-0001, REC-0002).
 */
export function getNextReceiptNumber(
  existingInvoices?: Array<{ id?: string; documentType?: string }>,
): string {
  if (!existingInvoices || existingInvoices.length === 0) {
    return "REC-0001";
  }

  let maxNum = 0;
  for (const inv of existingInvoices) {
    if (!inv || !inv.id) continue;
    const match = String(inv.id).trim().match(/^REC-(\d{1,5})$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `REC-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Converts a Proforma Invoice into an official Tax Invoice.
 * Assigns next sequential INV-xxxx ID, links the original proforma ID, sets documentType="invoice".
 */
export function convertProformaToInvoice(
  proforma: Invoice,
  existingInvoices?: Invoice[],
): { newInvoice: Invoice; updatedProforma: Invoice } {
  const newInvoiceId = getNextInvoiceNumber(existingInvoices);
  const now = new Date();
  const dueDate = new Date(now.getTime() + 14 * 86400000);

  const newInvoice: Invoice = {
    ...proforma,
    id: newInvoiceId,
    documentType: "invoice",
    referenceInvoiceId: proforma.id,
    status: "Sent",
    isTaxInvoice: proforma.isTaxInvoice ?? true,
    issued: now.toLocaleDateString(),
    due: dueDate.toLocaleDateString(),
    notes: proforma.notes
      ? `${proforma.notes}\n[Converted from Proforma ${proforma.id}]`
      : `[Converted from Proforma ${proforma.id}]`,
  };

  const updatedProforma: Invoice = {
    ...proforma,
    status: "Converted",
    proformaConverted: true,
  };

  return { newInvoice, updatedProforma };
}

export function parseInvoicesCsv(csvText: string): Invoice[] {
  const rows = parseCsvRaw(csvText.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    throw new Error("CSV file is empty or missing data rows");
  }
  const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const idCol = header.findIndex((h) => h.includes("id"));
  const custCol = header.findIndex(
    (h) => h.includes("customer") && !h.includes("phone") && !h.includes("email"),
  );
  const phoneCol = header.findIndex((h) => h.includes("phone"));
  const emailCol = header.findIndex((h) => h.includes("email"));
  const issuedCol = header.findIndex((h) => h.includes("issue"));
  const dueCol = header.findIndex((h) => h.includes("due"));
  const amountCol = header.findIndex(
    (h) => h.includes("amount") || h.includes("total"),
  );
  const statusCol = header.findIndex((h) => h.includes("status"));
  const templateCol = header.findIndex((h) => h.includes("template"));
  const notesCol = header.findIndex((h) => h.includes("note"));

  return rows.slice(1).map((row, idx) => {
    const id =
      idCol >= 0 && row[idCol]
        ? row[idCol]
        : `INV-${String(idx + 1).padStart(4, "0")}`;
    const customer =
      custCol >= 0 && row[custCol] ? row[custCol] : row[1] || "Customer";
    const phone = phoneCol >= 0 && row[phoneCol] ? row[phoneCol] : undefined;
    const email = emailCol >= 0 && row[emailCol] ? row[emailCol] : undefined;
    const issued =
      issuedCol >= 0 && row[issuedCol]
        ? row[issuedCol]
        : new Date().toLocaleDateString();
    const due =
      dueCol >= 0 && row[dueCol]
        ? row[dueCol]
        : new Date(Date.now() + 14 * 86400000).toLocaleDateString();
    const rawAmount = amountCol >= 0 ? row[amountCol] : row[6];
    const cleanAmount =
      typeof rawAmount === "string"
        ? parseFloat(rawAmount.replace(/[^0-9.-]/g, ""))
        : Number(rawAmount);
    const amount = isNaN(cleanAmount) ? 0 : cleanAmount;
    const status = statusCol >= 0 && row[statusCol] ? row[statusCol] : "Sent";
    const template =
      templateCol >= 0 && row[templateCol] ? row[templateCol] : "default_invoice";
    const notes = notesCol >= 0 && row[notesCol] ? row[notesCol] : undefined;

    return {
      id,
      customer,
      customerPhone: phone,
      customerEmail: email,
      issued,
      due,
      amount,
      status,
      template,
      notes,
    };
  });
}

export function parseInvoicesJson(jsonText: string): Invoice[] {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON file must contain an array of invoice records");
  }
  return parsed.map((item: any, idx: number) => ({
    id: String(item.id || `INV-${String(idx + 1).padStart(4, "0")}`),
    customer: String(item.customer || "Unknown Customer"),
    customerPhone: item.customerPhone ? String(item.customerPhone) : undefined,
    customerEmail: item.customerEmail ? String(item.customerEmail) : undefined,
    issued: String(item.issued || new Date().toLocaleDateString()),
    due: String(
      item.due || new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
    ),
    amount: Number(item.amount) || 0,
    status: String(item.status || "Draft"),
    template: item.template || "default_invoice",
    notes: item.notes ? String(item.notes) : undefined,
    items: Array.isArray(item.items) ? item.items : undefined,
  }));
}

export function buildWhatsAppMessage(
  invoice: Invoice,
  company: Partial<Company>,
): string {
  const companyName = company.name?.toUpperCase() || "BILLIONDUE";
  const formattedAmount = Number(invoice.amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    `*INVOICE FROM ${companyName}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📄 *Invoice No:* ${invoice.id}\n` +
    `👤 *Customer:* ${invoice.customer}\n` +
    `📅 *Issued Date:* ${invoice.issued}\n` +
    `⏰ *Due Date:* ${invoice.due}\n` +
    `💳 *Payment Status:* ${invoice.status.toUpperCase()}\n` +
    `💰 *Total Amount:* AED ${formattedAmount}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    (invoice.notes ? `📝 *Note:* ${invoice.notes}\n\n` : "\n") +
    `Thank you for your business! Please confirm once payment is complete.\n\n` +
    `📞 *Contact:* ${company.phone || company.contactNo || ""}\n` +
    `✉️ *Email:* ${company.email || ""}`
  );
}

export function mergeInvoices(
  existing: Invoice[],
  imported: Invoice[],
): Invoice[] {
  const importedMap = new Map(imported.map((inv) => [inv.id, inv]));
  const retainedOld = existing.filter((old) => !importedMap.has(old.id));
  return [...imported, ...retainedOld];
}

export function updateInvoice(
  existingInvoices: Invoice[],
  updatedInvoice: Invoice,
  originalId?: string,
): Invoice[] {
  const matchId = originalId || updatedInvoice.id;
  const index = existingInvoices.findIndex((inv) => inv.id === matchId);
  if (index === -1) {
    return [updatedInvoice, ...existingInvoices];
  }
  const next = [...existingInvoices];
  next[index] = updatedInvoice;
  return next;
}

