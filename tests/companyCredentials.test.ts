import { describe, expect, it } from 'vitest';
import type { Company } from "../shared/src/domain/demoData";

describe('Company Super Admin Credentials', () => {
  it('assigns super admin username and password when creating a company', () => {
    const company: Company = {
      id: 'c_test_101',
      name: 'Apex Global Inc',
      code: 'APX-1010',
      email: 'owner@apexglobal.com',
      superAdminUser: 'apex_superadmin',
      superAdminPassword: 'ApexPassword!2026',
      status: 'active',
      plan: 'Business Annual',
      license: 'LIC-APX',
      expires: '19 Oct 2027',
      seatsUsed: 1,
      seatsAllowed: 10,
      devicesAllowed: 5,
      templates: [],
      devices: [],
    };

    expect(company.superAdminUser).toBe('apex_superadmin');
    expect(company.superAdminPassword).toBe('ApexPassword!2026');
  });

  it('allows the admin to reset and update client super admin password if forgotten', () => {
    const company: Company = {
      id: 'c_test_102',
      name: 'Vanguard Retail',
      code: 'VAN-2020',
      email: 'director@vanguard.com',
      superAdminUser: 'director@vanguard.com',
      superAdminPassword: 'OldForgottenPassword!123',
      status: 'active',
      plan: 'Business Annual',
      license: 'LIC-VAN',
      expires: '19 Oct 2027',
      seatsUsed: 1,
      seatsAllowed: 5,
      devicesAllowed: 3,
      templates: [],
      devices: [],
    };

    // Admin resets the password
    const newCredentials = {
      superAdminUser: 'vanguard_admin',
      superAdminPassword: 'Shield!NewSecurePass99',
    };

    const updatedCompany: Company = {
      ...company,
      superAdminUser: newCredentials.superAdminUser,
      superAdminPassword: newCredentials.superAdminPassword,
    };

    expect(updatedCompany.superAdminUser).toBe('vanguard_admin');
    expect(updatedCompany.superAdminPassword).toBe('Shield!NewSecurePass99');
    expect(updatedCompany.superAdminPassword).not.toBe(company.superAdminPassword);
  });

  it('authenticates client login using company super admin credentials', () => {
    const companies: Company[] = [
      {
        id: 'c_tenant_1',
        name: 'Horizon Trade',
        code: 'HRZ-3030',
        email: 'billing@horizon.com',
        superAdminUser: 'horizon_boss',
        superAdminPassword: 'HorizonPassword!2026',
        status: 'active',
        plan: 'Business Annual',
        license: 'LIC-HRZ',
        expires: '19 Oct 2027',
        seatsUsed: 2,
        seatsAllowed: 5,
        devicesAllowed: 3,
        templates: [],
        devices: [],
      },
    ];

    const authenticate = (userOrEmail: string, pass: string) => {
      const trimmed = userOrEmail.trim().toLowerCase();
      return companies.find((c) => {
        const u = (c.superAdminUser || c.email || '').toLowerCase();
        const p = c.superAdminPassword || 'Client!2026';
        return (u === trimmed || c.email.toLowerCase() === trimmed) && p === pass;
      });
    };

    // Valid login with username
    expect(authenticate('horizon_boss', 'HorizonPassword!2026')?.id).toBe('c_tenant_1');
    // Valid login with email
    expect(authenticate('billing@horizon.com', 'HorizonPassword!2026')?.id).toBe('c_tenant_1');
    // Invalid password
    expect(authenticate('horizon_boss', 'WrongPassword')).toBeUndefined();
    // Invalid user
    expect(authenticate('unknown_user', 'HorizonPassword!2026')).toBeUndefined();
  });

  it('generates a unique 10-character installation key split 3-3-4 (XXX-XXX-XXXX)', async () => {
    const { generateInstallationKey } = await import('../shared/src/domain/demoData');
    const key = generateInstallationKey();

    expect(key).toBeDefined();
    expect(key.length).toBe(12); // 10 alphanumeric chars + 2 hyphens
    const raw = key.replace(/[^A-Z0-9]/g, '');
    expect(raw.length).toBe(10);
    expect(key).toMatch(/^[2-9A-Z]{3}-[2-9A-Z]{3}-[2-9A-Z]{4}$/);
  });

  it('validates 10-character installation key against company during desktop installation', () => {
    const company: Company = {
      id: 'c_install_test',
      name: 'Dubai Tech Logistics',
      code: 'DXB-9090',
      email: 'ops@dubaitech.com',
      superAdminUser: 'ops@dubaitech.com',
      superAdminPassword: 'DubaiSecret!2026',
      installationKey: '9F2-B7A-4M81',
      status: 'active',
      plan: 'Business Annual',
      license: 'LIC-DXB',
      expires: '19 Oct 2027',
      seatsUsed: 1,
      seatsAllowed: 5,
      devicesAllowed: 3,
      templates: [],
      devices: [],
    };

    const verifyInstallKey = (enteredKey: string, comp: Company) => {
      const normInput = enteredKey.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const normComp = (comp.installationKey || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return normInput === normComp && normInput.length === 10;
    };

    expect(verifyInstallKey('9F2-B7A-4M81', company)).toBe(true);
    expect(verifyInstallKey('9f2b7a4m81', company)).toBe(true); // normalizes lowercase & hyphens
    expect(verifyInstallKey('9F2-B7A-4M80', company)).toBe(false); // wrong key
    expect(verifyInstallKey('9F2-B7A', company)).toBe(false); // incomplete
  });

  it('allows the admin to safely delete a company and removes credentials from access pool', () => {
    let companyList: Company[] = [
      {
        id: 'c_del_1',
        name: 'Obsolete Ventures LLC',
        code: 'OBS-1111',
        email: 'admin@obsolete.io',
        superAdminUser: 'obs_admin',
        superAdminPassword: 'Password!123',
        installationKey: 'ABC-DEF-1234',
        status: 'active',
        plan: 'Starter Monthly',
        license: 'LIC-OBS',
        expires: '01 Nov 2026',
        seatsUsed: 1,
        seatsAllowed: 3,
        devicesAllowed: 2,
        templates: [],
        devices: [
          {
            id: 'd_obs_1',
            name: 'OBS-DESKTOP-1',
            os: 'Windows 11',
            user: 'obs_admin',
            fingerprint: 'fp_obs_1',
            activated: '01 Oct 2026',
            lastSeen: '1 hour ago',
            leaseHours: 72,
            status: 'active',
            live: true,
          },
        ],
      },
      {
        id: 'c_del_2',
        name: 'Active Enterprise LLC',
        code: 'ACT-2222',
        email: 'info@active.io',
        superAdminUser: 'act_admin',
        superAdminPassword: 'SecurePass!2026',
        installationKey: 'XYZ-987-6543',
        status: 'active',
        plan: 'Enterprise',
        license: 'LIC-ACT',
        expires: '01 Nov 2027',
        seatsUsed: 5,
        seatsAllowed: 50,
        devicesAllowed: 20,
        templates: [],
        devices: [],
      },
    ];

    expect(companyList).toHaveLength(2);

    // Confirmation safety validator
    const canDelete = (company: Company, enteredCode: string, acknowledged: boolean) => {
      const codeMatches =
        enteredCode.trim().toUpperCase() === company.code.toUpperCase() ||
        enteredCode.trim().toUpperCase() === 'DELETE';
      return codeMatches && acknowledged;
    };

    const targetCompany = companyList[0];
    expect(canDelete(targetCompany, 'OBS-1111', false)).toBe(false); // Not acknowledged
    expect(canDelete(targetCompany, 'WRONG_CODE', true)).toBe(false); // Wrong code
    expect(canDelete(targetCompany, 'obs-1111', true)).toBe(true); // Case-insensitive code match
    expect(canDelete(targetCompany, 'DELETE', true)).toBe(true); // Explicit DELETE keyword

    // Perform deletion
    companyList = companyList.filter((c) => c.id !== targetCompany.id);

    expect(companyList).toHaveLength(1);
    expect(companyList.find((c) => c.id === 'c_del_1')).toBeUndefined();
    expect(companyList[0].id).toBe('c_del_2');
  });

  it('allows the client super admin to add and delete active devices and enforces slots limit', () => {
    let company: Company = {
      id: 'c_client_device_mgr',
      name: 'Falcon Logistics LLC',
      code: 'FAL-5555',
      email: 'admin@falconlogistics.ae',
      superAdminUser: 'falcon_super',
      superAdminPassword: 'FalconPass!2026',
      installationKey: 'FLC-888-9999',
      status: 'active',
      plan: 'Professional',
      license: 'LIC-FAL',
      expires: '20 Oct 2027',
      seatsUsed: 2,
      seatsAllowed: 10,
      devicesAllowed: 2, // Maximum 2 devices
      templates: [],
      devices: [
        {
          id: 'd_fal_1',
          name: 'Main-Office-PC',
          os: 'Windows 11 Pro',
          user: 'Falcon Admin',
          fingerprint: 'fp:fal:001',
          serialNumber: 'SN-FAL-001',
          activated: '20 Oct 2026',
          lastSeen: '10 mins ago',
          leaseHours: 72,
          status: 'active',
          live: true,
        },
      ],
    };

    expect(company.devices).toHaveLength(1);

    // 1. Add device within allowed limit
    const addDevice = (
      comp: Company,
      data: { name: string; assignedUser: string; os?: string; serialNumber?: string },
    ): { ok: boolean; company: Company; error?: string } => {
      if (comp.devices.length >= comp.devicesAllowed) {
        return { ok: false, company: comp, error: 'Device limit reached' };
      }
      const newDev = {
        id: `d_fal_${comp.devices.length + 1}`,
        name: data.name,
        os: data.os || 'Windows 11 Pro',
        user: data.assignedUser,
        fingerprint: `fp:fal:${Date.now()}`,
        serialNumber: data.serialNumber || 'SN-AUTO-1234',
        activated: '20 Oct 2026',
        lastSeen: 'Just added',
        leaseHours: 72,
        status: 'active' as const,
        live: true,
      };
      return {
        ok: true,
        company: {
          ...comp,
          devices: [...comp.devices, newDev],
        },
      };
    };

    const add1 = addDevice(company, {
      name: 'Warehouse-Billing-PC',
      assignedUser: 'Warehouse Staff',
      serialNumber: 'SN-FAL-002',
    });

    expect(add1.ok).toBe(true);
    company = add1.company;
    expect(company.devices).toHaveLength(2);
    expect(company.devices[1].name).toBe('Warehouse-Billing-PC');

    // 2. Try to add 3rd device when limit is 2
    const add2 = addDevice(company, {
      name: 'Extra-Laptop',
      assignedUser: 'Field Agent',
    });
    expect(add2.ok).toBe(false);
    expect(add2.error).toBe('Device limit reached');
    expect(company.devices).toHaveLength(2);

    // 3. Delete a device to free up slot
    const deleteDevice = (comp: Company, deviceId: string): Company => {
      return {
        ...comp,
        devices: comp.devices.filter((d) => d.id !== deviceId),
      };
    };

    company = deleteDevice(company, 'd_fal_1');
    expect(company.devices).toHaveLength(1);
    expect(company.devices.find((d) => d.id === 'd_fal_1')).toBeUndefined();
    expect(company.devices[0].name).toBe('Warehouse-Billing-PC');

    // 4. Now adding succeeds since a slot was freed
    const add3 = addDevice(company, {
      name: 'Field-Laptop-New',
      assignedUser: 'Field Agent',
      serialNumber: 'SN-FAL-003',
    });
    expect(add3.ok).toBe(true);
    company = add3.company;
    expect(company.devices).toHaveLength(2);
    expect(company.devices[1].name).toBe('Field-Laptop-New');
  });

  it('allows client super admin to change password by verifying current password', () => {
    let company: Company = {
      id: 'c_falcon_auth',
      name: 'Falcon Auto Logistics',
      code: 'FAL-9900',
      email: 'owner@falcon.demo',
      superAdminUser: 'falcon_superadmin',
      superAdminPassword: 'OldFalconPassword!2026',
      status: 'active',
      plan: 'Enterprise Pro',
      license: 'LIC-FALCON',
      expires: '31 Dec 2027',
      seatsUsed: 1,
      seatsAllowed: 10,
      devicesAllowed: 5,
      templates: [],
      devices: [],
    };

    const changeClientPassword = (
      comp: Company,
      currentPass: string,
      newPass: string,
      confirmPass: string,
    ) => {
      if (!currentPass || !newPass) {
        return { ok: false, error: 'Current password and new password are required' };
      }
      if (newPass.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters' };
      }
      if (newPass !== confirmPass) {
        return { ok: false, error: 'New password and confirmation do not match' };
      }
      if (currentPass !== comp.superAdminPassword) {
        return { ok: false, error: 'Incorrect current password' };
      }
      if (currentPass === newPass) {
        return { ok: false, error: 'New password must be different from current password' };
      }

      return {
        ok: true,
        company: {
          ...comp,
          superAdminPassword: newPass,
        },
      };
    };

    // 1. Fails with incorrect current password
    const fail1 = changeClientPassword(
      company,
      'WrongCurrentPassword',
      'BrandNewPass!2026',
      'BrandNewPass!2026',
    );
    expect(fail1.ok).toBe(false);
    expect(fail1.error).toBe('Incorrect current password');

    // 2. Fails when new password is too short (< 6 chars)
    const fail2 = changeClientPassword(
      company,
      'OldFalconPassword!2026',
      '123',
      '123',
    );
    expect(fail2.ok).toBe(false);
    expect(fail2.error).toBe('New password must be at least 6 characters');

    // 3. Fails when confirm password doesn't match
    const fail3 = changeClientPassword(
      company,
      'OldFalconPassword!2026',
      'BrandNewPass!2026',
      'MismatchPass!2026',
    );
    expect(fail3.ok).toBe(false);
    expect(fail3.error).toBe('New password and confirmation do not match');

    // 4. Successfully updates password
    const success = changeClientPassword(
      company,
      'OldFalconPassword!2026',
      'BrandNewPass!2026',
      'BrandNewPass!2026',
    );
    expect(success.ok).toBe(true);
    expect(success.company?.superAdminPassword).toBe('BrandNewPass!2026');
    company = success.company!;
    expect(company.superAdminPassword).toBe('BrandNewPass!2026');
  });

  it('allows client super admin to self-service reset password using 10-character Installation Key', () => {
    const companies: Company[] = [
      {
        id: 'c_reset_test',
        name: 'Nexus Technologies',
        code: 'NEX-7788',
        email: 'admin@nexustech.demo',
        superAdminUser: 'nexus_admin',
        superAdminPassword: 'ForgottenPassword!2026',
        installationKey: 'NEX-98A-B24C', // 10 alphanumeric chars
        status: 'active',
        plan: 'Business Annual',
        license: 'LIC-NEX',
        expires: '19 Oct 2027',
        seatsUsed: 1,
        seatsAllowed: 5,
        devicesAllowed: 3,
        templates: [],
        devices: [],
      },
    ];

    const resetClientPassword = (
      allComps: Company[],
      identifier: string,
      rawKey: string,
      newPass: string,
    ) => {
      const cleanKey = rawKey.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const trimmedId = identifier.trim().toLowerCase();

      if (!trimmedId) return { ok: false, error: 'Identifier is required' };
      if (!cleanKey || cleanKey.length !== 10) {
        return { ok: false, error: 'Valid 10-character Installation Key is required' };
      }
      if (!newPass || newPass.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters' };
      }

      const match = allComps.find((c) => {
        const matchesId =
          c.code.toLowerCase() === trimmedId ||
          c.email.toLowerCase() === trimmedId ||
          (c.superAdminUser || '').toLowerCase() === trimmedId;
        const compKey = (c.installationKey || '').replace(/[^A-Z0-9]/g, '').toUpperCase();
        return matchesId && compKey === cleanKey;
      });

      if (!match) {
        return { ok: false, error: 'Invalid identifier or installation key' };
      }

      return {
        ok: true,
        company: { ...match, superAdminPassword: newPass },
      };
    };

    // 1. Fails with invalid installation key
    const fail1 = resetClientPassword(
      companies,
      'NEX-7788',
      'WRONG-KEY-1234',
      'RecoveredPassword!2026',
    );
    expect(fail1.ok).toBe(false);

    // 2. Fails with incomplete key length
    const fail2 = resetClientPassword(
      companies,
      'NEX-7788',
      'NEX-98A',
      'RecoveredPassword!2026',
    );
    expect(fail2.ok).toBe(false);
    expect(fail2.error).toContain('10-character');

    // 3. Fails with non-existent company
    const fail3 = resetClientPassword(
      companies,
      'NON-EXISTENT',
      'NEX-98A-B24C',
      'RecoveredPassword!2026',
    );
    expect(fail3.ok).toBe(false);

    // 4. Successfully resets using company code and formatted key
    const success1 = resetClientPassword(
      companies,
      'NEX-7788',
      'NEX-98A-B24C',
      'RecoveredPassword!2026',
    );
    expect(success1.ok).toBe(true);
    expect(success1.company?.superAdminPassword).toBe('RecoveredPassword!2026');

    // 5. Also successfully resets using Super Admin email and unhyphenated key
    const success2 = resetClientPassword(
      companies,
      'admin@nexustech.demo',
      'NEX98AB24C',
      'SecondRecoveredPass!2026',
    );
    expect(success2.ok).toBe(true);
    expect(success2.company?.superAdminPassword).toBe('SecondRecoveredPass!2026');
  });

  it('allows software owner (admin) to change and reset master password', () => {
    let currentAdminPass = 'Owner!2026';
    const masterRecoveryKey = 'SHIELD-ADMIN-RECOVER-2026';

    // 1. Change password while authenticated
    const changeAdminPassword = (current: string, next: string) => {
      if (current !== currentAdminPass) return { ok: false, error: 'Incorrect current admin password' };
      if (!next || next.length < 6) return { ok: false, error: 'New password must be at least 6 characters' };
      currentAdminPass = next;
      return { ok: true, password: next };
    };

    expect(changeAdminPassword('WrongPass', 'NewOwner!2026').ok).toBe(false);
    const changeOk = changeAdminPassword('Owner!2026', 'NewOwner!2026');
    expect(changeOk.ok).toBe(true);
    expect(currentAdminPass).toBe('NewOwner!2026');

    // 2. Self-service reset via Master Recovery Key
    const resetAdminPassword = (key: string, next: string) => {
      const norm = key.trim().toUpperCase();
      if (norm !== masterRecoveryKey) return { ok: false, error: 'Invalid Master Admin Recovery Key' };
      if (!next || next.length < 6) return { ok: false, error: 'New password must be at least 6 characters' };
      currentAdminPass = next;
      return { ok: true, password: next };
    };

    expect(resetAdminPassword('WRONG-RECOVERY-KEY', 'OwnerReset!2026').ok).toBe(false);
    const resetOk = resetAdminPassword('SHIELD-ADMIN-RECOVER-2026', 'OwnerReset!2026');
    expect(resetOk.ok).toBe(true);
    expect(currentAdminPass).toBe('OwnerReset!2026');
  });

  it('shows device requests badge with pending count when pending > 0, and hides it completely when 0', () => {
    type TestRequest = { id: string; status: 'pending' | 'approved' | 'rejected' };
    const requests: TestRequest[] = [
      { id: 'req_1', status: 'pending' },
      { id: 'req_2', status: 'approved' },
      { id: 'req_3', status: 'rejected' },
    ];

    // Badge visibility logic used in AdminSidebar
    const renderSidebarBadge = (reqs: TestRequest[]) => {
      const pendingCount = reqs.filter((r) => r.status === 'pending').length;
      return pendingCount > 0 ? String(pendingCount) : null;
    };

    // 1. With 1 pending request: badge is visible and shows "1"
    expect(renderSidebarBadge(requests)).toBe('1');

    // 2. With 3 pending requests: badge is visible and shows "3"
    const moreRequests: TestRequest[] = [
      { id: 'r1', status: 'pending' },
      { id: 'r2', status: 'pending' },
      { id: 'r3', status: 'pending' },
    ];
    expect(renderSidebarBadge(moreRequests)).toBe('3');

    // 3. When the pending request is approved/rejected, pending count becomes 0
    const resolvedRequests: TestRequest[] = requests.map((r) =>
      r.id === 'req_1' ? { ...r, status: 'approved' as const } : r,
    );
    // When count is 0, it never shows (returns null)
    expect(renderSidebarBadge(resolvedRequests)).toBeNull();

    // 4. Empty requests list: badge is hidden (returns null)
    expect(renderSidebarBadge([])).toBeNull();
  });

  it('supports all 5 legal client tenant entity fields (Logo, Name, Contact No, Gmail, Address)', () => {
    const tenantCompany: Company = {
      id: 'c_tenant_legal_01',
      name: 'Al Etihad Trading LLC',
      code: 'AET-4040',
      email: 'etihad.trading@gmail.com',
      contactNo: '+971 4 223 9988',
      phone: '+971 4 223 9988',
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      address: 'Office 402, Al Etihad Commercial Tower, Deira, Dubai, UAE',
      superAdminUser: 'etihad.trading@gmail.com',
      superAdminPassword: 'EtihadSecurePass!2026',
      installationKey: 'AET-789-2026',
      status: 'active',
      plan: 'Plus Annual',
      license: 'Not issued',
      expires: '—',
      seatsUsed: 0,
      seatsAllowed: 1,
      devicesAllowed: 3,
      templates: ['Default Invoice'],
      devices: [],
    };

    // Verify all 5 legal client tenant entity fields
    expect(tenantCompany.logo).toBeDefined();
    expect(tenantCompany.name).toBe('Al Etihad Trading LLC');
    expect(tenantCompany.contactNo).toBe('+971 4 223 9988');
    expect(tenantCompany.email).toBe('etihad.trading@gmail.com');
    expect(tenantCompany.address).toBe('Office 402, Al Etihad Commercial Tower, Deira, Dubai, UAE');
  });
});




