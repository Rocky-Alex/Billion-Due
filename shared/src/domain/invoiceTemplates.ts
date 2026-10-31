import defaultInvoiceHtml from "../invoice_templates/default_invoice/template";
import editorialSerifHtml from "../invoice_templates/editorial_serif/template";
import executiveGoldHtml from "../invoice_templates/executive_charcoal_gold/template";
import nordicSageHtml from "../invoice_templates/nordic_minimal_sage/template";

export interface InvoiceTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  accent: string;
  badge: string;
  previewImage: string;
  rawHtml: string;
  isDefault?: boolean;
}

export const DEFAULT_TEMPLATE_ID = "default_invoice";

export const INVOICE_TEMPLATES: InvoiceTemplateItem[] = [
  {
    id: "default_invoice",
    name: "Default Invoice",
    category: "Corporate & Consulting",
    description:
      "Main standard invoice template available to all users. Modern corporate layout with forest teal header, crisp typography, and structured slate tables",
    accent: "#113537",
    badge: "Main Default",
    isDefault: true,
    previewImage: "/templates/default_invoice/screen.png",
    rawHtml: defaultInvoiceHtml,
  },
  {
    id: "editorial_serif",
    name: "Editorial Serif",
    category: "Boutique & Luxury",
    description:
      "Parchment luxury boutique design with Cormorant Garamond serif typography and deep burgundy accents",
    accent: "#4A1521",
    badge: "Editorial Burgundy",
    previewImage: "/templates/editorial_serif/screen.png",
    rawHtml: editorialSerifHtml,
  },
  {
    id: "executive_charcoal_gold",
    name: "Executive Charcoal & Gold",
    category: "Prestige & Legal",
    description:
      "Obsidian charcoal canvas with Cinzel headings, rich gold foil borders, and executive hierarchy",
    accent: "#064E3B ",
    badge: "Charcoal & Gold",
    previewImage: "/templates/executive_charcoal_gold/screen.png",
    rawHtml: executiveGoldHtml,
  },
  {
    id: "nordic_minimal_sage",
    name: "Nordic Minimal Sage",
    category: "Scandinavian Minimalist",
    description:
      "Clean Nordic design with Plus Jakarta Sans, soft sage background cards, and pine green typography",
    accent: "#183833",
    badge: "Nordic Sage",
    previewImage: "/templates/nordic_minimal_sage/screen.png",
    rawHtml: nordicSageHtml,
  },
];

/**
 * Checks whether a template is accessible to a given company or in guest mode.
 * - Guest mode is strictly restricted to the Main Default Template ("default_invoice" / "Default Invoice").
 * - A registered company always has access to the Main Default Template.
 * - Other templates are accessible only if explicitly listed in the company's assigned templates list.
 */
export function isTemplateAssignedToCompany(
  company: { id?: string; plan?: string; templates?: string[] } | null | undefined,
  templateIdOrName: string,
  isGuest?: boolean,
): boolean {
  const normTarget = String(templateIdOrName || "").trim().toLowerCase();
  const isDefaultTarget =
    normTarget === "default_invoice" ||
    normTarget === "default invoice";

  // Guest mode check (either explicitly flagged, or company id is guest_local, or plan has 'guest')
  const inGuestMode =
    Boolean(isGuest) ||
    !company ||
    company.id === "guest_local" ||
    String(company.plan || "").toLowerCase().includes("guest");

  if (inGuestMode) {
    // Guest mode strictly only gets the main default template
    return isDefaultTarget;
  }

  // All licensed companies always have access to the Main Default Template
  if (isDefaultTarget) {
    return true;
  }

  // Check company's assigned templates
  const assigned = Array.isArray(company.templates) ? company.templates : [];
  return assigned.some((t) => {
    const norm = String(t).trim().toLowerCase();
    return (
      norm === normTarget ||
      (normTarget === "editorial_serif" && norm === "editorial serif") ||
      (normTarget === "editorial serif" && norm === "editorial_serif") ||
      (normTarget === "executive_charcoal_gold" && norm === "executive charcoal & gold") ||
      (normTarget === "executive charcoal & gold" && norm === "executive_charcoal_gold") ||
      (normTarget === "nordic_minimal_sage" && norm === "nordic minimal sage") ||
      (normTarget === "nordic minimal sage" && norm === "nordic_minimal_sage")
    );
  });
}

/**
 * Returns the list of InvoiceTemplateItems accessible to the company.
 * In guest mode, returns ONLY the Main Default Template.
 */
export function getAccessibleTemplates(
  company: { id?: string; plan?: string; templates?: string[] } | null | undefined,
  isGuest?: boolean,
): InvoiceTemplateItem[] {
  return INVOICE_TEMPLATES.filter((tmpl) =>
    isTemplateAssignedToCompany(company, tmpl.id, isGuest)
  );
}

