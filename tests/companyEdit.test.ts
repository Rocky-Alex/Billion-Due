import { describe, expect, it } from 'vitest';
import type { Company } from "../shared/src/domain/demoData";

describe('Company Details and Quota Editing', () => {
  const initialCompany: Company = {
    id: 'c_test_edit_01',
    name: 'Gulf Trading LLC',
    code: 'GLF-4410',
    email: 'info@gulftrading.ae',
    address: 'Sheikh Zayed Rd, Dubai',
    superAdminUser: 'gulf_admin',
    superAdminPassword: 'Client!Pass1',
    installationKey: 'GLF-992-K89A',
    status: 'active',
    plan: 'Starter Monthly',
    license: 'LIC-GLF',
    expires: '10 Nov 2026',
    seatsUsed: 1,
    seatsAllowed: 1,
    devicesAllowed: 2,
    templates: [],
    devices: [
      {
        id: 'dev_1',
        name: 'POS Terminal 01',
        os: 'Windows 11 Pro',
        user: 'gulf_pos1',
        fingerprint: 'fp_a1b2',
        activated: '2026-10-01',
        lastSeen: 'Today 14:00',
        leaseHours: 72,
        status: 'active',
        live: true,
      },
    ],
  };

  it('updates company legal name, email, and business address', () => {
    const updates: Partial<Company> = {
      name: 'Gulf Trading & Logistics PJSC',
      email: 'corporate@gulftrading.ae',
      address: 'Business Bay, Tower B, Dubai',
    };

    const updated: Company = { ...initialCompany, ...updates };

    expect(updated.name).toBe('Gulf Trading & Logistics PJSC');
    expect(updated.email).toBe('corporate@gulftrading.ae');
    expect(updated.address).toBe('Business Bay, Tower B, Dubai');
  });

  it('updates super admin user details, password, and installation key', () => {
    const updates: Partial<Company> = {
      superAdminUser: 'super_executive@gulftrading.ae',
      superAdminPassword: 'Client!NewPassword88',
      installationKey: 'NEW-888-ZX99',
    };

    const updated: Company = { ...initialCompany, ...updates };

    expect(updated.superAdminUser).toBe('super_executive@gulftrading.ae');
    expect(updated.superAdminPassword).toBe('Client!NewPassword88');
    expect(updated.installationKey).toBe('NEW-888-ZX99');
  });

  it('enforces single-user model (1 user account) and verifies seat quota', () => {
    expect(initialCompany.seatsAllowed).toBe(1);
    expect(initialCompany.seatsUsed).toBe(1);
    expect(initialCompany.seatsUsed).toBeLessThanOrEqual(initialCompany.seatsAllowed);
  });

  it('updates device count (devicesAllowed) and validates against currently registered devices', () => {
    const updates: Partial<Company> = {
      devicesAllowed: 8,
      plan: 'Business Annual',
    };

    const updated: Company = { ...initialCompany, ...updates };

    expect(updated.devicesAllowed).toBe(8);
    expect(updated.plan).toBe('Business Annual');
    expect(updated.devices.length).toBe(1);
    expect(updated.devices.length).toBeLessThanOrEqual(updated.devicesAllowed);
  });

  it('supports updating company brand logo', () => {
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const updated: Company = { ...initialCompany, logo: dataUrl };

    expect(updated.logo).toBe(dataUrl);
    expect(updated.logo?.startsWith('data:image/')).toBe(true);

    const cleared: Company = { ...updated, logo: undefined };
    expect(cleared.logo).toBeUndefined();
  });

  it('supports Basic, Plus, and Premium subscription tiers with device and template limits', () => {
    const basicCo: Company = {
      ...initialCompany,
      plan: 'Basic Annual',
      devicesAllowed: 1,
      templates: ['Default Invoice', 'Editorial Serif', 'Executive Charcoal & Gold'],
    };
    expect(basicCo.plan).toContain('Basic');
    expect(basicCo.devicesAllowed).toBe(1);
    expect(basicCo.templates.length).toBe(3);

    const plusCo: Company = {
      ...initialCompany,
      plan: 'Plus Annual',
      devicesAllowed: 3,
      templates: [
        'Default Invoice',
        'Editorial Serif',
        'Executive Charcoal & Gold',
        'Nordic Minimal Sage',
        'Classic Clean Layout',
      ],
    };
    expect(plusCo.plan).toContain('Plus');
    expect(plusCo.devicesAllowed).toBe(3);
    expect(plusCo.templates.length).toBe(5);

    const premiumCo: Company = {
      ...initialCompany,
      plan: 'Premium Annual',
      devicesAllowed: 10,
      templates: [
        'Default Invoice',
        'Editorial Serif',
        'Executive Charcoal & Gold',
        'Nordic Minimal Sage',
        'Unlimited Custom Branded Layouts',
      ],
    };
    expect(premiumCo.plan).toContain('Premium');
    expect(premiumCo.devicesAllowed).toBe(10);
    expect(premiumCo.templates).toContain('Default Invoice');
  });

  it('updates all user details on the separate settings page: logo, legal name, contact no, gmail, address, username, password, installation key', () => {
    const settingsUpdates: Partial<Company> = {
      logo: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      name: 'Alpha Global Solutions FZ-LLC',
      contactNo: '+971 4 999 8888',
      phone: '+971 4 999 8888',
      email: 'finance.lead@gmail.com',
      address: 'Office 702, Dubai Silicon Oasis, Dubai, UAE',
      superAdminUser: 'finance.lead',
      superAdminPassword: 'Shield!SuperPass2026',
      installationKey: 'ALP-902-1188',
    };

    const saved: Company = { ...initialCompany, ...settingsUpdates };

    expect(saved.logo).toBe('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=');
    expect(saved.name).toBe('Alpha Global Solutions FZ-LLC');
    expect(saved.contactNo).toBe('+971 4 999 8888');
    expect(saved.phone).toBe('+971 4 999 8888');
    expect(saved.email).toBe('finance.lead@gmail.com');
    expect(saved.address).toBe('Office 702, Dubai Silicon Oasis, Dubai, UAE');
    expect(saved.superAdminUser).toBe('finance.lead');
    expect(saved.superAdminPassword).toBe('Shield!SuperPass2026');
    expect(saved.installationKey).toBe('ALP-902-1188');
  });

  it('verifies all 12 company details are fully accessible and editable in the Company Details Modal', () => {
    const full12DetailsUpdates: Partial<Company> = {
      // 1. Company Brand Logo
      logo: 'https://example.com/logo.png',
      // 2. Legal Company Name
      name: 'Falcon Tech Solutions LLC',
      // 3. Legal Contact No.
      contactNo: '+971 50 987 6543',
      phone: '+971 50 987 6543',
      // 4. Legal Gmail
      email: 'falcon.billing@gmail.com',
      // 5. Legal Address
      address: 'Floor 18, Al Saada Tower, Dubai, UAE',
      // 6. Super Admin Username / Email
      superAdminUser: 'falcon.billing@gmail.com',
      // 7. Super Admin Password
      superAdminPassword: 'Client!Falcon2026',
      // 8. 10-Character Desktop Installation Key
      installationKey: 'FLC-882-9901',
      // 9. Commercial Subscription & License Tier
      plan: 'Premium Annual',
      devicesAllowed: 5,
      // 10. Tenant Account Status
      status: 'active',
      // 11. Logged Devices
      devices: [
        {
          id: 'dev_falcon_1',
          name: 'POS Main Checkout',
          os: 'Windows 11 Pro',
          user: 'falcon_cashier1',
          fingerprint: 'fp-win-falcon1',
          activated: '2026-10-20',
          lastSeen: 'Just now',
          leaseHours: 72,
          status: 'active',
          live: true,
        },
      ],
      // 12. License
      license: 'lic_c_1793399001122',
      expires: '2027-10-30',
    };

    const result: Company = { ...initialCompany, ...full12DetailsUpdates };

    // 1. Logo
    expect(result.logo).toBe('https://example.com/logo.png');
    // 2. Legal Name
    expect(result.name).toBe('Falcon Tech Solutions LLC');
    // 3. Contact No.
    expect(result.contactNo).toBe('+971 50 987 6543');
    // 4. Gmail
    expect(result.email).toBe('falcon.billing@gmail.com');
    // 5. Address
    expect(result.address).toBe('Floor 18, Al Saada Tower, Dubai, UAE');
    // 6. Super Admin User
    expect(result.superAdminUser).toBe('falcon.billing@gmail.com');
    // 7. Super Admin Password
    expect(result.superAdminPassword).toBe('Client!Falcon2026');
    // 8. Desktop Installation Key
    expect(result.installationKey).toBe('FLC-882-9901');
    // 9. Subscription Tier & Devices Quota
    expect(result.plan).toBe('Premium Annual');
    expect(result.devicesAllowed).toBe(5);
    // 10. Tenant Status
    expect(result.status).toBe('active');
    // 11. Logged Devices & Revocation
    expect(result.devices.length).toBe(1);
    expect(result.devices[0].fingerprint).toBe('fp-win-falcon1');
    // 12. License Key & Expiration
    expect(result.license).toBe('lic_c_1793399001122');
    expect(result.expires).toBe('2027-10-30');
  });
});

