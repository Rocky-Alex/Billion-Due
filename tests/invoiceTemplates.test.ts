import { describe, expect, it } from 'vitest';
import {
  INVOICE_TEMPLATES,
  populateInvoiceTemplate,
  isTemplateAssignedToCompany,
  getAccessibleTemplates,
  type InvoiceRenderData,
} from "../shared/src/domain/invoiceTemplates";

describe('Invoice Templates Integration', () => {
  it('loads all 4 templates from invoice_templates directory', () => {
    expect(INVOICE_TEMPLATES.length).toBe(4);
    const ids = INVOICE_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('default_invoice');
    expect(ids).toContain('editorial_serif');
    expect(ids).toContain('executive_charcoal_gold');
    expect(ids).toContain('nordic_minimal_sage');
  });

  it('populates template HTML with company and invoice metadata', () => {
    const data: InvoiceRenderData = {
      companyName: 'Bizz Corp Trading',
      companyEmail: 'invoicing@bizzcorp.ae',
      companyAddress: 'Sheikh Zayed Rd, Dubai',
      invoiceId: 'INV-2026-999',
      customerName: 'Prime Retail Group',
      customerEmail: 'finance@primeretail.ae',
      issueDate: '25 Oct 2026',
      dueDate: '08 Nov 2026',
      subtotal: 5000,
      tax: 250,
      total: 5250,
    };

    const html = populateInvoiceTemplate('default_invoice', data);
    expect(html).toContain('Bizz Corp Trading');
    expect(html).toContain('invoicing@bizzcorp.ae');
    expect(html).toContain('Prime Retail Group');
    expect(html).toContain('INV-2026-999');
    expect(html).toContain('AED 5,250.00');
  });

  it('correctly injects company brand logo into template header', () => {
    const logoUrl = 'https://example.com/logo.png';
    const data: InvoiceRenderData = {
      companyName: 'Luxury Goods LLC',
      companyLogo: logoUrl,
      invoiceId: 'INV-100',
      customerName: 'VIP Client',
      issueDate: '25 Oct 2026',
      dueDate: '01 Nov 2026',
      subtotal: 1000,
      tax: 50,
      total: 1050,
    };

    const html = populateInvoiceTemplate('editorial_serif', data);
    expect(html).toContain(logoUrl);
    expect(html).toContain('Luxury Goods LLC');
  });

  it('marks Default Invoice as the main default template for all users', () => {
    const defaultTemplate = INVOICE_TEMPLATES.find((t) => t.id === 'default_invoice');
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.name).toBe('Default Invoice');
    expect(defaultTemplate?.isDefault).toBe(true);
    expect(defaultTemplate?.badge).toBe('Main Default');

    // It should be the first template in the collection
    expect(INVOICE_TEMPLATES[0].id).toBe('default_invoice');

    // Unknown template ID should automatically fall back to Default Invoice
    const fallbackHtml = populateInvoiceTemplate('unknown_or_missing_id', {
      companyName: 'Universal User Co',
      invoiceId: 'INV-FALLBACK-1',
      customerName: 'Any Customer',
      issueDate: '01/01/2026',
      dueDate: '15/01/2026',
      subtotal: 100,
      tax: 5,
      total: 105,
    });
    expect(fallbackHtml).toContain('Universal User Co');
    expect(fallbackHtml).toContain('INV-FALLBACK-1');
  });

  it('restricts Guest Mode strictly to the Main Default Template only', () => {
    const guestComp = {
      id: 'guest_local',
      name: 'Guest Workspace',
      plan: '72-hour Guest',
      templates: ['Default Invoice'],
    };

    // Main Default is accessible
    expect(isTemplateAssignedToCompany(guestComp, 'default_invoice', true)).toBe(true);
    expect(isTemplateAssignedToCompany(guestComp, 'Default Invoice', true)).toBe(true);

    // Other templates are strictly blocked in guest mode
    expect(isTemplateAssignedToCompany(guestComp, 'editorial_serif', true)).toBe(false);
    expect(isTemplateAssignedToCompany(guestComp, 'executive_charcoal_gold', true)).toBe(false);
    expect(isTemplateAssignedToCompany(guestComp, 'nordic_minimal_sage', true)).toBe(false);

    // getAccessibleTemplates returns only default_invoice for guest
    const accessible = getAccessibleTemplates(guestComp, true);
    expect(accessible.length).toBe(1);
    expect(accessible[0].id).toBe('default_invoice');
  });

  it('allows licensed companies to access assigned templates while keeping unassigned locked', () => {
    const commercialComp = {
      id: 'c_123',
      name: 'Tech Ventures FZE',
      plan: 'Business Annual',
      templates: ['Default Invoice', 'Editorial Serif'],
    };

    // Default template is always accessible
    expect(isTemplateAssignedToCompany(commercialComp, 'default_invoice')).toBe(true);

    // Assigned template is accessible
    expect(isTemplateAssignedToCompany(commercialComp, 'editorial_serif')).toBe(true);
    expect(isTemplateAssignedToCompany(commercialComp, 'Editorial Serif')).toBe(true);

    // Unassigned templates are not accessible
    expect(isTemplateAssignedToCompany(commercialComp, 'executive_charcoal_gold')).toBe(false);
    expect(isTemplateAssignedToCompany(commercialComp, 'nordic_minimal_sage')).toBe(false);

    const accessible = getAccessibleTemplates(commercialComp);
    expect(accessible.length).toBe(2);
    expect(accessible.map((t) => t.id)).toEqual(['default_invoice', 'editorial_serif']);
  });

  it('grants all 4 templates when company has all templates assigned', () => {
    const enterpriseComp = {
      id: 'c_enterprise',
      name: 'Global Enterprise Corp',
      plan: 'Premium Annual',
      templates: [
        'Default Invoice',
        'Editorial Serif',
        'Executive Charcoal & Gold',
        'Nordic Minimal Sage',
      ],
    };

    const accessible = getAccessibleTemplates(enterpriseComp);
    expect(accessible.length).toBe(4);
    expect(isTemplateAssignedToCompany(enterpriseComp, 'nordic_minimal_sage')).toBe(true);
    expect(isTemplateAssignedToCompany(enterpriseComp, 'executive_charcoal_gold')).toBe(true);
  });

  it('synchronizes assigned templates between user portal and desktop app', () => {
    // Initial state: company has only default template
    const company = {
      id: 'c_test_sync',
      name: 'Sync Co',
      templates: ['Default Invoice'],
    };

    expect(getAccessibleTemplates(company).map((t) => t.id)).toEqual(['default_invoice']);

    // Admin / User portal assigns Editorial Serif & Nordic Minimal Sage
    const updatedAssignments = ['Default Invoice', 'Editorial Serif', 'Nordic Minimal Sage'];
    const updatedCompany = { ...company, templates: updatedAssignments };

    // Desktop app receives new templates
    const accessibleAfterAssign = getAccessibleTemplates(updatedCompany);
    expect(accessibleAfterAssign.length).toBe(3);
    expect(accessibleAfterAssign.map((t) => t.id)).toContain('editorial_serif');
    expect(accessibleAfterAssign.map((t) => t.id)).toContain('nordic_minimal_sage');
    expect(accessibleAfterAssign.map((t) => t.id)).not.toContain('executive_charcoal_gold');

    // Admin revokes Nordic Minimal Sage
    const revokedCompany = {
      ...updatedCompany,
      templates: ['Default Invoice', 'Editorial Serif'],
    };
    const accessibleAfterRevoke = getAccessibleTemplates(revokedCompany);
    expect(accessibleAfterRevoke.length).toBe(2);
    expect(accessibleAfterRevoke.map((t) => t.id)).toEqual(['default_invoice', 'editorial_serif']);
  });
});