export interface InvoiceRenderData {
  companyName: string;
  companyEmail?: string;
  companyAddress?: string;
  companyLogo?: string;
  companyPhone?: string;
  invoiceId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  items?: Array<{
    description: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  advancePaid?: number;
  balanceDue?: number;
  isTaxInvoice?: boolean;
  notes?: string;
}

export function populateInvoiceTemplate(
  templateId: string,
  data: InvoiceRenderData,
): string {
  const found =
    INVOICE_TEMPLATES.find(
      (t) =>
        t.id === templateId ||
        t.name.toLowerCase() === templateId.toLowerCase(),
    ) || INVOICE_TEMPLATES[0];

  let html = found.rawHtml;

  // 1. Replace Title & Company Name
  html = html.replace(/Simon &amp; Webster Consulting/g, escapeHtml(data.companyName || "Invoice"));
  html = html.replace(/Simon & Webster Consulting/g, escapeHtml(data.companyName || "Invoice"));
  html = html.replace(/Company Name/g, escapeHtml(data.companyName || ""));

  // 2. Replace Company Logo if provided
  if (data.companyLogo) {
    const logoImg = `<img src="${data.companyLogo}" alt="${escapeHtml(data.companyName)}" style="height: 48px; max-width: 150px; object-fit: contain; border-radius: 6px;" />`;
    html = html.replace(
      /<div class="logo-ampersand[^>]*>[\s\S]*?&amp;[\s\S]*?<\/div>/gi,
      logoImg,
    );
    html = html.replace(
      /<div class="w-12 h-12[^>]*>[\s\S]*?&amp;[\s\S]*?<\/div>/gi,
      logoImg,
    );
  }

  // 3. Replace Company Contact Details
  if (data.companyEmail) {
    html = html.replace(/company@gmail\.com/g, escapeHtml(data.companyEmail));
  } else {
    html = html.replace(/company@gmail\.com/g, "");
  }
  if (data.companyPhone) {
    html = html.replace(/\(208\) 555-0155/g, escapeHtml(data.companyPhone));
  } else {
    html = html.replace(/\(208\) 555-0155/g, "");
  }
  if (data.companyAddress) {
    html = html.replace(/Your Location/g, escapeHtml(data.companyAddress));
    html = html.replace(/New York, NY 10011/g, "");
  } else {
    html = html.replace(/Your Location/g, "");
    html = html.replace(/New York, NY 10011/g, "");
  }

  // 4. Replace Customer Name & Contact
  html = html.replace(/Paul Limpet/g, escapeHtml(data.customerName || ""));
  if (data.customerEmail) {
    html = html.replace(/customer@gmail\.com/g, escapeHtml(data.customerEmail));
  } else {
    html = html.replace(/customer@gmail\.com/g, "");
  }
  html = html.replace(/\(509\) 555-0125/g, escapeHtml(data.customerPhone || ""));

  // 5. Replace Dates & Invoice ID & Heading (TAX INVOICE vs INVOICE)
  html = html.replace(/01\/01\/20XX/g, escapeHtml(data.issueDate || ""));
  html = html.replace(/01\/02\/20XX/g, escapeHtml(data.dueDate || ""));

  const invoiceTitleText = data.isTaxInvoice === false ? "INVOICE" : "TAX INVOICE";

  // Replace existing H1 INVOICE
  html = html.replace(
    /(<h1[^>]*>[\s\S]*?)INVOICE([\s\S]*?<\/h1>)/i,
    `$1${invoiceTitleText}$2<div style="font-size: 13px; font-weight: 700; letter-spacing: 1px; opacity: 0.9; margin-top: 3px;">#${escapeHtml(data.invoiceId)}</div>`,
  );

  // 6. Format currency helper (UAE Dirhams)
  const fmt = (n: number) => `AED ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 7. Inject Items Table
  const activeItems = (data.items || []).filter(
    (item) => item.description?.trim() || item.price > 0 || item.total > 0,
  );

  const rowsHtml =
    activeItems.length > 0
      ? activeItems
        .map(
          (item) => `
    <tr style="border-bottom: 1px solid rgba(0,0,0,0.08);">
      <td style="padding: 10px 12px; font-weight: 500;">${escapeHtml(item.description || "—")}</td>
      <td style="padding: 10px 8px; text-align: center;">${item.qty || 1}</td>
      <td style="padding: 10px 12px; text-align: right;">${fmt(item.price)}</td>
      <td style="padding: 10px 12px; text-align: right; font-weight: 600;">${fmt(item.total)}</td>
    </tr>
  `,
        )
        .join("")
      : `
    <tr>
      <td colspan="4" style="padding: 28px 12px; text-align: center; color: #94a3b8; font-style: italic; font-size: 12px;">
        No line items added yet
      </td>
    </tr>
  `;

  html = html.replace(
    /<tbody class="[^"]*">[\s\S]*?<\/tbody>/i,
    `<tbody>${rowsHtml}</tbody>`,
  );

  // 8. Inject Financial Totals (Subtotal, Discount, Tax / VAT 5%, Total, Advance Paid, Balance Due)
  const discountVal = Number(data.discount) || 0;
  const advanceVal = Number(data.advancePaid) || 0;
  const balanceDue = data.balanceDue !== undefined ? data.balanceDue : Math.max(0, data.total - advanceVal);

  const discountRow = discountVal > 0
    ? `<tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
         <td style="padding: 6px 10px; color: #dc2626; font-weight: 500;">Less Discount</td>
         <td style="padding: 6px 10px; text-align: right; color: #dc2626; font-weight: 600;">-${fmt(discountVal)}</td>
       </tr>`
    : "";

  const taxRow = data.isTaxInvoice !== false
    ? `<tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
         <td style="padding: 6px 10px; color: #475569; font-weight: 500;">VAT (5%)</td>
         <td style="padding: 6px 10px; text-align: right; color: #0f172a; font-weight: 600;">${fmt(data.tax)}</td>
       </tr>`
    : "";

  const advanceRow = advanceVal > 0
    ? `<tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
         <td style="padding: 6px 10px; color: #16a34a; font-weight: 500;">Advance Paid</td>
         <td style="padding: 6px 10px; text-align: right; color: #16a34a; font-weight: 600;">-${fmt(advanceVal)}</td>
       </tr>`
    : "";

  const totalsTableHtml = `<table class="w-full text-[12.5px] border-separate border-spacing-y-0.5" id="totals-table" style="width: 100%; border-collapse: collapse;">
  <tbody>
    <tr style="border-bottom: 1px solid rgba(0,0,0,0.06);">
      <td style="padding: 6px 10px; color: #475569; font-weight: 500;">Subtotal</td>
      <td style="padding: 6px 10px; text-align: right; color: #0f172a; font-weight: 600;">${fmt(data.subtotal)}</td>
    </tr>
    ${discountRow}
    ${taxRow}
    <tr style="border-bottom: 1px solid rgba(0,0,0,0.08);">
      <td style="padding: 6px 10px; color: #0f172a; font-weight: 700;">Total Amount</td>
      <td style="padding: 6px 10px; text-align: right; color: #0f172a; font-weight: 700;">${fmt(data.total)}</td>
    </tr>
    ${advanceRow}
    <tr style="background: ${found.accent}; color: #ffffff;">
      <td style="padding: 8px 10px; font-weight: 700; color: #ffffff; border-radius: 4px 0 0 4px;">Balance Due</td>
      <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #ffffff; border-radius: 0 4px 4px 0;">${fmt(balanceDue)}</td>
    </tr>
  </tbody>
</table>`;

  if (/<table[^>]*id="totals-table"[^>]*>[\s\S]*?<\/table>/i.test(html)) {
    html = html.replace(/<table[^>]*id="totals-table"[^>]*>[\s\S]*?<\/table>/i, totalsTableHtml);
  } else {
    html = html.replace(
      /(<td[^>]*>Subtotal<\/td>\s*<td[^>]*>).*?(<\/td>)/i,
      `$1${fmt(data.subtotal)}$2`,
    );
    html = html.replace(
      /(<td[^>]*>Less Deposit<\/td>\s*<td[^>]*>).*?(<\/td>)/i,
      `$1${fmt(discountVal)}$2`,
    );
    html = html.replace(
      /(<td[^>]*>Advance Paid<\/td>\s*<td[^>]*>).*?(<\/td>)/i,
      `$1${fmt(advanceVal)}$2`,
    );
    html = html.replace(
      /(<td[^>]*>Balance Due<\/td>\s*<td[^>]*>).*?(<\/td>)/i,
      `$1${fmt(balanceDue)}$2`,
    );
  }

  // 9. Inject Notes into Terms & Conditions section if provided
  if (data.notes && data.notes.trim()) {
    html = html.replace(
      /(<h3[^>]*>[\s\S]*?Terms and Conditions[\s\S]*?<\/h3>\s*<ul[^>]*>)[\s\S]*?(<\/ul>)/i,
      `$1<li style="padding: 4px 0; list-style: none; font-weight: 500;">${escapeHtml(data.notes.trim())}</li>$2`,
    );
  } else {
    html = html.replace(
      /(<h3[^>]*>[\s\S]*?Terms and Conditions[\s\S]*?<\/h3>\s*<ul[^>]*>)[\s\S]*?(<\/ul>)/i,
      `$1<li style="padding: 4px 0; list-style: none; color: #94a3b8; font-size: 11px; font-style: italic;">No additional notes.</li>$2`,
    );
  }

  return html;
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
