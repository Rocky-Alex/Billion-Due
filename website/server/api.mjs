import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { randomUUID, createHash, randomInt } from "node:crypto";
import pg from "pg";
import nodemailer from "nodemailer";

const { Pool } = pg;
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is required in .env.local");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 8,
});
const port = Number(process.env.API_PORT || 8787);
const origin = process.env.WEB_ORIGIN || "http://localhost:3001";

// SMTP / Gmail Email Transporter Setup for Secure Hardware Installation Verification
const smtpHost =
  process.env.SMTP_HOST ||
  (process.env.GMAIL_USER || process.env.SMTP_USER ? "smtp.gmail.com" : "");
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
const smtpPass = (
  process.env.SMTP_PASS ||
  process.env.GMAIL_PASS ||
  process.env.GMAIL_APP_PASSWORD ||
  ""
).replace(/\s+/g, "");
const smtpFrom =
  process.env.SMTP_FROM ||
  (smtpUser
    ? `BillionDue Security <${smtpUser}>`
    : "BillionDue Security <no-reply@billiondue.com>");

let mailTransporter = null;
if (smtpUser && smtpPass) {
  mailTransporter = nodemailer.createTransport({
    host: smtpHost || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  console.log(
    `[SMTP Configured] Mail delivery active via ${smtpHost || "smtp.gmail.com"}:${smtpPort} (Account: ${smtpUser})`,
  );
} else {
  console.log(
    "[SMTP Notice] Set SMTP_USER and SMTP_PASS (Gmail App Password) in .env.local to dispatch OTPs directly to Gmail inboxes.",
  );
}

async function sendActivationOtpEmail(toEmail, code, companyName) {
  if (!mailTransporter) {
    console.log(
      `[SMTP Not Configured] Installation OTP for ${toEmail} (${companyName}) generated: ${code}`,
    );
    return {
      sent: false,
      reason: "SMTP credentials not configured in .env.local",
    };
  }
  try {
    const info = await mailTransporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: `[BillionDue] ${code} is your Desktop Installation Security Code`,
      text: `Hello,\n\nA physical desktop application installation was initiated for ${companyName}.\n\nYour 6-Digit Verification Code is: ${code}\n\nThis verification code will expire in 15 minutes.\n\nTo prevent unauthorized or illegal installations, never share this code or your 10-character Installation Key with anyone.\n\nBillionDue Security Operations`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 32px 16px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: 800; color: #6366f1; letter-spacing: 1.5px; text-transform: uppercase;">BillionDue · Turn invoices into income.</span>
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 6px 0 0;">Desktop Installation Verification</h1>
            </div>
            <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
              An authorized desktop installation and motherboard hardware-binding request was initiated for <strong>${companyName}</strong>.
            </p>
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 22px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Your 6-Digit One-Time Password (OTP)</div>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca;">${code}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Valid for 15 minutes</div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 14px; font-size: 11px; color: #991b1b; line-height: 1.5; margin-bottom: 20px;">
              <strong>Anti-Piracy Security Guard:</strong> This verification code binds this computer's motherboard/BIOS hardware signature to your license. Do not share this code if you did not initiate this setup.
            </div>
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
              If you did not request this installation, contact software administration immediately.
            </p>
          </div>
        </div>
      `,
    });
    console.log(
      `[SMTP Success] Verification email dispatched to ${toEmail}: ${info.messageId}`,
    );
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(
      `[SMTP Failure] Could not dispatch email to ${toEmail}:`,
      err.message,
    );
    return { sent: false, error: err.message };
  }
}

async function sendReloginRequestSecurityEmail(toEmail, details) {
  if (!mailTransporter) {
    console.log(
      `[SMTP Notice] Relogin request security copy for ${toEmail}: Request #${details.id} for device "${details.deviceName}"`,
    );
    return {
      sent: false,
      reason: "SMTP credentials not configured in .env.local",
    };
  }
  try {
    const info = await mailTransporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: `[BillionDue Security] Security Notice: Device Re-login Request (${details.id})`,
      text: `Hello,\n\nA re-login request has been submitted for device "${details.deviceName}" under company "${details.companyName || details.companyId}".\n\nRequest ID: ${details.id}\nRequested By: ${details.requestedBy}\nHardware Fingerprint: ${details.fingerprint}\nSubmission Time: ${new Date().toISOString()}\n\nA copy of this request has been forwarded to the software administrator for approval.\nIf you did not initiate this request, please contact your administrator immediately.\n\nBillionDue Security Operations`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 32px 16px;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: 800; color: #6366f1; letter-spacing: 1.5px; text-transform: uppercase;">BillionDue Security Operations</span>
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 6px 0 0;">Device Re-login Security Copy</h1>
            </div>
            <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
              A re-login authorization request was initiated for a previously removed device. An administrative security verification ticket has been dispatched to the Software Admin.
            </p>
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Request Ticket:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #4338ca;">${details.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Device Name:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">${details.deviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Operator / User:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">${details.requestedBy}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Hardware Signature:</td>
                  <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 11px; color: #475569;">${details.fingerprint}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Security Status:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #d97706;">Pending Admin Approval</td>
                </tr>
              </table>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 14px; font-size: 11px; color: #1e40af; line-height: 1.5; margin-bottom: 20px;">
              <strong>Security Copy Notice:</strong> This audit copy was sent to your Gmail inbox (<strong>${toEmail}</strong>). The Software Administrator has received this ticket in the Admin Portal and must approve this device before billing operations can resume.
            </div>
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
              If you did not initiate this request, please contact your administrator or change your security credentials immediately.
            </p>
          </div>
        </div>
      `,
    });
    console.log(
      `[SMTP Success] Relogin security copy email dispatched to ${toEmail}: ${info.messageId}`,
    );
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(
      `[SMTP Failure] Could not dispatch relogin security email to ${toEmail}:`,
      err.message,
    );
    return { sent: false, error: err.message };
  }
}

function parseDurationToMinutes(durationStr) {
  if (!durationStr || typeof durationStr !== "string" || !durationStr.trim()) {
    return null;
  }
  const clean = durationStr.trim();
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/i);
  if (!match) return null;

  const val = parseFloat(match[1]);
  if (isNaN(val) || val <= 0) return null;

  const unit = match[2].toLowerCase();
  if (unit.startsWith("m") && !unit.startsWith("mo")) {
    return Math.max(1, Math.round(val));
  }
  if (unit.startsWith("h")) {
    return Math.max(1, Math.round(val * 60));
  }
  if (unit.startsWith("d")) {
    return Math.max(1, Math.round(val * 1440));
  }
  return null;
}

function getPlanOfflineInterval(plan, devicesAllowed, offlineLeaseOverride) {
  const customMins = parseDurationToMinutes(offlineLeaseOverride);
  if (customMins !== null && customMins > 0) {
    if (customMins < 60) {
      return `${customMins} minutes`;
    }
    if (customMins % 1440 === 0) {
      return `${customMins / 1440} days`;
    }
    if (customMins % 60 === 0) {
      return `${customMins / 60} hours`;
    }
    return `${customMins} minutes`;
  }

  const p = String(plan || "").toLowerCase();
  if (p.includes("guest")) return "72 hours";
  if (
    p.includes("premium") ||
    (!p.includes("basic") && !p.includes("plus") && Number(devicesAllowed) >= 5)
  ) {
    return "15 days";
  }
  if (
    p.includes("plus") ||
    (!p.includes("basic") && Number(devicesAllowed) >= 3)
  ) {
    return "7 days";
  }
  if (p.includes("basic") || Number(devicesAllowed) <= 1) {
    return "48 hours";
  }
  return "7 days";
}

function getPlanOfflineHours(plan, devicesAllowed, offlineLeaseOverride) {
  const customMins = parseDurationToMinutes(offlineLeaseOverride);
  if (customMins !== null && customMins > 0) {
    return customMins / 60;
  }
  const p = String(plan || "").toLowerCase();
  if (p.includes("guest")) return 72;
  if (
    p.includes("premium") ||
    (!p.includes("basic") && !p.includes("plus") && Number(devicesAllowed) >= 5)
  ) {
    return 360; // 15 days
  }
  if (
    p.includes("plus") ||
    (!p.includes("basic") && Number(devicesAllowed) >= 3)
  ) {
    return 168; // 7 days
  }
  return 48;
}

if (process.env.AUTO_MIGRATE === "true") {
  const schema = await fs.readFile(
    new URL("./db/schema.sql", import.meta.url),
    "utf8",
  );
  await pool.query(schema);
}

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      password text NOT NULL,
      recovery_key text,
      name text,
      contact_no text,
      address text,
      role_title text,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name text;
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS contact_no text;
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS address text;
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role_title text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS super_admin_user text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS super_admin_password text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS installation_key text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS address text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_no text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS offline_lease_override text;
    ALTER TABLE devices ADD COLUMN IF NOT EXISTS serial_number text;
    ALTER TABLE device_requests ADD COLUMN IF NOT EXISTS user_email text;
    ALTER TABLE device_requests ADD COLUMN IF NOT EXISTS is_relogin boolean DEFAULT false;
    ALTER TABLE activation_otps ADD COLUMN IF NOT EXISTS used_at timestamptz;
  `);
  if (process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_PASSWORD) {
    await pool.query(
      "INSERT INTO admin_users(id,email,password,recovery_key) VALUES('admin_primary',$1,$2,$3) ON CONFLICT(id) DO NOTHING",
      [
        process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase(),
        process.env.INITIAL_ADMIN_PASSWORD,
        process.env.INITIAL_ADMIN_RECOVERY_KEY || null,
      ],
    );
  }
  const existingNoKey = await pool.query(
    "SELECT id FROM companies WHERE installation_key IS NULL OR installation_key = ''",
  );
  for (const row of existingNoKey.rows) {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const pick = (n) =>
      Array.from({ length: n }, () => chars[randomInt(0, chars.length)]).join(
        "",
      );
    const key = `${pick(3)}-${pick(3)}-${pick(4)}`;
    await pool.query("UPDATE companies SET installation_key=$1 WHERE id=$2", [
      key,
      row.id,
    ]);
  }

  const defaultTemplates = [
    {
      name: "Default Invoice",
      definition: {
        id: "default_invoice",
        accent: "#113537",
        category: "Corporate & Consulting",
        description:
          "Main standard invoice template available to all users. Modern corporate layout with forest teal header & structured slate tables",
        preview: "/templates/default_invoice/screen.png",
        badge: "Main Default",
        isDefault: true,
      },
    },
    {
      name: "Editorial Serif",
      definition: {
        id: "editorial_serif",
        accent: "#4A1521",
        category: "Boutique & Luxury",
        description:
          "Parchment luxury boutique design with Cormorant Garamond serif typography and deep burgundy accents",
        preview: "/templates/editorial_serif/screen.png",
        badge: "Editorial Burgundy",
      },
    },
    {
      name: "Executive Charcoal & Gold",
      definition: {
        id: "executive_charcoal_gold",
        accent: "#064E3B ",
        category: "Prestige & Legal",
        description:
          "Obsidian charcoal canvas with Cinzel headings, rich gold foil borders, and executive hierarchy",
        preview: "/templates/executive_charcoal_gold/screen.png",
        badge: "Charcoal & Gold",
      },
    },
    {
      name: "Nordic Minimal Sage",
      definition: {
        id: "nordic_minimal_sage",
        accent: "#183833",
        category: "Scandinavian Minimalist",
        description:
          "Clean Nordic design with Plus Jakarta Sans, soft sage background cards, and pine green typography",
        preview: "/templates/nordic_minimal_sage/screen.png",
        badge: "Nordic Sage",
      },
    },
  ];
  for (const t of defaultTemplates) {
    await pool.query(
      `INSERT INTO invoice_templates(name, definition, active)
       VALUES($1, $2, true)
       ON CONFLICT(name) DO UPDATE SET definition=$2, active=true`,
      [t.name, JSON.stringify(t.definition)],
    );
  }
  const defaultTmpl = await pool.query(
    "SELECT id FROM invoice_templates WHERE name='Default Invoice' OR id::text='default_invoice' OR definition->>'id'='default_invoice' LIMIT 1",
  );
  if (defaultTmpl.rowCount > 0) {
    const defaultId = defaultTmpl.rows[0].id;
    const compsWithoutTemplates = await pool.query(
      "SELECT c.id FROM companies c WHERE NOT EXISTS (SELECT 1 FROM company_templates ct WHERE ct.company_id=c.id)",
    );
    for (const c of compsWithoutTemplates.rows) {
      await pool.query(
        "INSERT INTO company_templates(company_id, template_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
        [c.id, defaultId],
      );
    }
  }
} catch (err) {
  console.error("Migration notice:", err.message);
}

const json = (res, status, body) => {
  res.setHeader("content-type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(body));
};
const body = async (req) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
};
const audit = (client, companyId, action, entityType, entityId, data = {}) =>
  client.query(
    "INSERT INTO audit_log(company_id,actor,action,entity_type,entity_id,data) VALUES($1,$2,$3,$4,$5,$6)",
    [companyId, "software-owner", action, entityType, entityId, data],
  );

const server = http.createServer(async (req, res) => {
  const reqOrigin = req.headers.origin;
  let allowOrigin = origin;
  if (reqOrigin) {
    try {
      const u = new URL(reqOrigin);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        allowOrigin = reqOrigin;
      }
    } catch { }
  }
  res.setHeader("access-control-allow-origin", allowOrigin);
  res.setHeader("access-control-allow-credentials", "true");
  res.setHeader(
    "access-control-allow-headers",
    "content-type, authorization, x-requested-with, accept, origin",
  );
  res.setHeader(
    "access-control-allow-methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  try {
    if (req.url === "/api/health" && req.method === "GET") {
      await pool.query("SELECT 1");
      return json(res, 200, { ok: true, database: "neon" });
    }
    if (req.url === "/api/downloads/windows" && req.method === "GET") {
      let installer = new URL(
        "../release/BillionDue Setup 0.1.0.exe",
        import.meta.url,
      );
      try {
        await fs.stat(installer);
      } catch {
        installer = new URL(
          "../../release/BillionDue Setup 0.1.0.exe",
          import.meta.url,
        );
      }
      const info = await fs.stat(installer);
      res.setHeader(
        "content-type",
        "application/vnd.microsoft.portable-executable",
      );
      res.setHeader(
        "content-disposition",
        'attachment; filename="BillionDue-Setup.exe"',
      );
      res.setHeader("content-length", String(info.size));
      res.writeHead(200);
      createReadStream(installer).pipe(res);
      return;
    }
    if (req.url === "/api/auth/login" && req.method === "POST") {
      const x = await body(req);
      const portal = x.portal || "client";
      const email = (x.email || "").trim().toLowerCase();
      const password = (x.password || "").trim();

      if (!email || !password) {
        return json(res, 400, {
          error: "Email/username and password are required",
        });
      }

      if (portal === "admin") {
        const q = await pool.query(
          "SELECT * FROM admin_users WHERE (lower(email)=$1 OR lower(id)=$1) AND password=$2",
          [email, password],
        );
        if (!q.rowCount) {
          return json(res, 401, { error: "Invalid admin credentials" });
        }
        await audit(pool, null, "admin.logged_in", "admin_user", q.rows[0].id, {
          email,
        });
        return json(res, 200, {
          ok: true,
          role: "admin",
          email: q.rows[0].email,
        });
      } else {
        const q = await pool.query(
          "SELECT * FROM companies WHERE (lower(super_admin_user)=$1 OR lower(email)=$1) AND super_admin_password=$2",
          [email, password],
        );
        if (!q.rowCount) {
          return json(res, 401, { error: "Invalid Super Admin credentials" });
        }
        const comp = q.rows[0];
        if (comp.status === "blocked") {
          return json(res, 403, {
            error: "Company account is blocked by software owner",
          });
        }
        await audit(pool, comp.id, "client.logged_in", "company", comp.id, {
          user: email,
        });
        return json(res, 200, {
          ok: true,
          role: "client",
          companyId: comp.id,
          companyName: comp.name,
          superAdminUser: comp.super_admin_user,
        });
      }
    }
    if (req.url === "/api/auth/change-password" && req.method === "POST") {
      const x = await body(req);
      const role = x.role || "client";
      const currentPassword = (x.currentPassword || "").trim();
      const newPassword = (x.newPassword || "").trim();

      if (!currentPassword || !newPassword) {
        return json(res, 400, {
          error: "Current password and new password are required",
        });
      }
      if (newPassword.length < 6) {
        return json(res, 400, {
          error: "New password must be at least 6 characters",
        });
      }

      if (role === "admin") {
        const check = await pool.query(
          "SELECT * FROM admin_users WHERE password=$1",
          [currentPassword],
        );
        if (!check.rowCount) {
          return json(res, 400, { error: "Incorrect current admin password" });
        }
        await pool.query(
          "UPDATE admin_users SET password=$1, updated_at=now() WHERE id=$2",
          [newPassword, check.rows[0].id],
        );
        await audit(
          pool,
          null,
          "admin.password_changed",
          "admin_user",
          check.rows[0].id,
          {},
        );
        return json(res, 200, {
          ok: true,
          message: "Admin master password updated successfully",
        });
      } else {
        const companyId = x.companyId;
        if (!companyId)
          return json(res, 400, { error: "Company ID is required" });
        const check = await pool.query(
          "SELECT * FROM companies WHERE id=$1 AND super_admin_password=$2",
          [companyId, currentPassword],
        );
        if (!check.rowCount) {
          return json(res, 400, {
            error: "Incorrect current Super Admin password",
          });
        }
        await pool.query(
          "UPDATE companies SET super_admin_password=$1, updated_at=now() WHERE id=$2",
          [newPassword, companyId],
        );
        await audit(
          pool,
          companyId,
          "client.password_changed",
          "company",
          companyId,
          {
            user: check.rows[0].super_admin_user || check.rows[0].email,
          },
        );
        return json(res, 200, {
          ok: true,
          companyId,
          message: "Client Super Admin password updated successfully",
        });
      }
    }
    if (req.url === "/api/auth/reset-password" && req.method === "POST") {
      const x = await body(req);
      const role = x.role || "client";
      const newPassword = (x.newPassword || "").trim();

      if (!newPassword || newPassword.length < 6) {
        return json(res, 400, {
          error: "New password must be at least 6 characters",
        });
      }

      if (role === "admin") {
        const email = (x.email || "").trim().toLowerCase();
        const recoveryKey = (x.recoveryKey || "").trim().toUpperCase();

        const check = await pool.query(
          "SELECT * FROM admin_users WHERE (lower(email)=$1 OR id='admin_primary')",
          [email],
        );
        if (!check.rowCount) {
          return json(res, 404, { error: "Admin account not found" });
        }
        const adminRec = check.rows[0];
        const validKey = String(adminRec.recovery_key || "").toUpperCase();
        if (!validKey || recoveryKey !== validKey) {
          return json(res, 401, { error: "Invalid Master Admin Recovery Key" });
        }

        await pool.query(
          "UPDATE admin_users SET password=$1, updated_at=now() WHERE id=$2",
          [newPassword, adminRec.id],
        );
        await audit(
          pool,
          null,
          "admin.password_reset",
          "admin_user",
          adminRec.id,
          { email },
        );
        return json(res, 200, {
          ok: true,
          message: "Admin password reset successfully",
        });
      } else {
        const identifier = (x.identifier || "").trim().toLowerCase();
        const rawKey = (x.installationKey || "")
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");

        if (!identifier) {
          return json(res, 400, {
            error: "Company code, email, or username is required",
          });
        }
        if (!rawKey || rawKey.length !== 10) {
          return json(res, 400, {
            error:
              "Valid 10-character Installation Key (XXX-XXX-XXXX) is required to reset password",
          });
        }

        const compRes = await pool.query(
          "SELECT * FROM companies WHERE lower(code)=$1 OR lower(email)=$1 OR lower(super_admin_user)=$1",
          [identifier],
        );
        if (!compRes.rowCount) {
          return json(res, 404, {
            error: "No client company found matching this code/user",
          });
        }
        const comp = compRes.rows[0];
        const compKey = (comp.installation_key || "")
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");

        if (compKey !== rawKey) {
          return json(res, 401, {
            error: "Installation Key does not match this company",
          });
        }

        await pool.query(
          "UPDATE companies SET super_admin_password=$1, updated_at=now() WHERE id=$2",
          [newPassword, comp.id],
        );
        await audit(
          pool,
          comp.id,
          "client.password_reset",
          "company",
          comp.id,
          {
            user: comp.super_admin_user || comp.email,
          },
        );
        return json(res, 200, {
          ok: true,
          companyId: comp.id,
          companyName: comp.name,
          user: comp.super_admin_user || comp.email,
          message: `Password for ${comp.name} reset successfully!`,
        });
      }
    }
    if (req.url === "/api/admin/profile" && req.method === "GET") {
      const q = await pool.query(
        "SELECT id, email, name, contact_no, address, role_title, recovery_key FROM admin_users ORDER BY id LIMIT 1",
      );
      const row = q.rows[0] || {};
      return json(res, 200, {
        ok: true,
        profile: {
          name: row.name || "",
          email: row.email || "",
          contactNo: row.contact_no || "",
          address: row.address || "",
          roleTitle: row.role_title || "",
          recoveryKey: row.recovery_key || "",
        },
      });
    }
    if (
      req.url === "/api/admin/profile" &&
      (req.method === "PATCH" || req.method === "PUT" || req.method === "POST")
    ) {
      const x = await body(req);
      const name = (x.name || "").trim();
      const email = (x.email || "").trim();
      const contactNo = (x.contactNo || x.contact_no || "").trim();
      const address = (x.address || "").trim();
      const roleTitle = (x.roleTitle || x.role_title || "").trim();
      const recoveryKey = (x.recoveryKey || x.recovery_key || "").trim();

      const existing = await pool.query(
        "SELECT id FROM admin_users ORDER BY id LIMIT 1",
      );
      let adminId = existing.rows[0]?.id;
      if (!adminId) {
        adminId = "admin_primary";
        await pool.query(
          "INSERT INTO admin_users(id, email, password, name, contact_no, address, role_title, recovery_key) VALUES($1, $2, 'Admin!2026', $3, $4, $5, $6, $7)",
          [
            adminId,
            email || "admin@local",
            name,
            contactNo,
            address,
            roleTitle,
            recoveryKey,
          ],
        );
      } else {
        const params = [name, contactNo, address, roleTitle];
        let paramIdx = 5;
        let queryStr =
          "UPDATE admin_users SET name=$1, contact_no=$2, address=$3, role_title=$4";
        if (email) {
          queryStr += `, email=$${paramIdx++}`;
          params.push(email);
        }
        if (recoveryKey) {
          queryStr += `, recovery_key=$${paramIdx++}`;
          params.push(recoveryKey);
        }
        queryStr += `, updated_at=now() WHERE id=$${paramIdx}`;
        params.push(adminId);
        await pool.query(queryStr, params);
      }

      await audit(pool, null, "admin.profile_updated", "admin_user", adminId, {
        name,
        email,
        roleTitle,
      });

      return json(res, 200, {
        ok: true,
        message: "Software Owner profile saved successfully",
        profile: {
          name,
          email,
          contactNo,
          address,
          roleTitle,
          recoveryKey,
        },
      });
    }
    if (req.url === "/api/admin/bootstrap" && req.method === "GET") {
      const [
        companies,
        licenses,
        devices,
        requests,
        templates,
        assignments,
        events,
        audits,
        adminUserRes,
      ] = await Promise.all([
        pool.query("SELECT * FROM companies ORDER BY created_at"),
        pool.query("SELECT * FROM licenses"),
        pool.query("SELECT * FROM devices ORDER BY activated_at"),
        pool.query("SELECT * FROM device_requests ORDER BY attempted_at DESC"),
        pool.query(
          "SELECT * FROM invoice_templates WHERE active=true ORDER BY name",
        ),
        pool.query("SELECT * FROM company_templates"),
        pool.query(
          "SELECT * FROM security_events ORDER BY created_at DESC LIMIT 100",
        ),
        pool.query(
          "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100",
        ),
        pool.query(
          "SELECT id, email, name, contact_no, address, role_title, recovery_key FROM admin_users ORDER BY id LIMIT 1",
        ),
      ]);
      const adminRow = adminUserRes?.rows?.[0] || null;
      return json(res, 200, {
        companies: companies.rows,
        licenses: licenses.rows,
        devices: devices.rows,
        requests: requests.rows,
        templates: templates.rows,
        templateAssignments: assignments.rows,
        securityEvents: events.rows,
        auditLog: audits.rows,
        adminProfile: adminRow
          ? {
            name: adminRow.name || "",
            email: adminRow.email || "",
            contactNo: adminRow.contact_no || "",
            address: adminRow.address || "",
            roleTitle: adminRow.role_title || "",
            recoveryKey: adminRow.recovery_key || "",
          }
          : null,
      });
    }
    if (req.url === "/api/admin/device-requests" && req.method === "GET") {
      const result = await pool.query(`
        SELECT r.*, c.name AS company_name
        FROM device_requests r
        LEFT JOIN companies c ON c.id=r.company_id
        ORDER BY r.attempted_at DESC
      `);
      return json(res, 200, { requests: result.rows });
    }
    if (req.url?.startsWith("/api/client/bootstrap?") && req.method === "GET") {
      const companyId = new URL(req.url, "http://localhost").searchParams.get(
        "companyId",
      );
      if (!companyId) return json(res, 400, { error: "companyId is required" });
      const [company, license, devices, requests, templates, events] =
        await Promise.all([
          pool.query("SELECT * FROM companies WHERE id=$1", [companyId]),
          pool.query("SELECT * FROM licenses WHERE company_id=$1", [companyId]),
          pool.query(
            "SELECT * FROM devices WHERE company_id=$1 ORDER BY activated_at",
            [companyId],
          ),
          pool.query(
            "SELECT * FROM device_requests WHERE company_id=$1 ORDER BY attempted_at DESC",
            [companyId],
          ),
          pool.query(
            "SELECT t.* FROM invoice_templates t JOIN company_templates ct ON ct.template_id=t.id WHERE ct.company_id=$1 AND t.active=true ORDER BY t.name",
            [companyId],
          ),
          pool.query(
            "SELECT * FROM security_events WHERE company_id=$1 ORDER BY created_at DESC LIMIT 100",
            [companyId],
          ),
        ]);

      let templateRows = templates.rows;
      if (templateRows.length === 0) {
        const def = await pool.query(
          "SELECT * FROM invoice_templates WHERE name='Default Invoice' LIMIT 1"
        );
        if (def.rows[0]) {
          await pool.query(
            "INSERT INTO company_templates(company_id, template_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
            [companyId, def.rows[0].id]
          );
          templateRows = [def.rows[0]];
        }
      }

      const assignments = await pool.query(
        "SELECT * FROM company_templates WHERE company_id=$1",
        [companyId],
      );

      return json(res, 200, {
        company: company.rows[0] || null,
        license: license.rows[0] || null,
        devices: devices.rows,
        requests: requests.rows,
        templates: templateRows,
        templateAssignments: assignments.rows,
        securityEvents: events.rows,
      });
    }
    if (req.url === "/api/admin/companies" && req.method === "POST") {
      const x = await body(req);
      const id = x.id || `c_${randomUUID()}`;
      const superAdminUser = x.superAdminUser || x.email || "";
      const superAdminPassword = String(x.superAdminPassword || "").trim();
      if (!superAdminPassword) {
        return json(res, 400, {
          error: "Initial Super Admin password is required",
        });
      }
      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      const pick = (n) =>
        Array.from({ length: n }, () => chars[randomInt(0, chars.length)]).join(
          "",
        );
      const generatedKey = `${pick(3)}-${pick(3)}-${pick(4)}`;
      const installationKey = (
        x.installationKey ||
        x.installation_key ||
        generatedKey
      )
        .trim()
        .toUpperCase();

      const contactPhone = x.contactNo || x.phone || null;
      const offlineLeaseOverride =
        (x.offlineLeaseOverride || x.offline_lease_override || "").trim() ||
        null;
      const result = await pool.query(
        "INSERT INTO companies(id,name,code,email,address,logo,status,plan,seats_allowed,devices_allowed,super_admin_user,super_admin_password,installation_key,phone,contact_no,offline_lease_override) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *",
        [
          id,
          x.name,
          x.code,
          x.email,
          x.address || null,
          x.logo || null,
          x.status || "active",
          x.plan,
          x.seatsAllowed || 1,
          x.devicesAllowed || 1,
          superAdminUser,
          superAdminPassword,
          installationKey,
          contactPhone,
          contactPhone,
          offlineLeaseOverride,
        ],
      );
      const licId = `lic_${randomUUID()}`;
      const offlineHours = getPlanOfflineHours(
        x.plan,
        x.devicesAllowed,
        offlineLeaseOverride,
      );
      await pool.query(
        "INSERT INTO licenses(id,company_id,status,starts_at,expires_at,offline_lease_hours,token_version,reverify_epoch) VALUES($1,$2,'active',now(),now()+interval '1 year',$3,1,1)",
        [licId, id, offlineHours],
      );
      const defaultTemplRes = await pool.query(
        "SELECT id FROM invoice_templates WHERE name='Default Invoice' OR id::text='default_invoice' OR definition->>'id'='default_invoice' LIMIT 1",
      );
      if (defaultTemplRes.rowCount > 0) {
        await pool.query(
          "INSERT INTO company_templates(company_id, template_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
          [id, defaultTemplRes.rows[0].id],
        );
      }
      await audit(pool, id, "company.created", "company", id, {
        name: x.name,
        superAdminUser,
        installationKey,
      });
      return json(res, 201, result.rows[0]);
    }
    if (req.url === "/api/client/device-requests" && req.method === "POST") {
      const x = await body(req);
      const id = x.id || `REQ-${randomInt(1000, 9999)}`;
      const userGmail =
        x.userEmail ||
        x.email ||
        (typeof x.user === "string" && x.user.includes("@") ? x.user : null);

      // Check if an active authorized device already exists for this fingerprint & company
      const existingActive = await pool.query(
        "SELECT * FROM devices WHERE company_id=$1 AND fingerprint=$2 AND status='active' ORDER BY created_at DESC LIMIT 1",
        [x.companyId, x.fingerprint],
      );
      if (existingActive.rowCount > 0) {
        return json(res, 200, {
          ok: true,
          alreadyApproved: true,
          id,
          status: "approved",
          deviceId: existingActive.rows[0].id,
          message:
            "This device has already been approved by an administrator. Session unlocked.",
        });
      }

      let insertRow = null;
      try {
        const result = await pool.query(
          "INSERT INTO device_requests(id,company_id,requested_by,device_name,fingerprint,app_version,replace_device_id,status,attempted_at,user_email,is_relogin) VALUES($1,$2,$3,$4,$5,$6,$7,'pending',now(),$8,$9) RETURNING *",
          [
            id,
            x.companyId,
            x.user,
            x.deviceName,
            x.fingerprint,
            x.appVersion,
            x.replaceDeviceId || null,
            userGmail,
            Boolean(x.isRelogin),
          ],
        );
        insertRow = result.rows[0];
      } catch {
        // Fallback for schemas before migration
        const fallback = await pool.query(
          "INSERT INTO device_requests(id,company_id,requested_by,device_name,fingerprint,app_version,replace_device_id,status,attempted_at) VALUES($1,$2,$3,$4,$5,$6,$7,'pending',now()) RETURNING *",
          [
            id,
            x.companyId,
            x.user,
            x.deviceName,
            x.fingerprint,
            x.appVersion,
            x.replaceDeviceId || null,
          ],
        );
        insertRow = fallback.rows[0];
      }

      await audit(
        pool,
        x.companyId,
        x.isRelogin ? "device_relogin_request.created" : "device_request.created",
        "device_request",
        id,
        {
          fingerprint: x.fingerprint,
          isRelogin: Boolean(x.isRelogin),
          userEmail: userGmail,
        },
      );

      // Security audit copy dispatched to user's Gmail
      let emailResult = { sent: false, reason: "No email provided" };
      if (userGmail) {
        emailResult = await sendReloginRequestSecurityEmail(userGmail, {
          id,
          companyId: x.companyId,
          companyName: x.companyName,
          requestedBy: x.user,
          deviceName: x.deviceName,
          fingerprint: x.fingerprint,
        }).catch((err) => ({ sent: false, error: err.message }));
      }

      return json(res, 201, {
        ...insertRow,
        userEmail: userGmail,
        isRelogin: Boolean(x.isRelogin),
        securityCopyDispatched: Boolean(emailResult?.sent),
        securityCopySentTo: userGmail,
      });
    }
    const companyStatus = req.url?.match(
      /^\/api\/admin\/companies\/([^/]+)\/status$/,
    );
    if (companyStatus && req.method === "PATCH") {
      const x = await body(req);
      const result = await pool.query(
        "UPDATE companies SET status=$1,updated_at=now() WHERE id=$2 RETURNING *",
        [x.status, companyStatus[1]],
      );
      await audit(
        pool,
        companyStatus[1],
        "company.status_changed",
        "company",
        companyStatus[1],
        { status: x.status },
      );
      return json(res, 200, result.rows[0]);
    }
    const companyCreds = req.url?.match(
      /^\/api\/admin\/companies\/([^/]+)\/credentials$/,
    );
    if (companyCreds && req.method === "PATCH") {
      const x = await body(req);
      const companyId = companyCreds[1];
      let result;
      if (x.installationKey) {
        result = await pool.query(
          "UPDATE companies SET super_admin_user=$1, super_admin_password=$2, installation_key=$3, updated_at=now() WHERE id=$4 RETURNING *",
          [
            x.superAdminUser,
            x.superAdminPassword,
            x.installationKey.trim().toUpperCase(),
            companyId,
          ],
        );
      } else {
        result = await pool.query(
          "UPDATE companies SET super_admin_user=$1, super_admin_password=$2, updated_at=now() WHERE id=$3 RETURNING *",
          [x.superAdminUser, x.superAdminPassword, companyId],
        );
      }
      await audit(
        pool,
        companyId,
        "company.credentials_updated",
        "company",
        companyId,
        {
          superAdminUser: x.superAdminUser,
          installationKey: x.installationKey || null,
        },
      );
      return json(res, 200, result.rows[0]);
    }
    const companyUpdate = req.url?.match(/^\/api\/(admin|client)\/companies\/([^/]+)(\/profile)?$/);
    if (companyUpdate && (req.method === "PATCH" || req.method === "PUT")) {
      const companyId = companyUpdate[2];
      const x = await body(req);
      const fields = [];
      const values = [];
      let i = 1;
      if (x.name !== undefined) { fields.push(`name=$${i++}`); values.push(x.name); }
      if (x.email !== undefined) { fields.push(`email=$${i++}`); values.push(x.email); }
      if (x.address !== undefined) { fields.push(`address=$${i++}`); values.push(x.address); }
      if (x.contactNo !== undefined || x.phone !== undefined) {
        const ph = x.contactNo || x.phone || null;
        fields.push(`contact_no=$${i++}`);
        values.push(ph);
        fields.push(`phone=$${i++}`);
        values.push(ph);
      }
      if (x.logo !== undefined) { fields.push(`logo=$${i++}`); values.push(x.logo || null); }
      if (x.status !== undefined) { fields.push(`status=$${i++}`); values.push(x.status); }
      if (x.plan !== undefined) { fields.push(`plan=$${i++}`); values.push(x.plan); }
      if (x.seatsAllowed !== undefined) { fields.push(`seats_allowed=$${i++}`); values.push(Math.max(1, Number(x.seatsAllowed))); }
      if (x.devicesAllowed !== undefined) { fields.push(`devices_allowed=$${i++}`); values.push(Math.max(1, Number(x.devicesAllowed))); }
      if (x.superAdminUser !== undefined) { fields.push(`super_admin_user=$${i++}`); values.push(x.superAdminUser); }
      if (x.superAdminPassword !== undefined && String(x.superAdminPassword).trim()) {
        fields.push(`super_admin_password=$${i++}`);
        values.push(String(x.superAdminPassword).trim());
      }
      if (x.installationKey !== undefined && String(x.installationKey).trim()) {
        fields.push(`installation_key=$${i++}`);
        values.push(String(x.installationKey).trim().toUpperCase());
      }
      if (
        x.offlineLeaseOverride !== undefined ||
        x.offline_lease_override !== undefined
      ) {
        const val =
          x.offlineLeaseOverride !== undefined
            ? x.offlineLeaseOverride
            : x.offline_lease_override;
        fields.push(`offline_lease_override=$${i++}`);
        values.push(val && String(val).trim() ? String(val).trim() : null);
      }
      if (!fields.length) {
        return json(res, 400, { error: "No fields provided to update" });
      }
      fields.push(`updated_at=now()`);
      values.push(companyId);
      const result = await pool.query(
        `UPDATE companies SET ${fields.join(", ")} WHERE id=$${i} RETURNING *`,
        values,
      );
      if (!result.rowCount) {
        return json(res, 404, { error: "Company not found" });
      }
      const updatedComp = result.rows[0];
      if (
        x.offlineLeaseOverride !== undefined ||
        x.offline_lease_override !== undefined ||
        x.plan !== undefined
      ) {
        const newInterval = getPlanOfflineInterval(
          updatedComp.plan,
          updatedComp.devices_allowed,
          updatedComp.offline_lease_override,
        );
        const newHours = getPlanOfflineHours(
          updatedComp.plan,
          updatedComp.devices_allowed,
          updatedComp.offline_lease_override,
        );
        await pool.query(
          `UPDATE devices SET lease_expires_at = last_verified_at + interval '${newInterval}' WHERE company_id=$1 AND status='active'`,
          [companyId],
        );
        await pool.query(
          "UPDATE licenses SET offline_lease_hours=$1 WHERE company_id=$2 AND status='active'",
          [newHours, companyId],
        );
      }
      await audit(pool, companyId, "company.updated", "company", companyId, {
        name: x.name,
        seatsAllowed: x.seatsAllowed,
        devicesAllowed: x.devicesAllowed,
        plan: x.plan,
      });
      return json(res, 200, result.rows[0]);
    }
    const companyTemplatesMatch = req.url?.match(/^\/api\/admin\/companies\/([^/]+)\/templates$/);
    if (companyTemplatesMatch && (req.method === "PUT" || req.method === "POST" || req.method === "PATCH")) {
      const companyId = companyTemplatesMatch[1];
      const x = await body(req);
      const templateIds = Array.isArray(x.templateIds) ? x.templateIds : [];
      await pool.query("DELETE FROM company_templates WHERE company_id=$1", [companyId]);

      const resolvedIds = new Set();
      const resolvedNames = [];

      for (const tid of templateIds) {
        if (!tid) continue;
        const match = await pool.query(
          `SELECT id, name FROM invoice_templates 
           WHERE id::text = $1 
              OR name ILIKE $1 
              OR definition->>'id' = $1 
              OR LOWER(REPLACE(REPLACE(name, ' & ', '_'), ' ', '_')) = LOWER(REPLACE($1, ' ', '_'))
           LIMIT 1`,
          [String(tid).trim()],
        );
        if (match.rows[0]) {
          resolvedIds.add(match.rows[0].id);
          if (!resolvedNames.includes(match.rows[0].name)) {
            resolvedNames.push(match.rows[0].name);
          }
        }
      }

      // Always ensure Default Invoice is assigned to company
      const defaultMatch = await pool.query(
        `SELECT id, name FROM invoice_templates 
         WHERE name ILIKE 'Default Invoice' 
            OR id::text = 'default_invoice' 
            OR definition->>'id' = 'default_invoice' 
         LIMIT 1`
      );
      if (defaultMatch.rows[0]) {
        resolvedIds.add(defaultMatch.rows[0].id);
        if (!resolvedNames.includes(defaultMatch.rows[0].name)) {
          resolvedNames.unshift(defaultMatch.rows[0].name);
        }
      }

      for (const tId of resolvedIds) {
        await pool.query(
          "INSERT INTO company_templates(company_id, template_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
          [companyId, tId],
        );
      }

      await audit(pool, companyId, "company.templates_assigned", "company", companyId, {
        templateCount: resolvedIds.size,
        templateIds: resolvedNames,
      });
      return json(res, 200, { ok: true, companyId, templateIds: resolvedNames });
    }
    const companyDelete = req.url?.match(/^\/api\/admin\/companies\/([^/]+)$/);
    if (companyDelete && req.method === "DELETE") {
      const companyId = companyDelete[1];
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const check = await client.query(
          "SELECT * FROM companies WHERE id=$1",
          [companyId],
        );
        if (!check.rowCount) {
          await client.query("ROLLBACK");
          return json(res, 404, { error: "Company not found" });
        }
        const comp = check.rows[0];

        await audit(
          client,
          companyId,
          "company.deleted",
          "company",
          companyId,
          { name: comp.name, code: comp.code, email: comp.email },
        );

        await client.query("DELETE FROM activation_otps WHERE company_id=$1", [
          companyId,
        ]);
        await client.query("DELETE FROM security_events WHERE company_id=$1", [
          companyId,
        ]);
        await client.query(
          "DELETE FROM company_templates WHERE company_id=$1",
          [companyId],
        );
        await client.query("DELETE FROM device_requests WHERE company_id=$1", [
          companyId,
        ]);
        await client.query("DELETE FROM devices WHERE company_id=$1", [
          companyId,
        ]);
        await client.query("DELETE FROM licenses WHERE company_id=$1", [
          companyId,
        ]);
        await client.query("DELETE FROM companies WHERE id=$1", [companyId]);

        await client.query("COMMIT");
        return json(res, 200, { ok: true, id: companyId, name: comp.name });
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Delete company error:", e);
        return json(res, 500, { error: e.message });
      } finally {
        client.release();
      }
    }
    const decision = req.url?.match(
      /^\/api\/admin\/device-requests\/([^/]+)\/decision$/,
    );
    if (decision && req.method === "POST") {
      const x = await body(req);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const q = await client.query(
          "SELECT * FROM device_requests WHERE id=$1 FOR UPDATE",
          [decision[1]],
        );
        if (!q.rowCount) throw new Error("Request not found");
        const r = q.rows[0];
        if (x.approve) {
          const company = await client.query(
            "SELECT devices_allowed, plan, offline_lease_override FROM companies WHERE id=$1 FOR UPDATE",
            [r.company_id],
          );
          if (r.replace_device_id)
            await client.query(
              "UPDATE devices SET status='replaced' WHERE id=$1 AND company_id=$2",
              [r.replace_device_id, r.company_id],
            );
          const count = await client.query(
            "SELECT count(*)::int n FROM devices WHERE company_id=$1 AND status='active'",
            [r.company_id],
          );
          if (count.rows[0].n >= company.rows[0].devices_allowed)
            throw new Error("Device limit exceeded");
          const derivedSerial =
            (r.fingerprint && r.fingerprint.startsWith("fp:win-")
              ? r.fingerprint.replace("fp:win-", "")
              : null) || null;
          const planInterval = getPlanOfflineInterval(
            company.rows[0]?.plan,
            company.rows[0]?.devices_allowed,
            company.rows[0]?.offline_lease_override,
          );
          await client.query(
            `INSERT INTO devices(id,company_id,assigned_user,name,os,fingerprint,serial_number,status,activated_at,last_verified_at,lease_expires_at) VALUES($1,$2,$3,$4,'Windows 11 Pro',$5,$6,'active',now(),now(),now()+interval '${planInterval}')`,
            [
              `d_${randomUUID()}`,
              r.company_id,
              r.requested_by,
              r.device_name,
              r.fingerprint,
              derivedSerial,
            ],
          );
          await client.query(
            "UPDATE licenses SET token_version=token_version+1,updated_at=now() WHERE company_id=$1",
            [r.company_id],
          );
        }
        await client.query(
          "UPDATE device_requests SET status=$1,decided_at=now(),decided_by='software-owner' WHERE id=$2",
          [x.approve ? "approved" : "rejected", decision[1]],
        );
        await audit(
          client,
          r.company_id,
          x.approve ? "device_request.approved" : "device_request.rejected",
          "device_request",
          decision[1],
          { replaceDeviceId: r.replace_device_id },
        );
        await client.query("COMMIT");
        return json(res, 200, { ok: true });
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    }
    if (req.url === "/api/admin/otp" && req.method === "POST") {
      const x = await body(req);
      const code = String(randomInt(100000, 1000000));
      const hash = createHash("sha256").update(code).digest("hex");
      await pool.query(
        "INSERT INTO activation_otps(company_id,code_hash,expires_at,created_by) VALUES($1,$2,now()+interval '10 minutes','software-owner')",
        [x.companyId, hash],
      );
      await audit(pool, x.companyId, "otp.created", "activation_otp", null, {});
      return json(res, 201, { code, expiresInSeconds: 600 });
    }
    const reqStatus = req.url?.match(
      /^\/api\/client\/device-requests\/([^/]+)\/status$/,
    );
    if (reqStatus && req.method === "GET") {
      const result = await pool.query(
        `SELECT r.*, c.name AS company_name, d.id AS approved_device_id,
                d.lease_expires_at, d.last_verified_at
           FROM device_requests r
           JOIN companies c ON c.id=r.company_id
           LEFT JOIN devices d ON d.company_id=r.company_id AND d.fingerprint=r.fingerprint AND d.status='active'
          WHERE r.id=$1`,
        [reqStatus[1]],
      );
      if (!result.rowCount)
        return json(res, 404, { error: "Device request not found" });
      return json(res, 200, result.rows[0]);
    }
    if (req.url === "/api/client/activate-otp" && req.method === "POST") {
      const x = await body(req);
      const hash = createHash("sha256")
        .update(String(x.code).trim())
        .digest("hex");
      const otpRes = await pool.query(
        "SELECT * FROM activation_otps WHERE company_id=$1 AND code_hash=$2 AND used_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
        [x.companyId, hash],
      );
      if (!otpRes.rowCount) {
        return json(res, 400, {
          error: "Invalid or expired one-time activation code",
        });
      }
      const compRes = await pool.query(
        "SELECT plan, devices_allowed, offline_lease_override FROM companies WHERE id=$1",
        [x.companyId],
      );
      const planInterval = getPlanOfflineInterval(
        compRes.rows[0]?.plan,
        compRes.rows[0]?.devices_allowed,
        compRes.rows[0]?.offline_lease_override,
      );
      const deviceId = `d_${randomUUID()}`;
      await pool.query(
        `INSERT INTO devices(id,company_id,assigned_user,name,os,fingerprint,status,activated_at,last_verified_at,lease_expires_at) VALUES($1,$2,$3,$4,'Windows 11 Pro',$5,'active',now(),now(),now()+interval '${planInterval}')`,
        [
          deviceId,
          x.companyId,
          x.user || "Desktop Operator",
          x.deviceName || "Windows PC",
          x.fingerprint || "fp:desktop",
        ],
      );
      await pool.query("UPDATE activation_otps SET used_at=now() WHERE id=$1", [
        otpRes.rows[0].id,
      ]);
      await audit(
        pool,
        x.companyId,
        "device.activated_by_otp",
        "device",
        deviceId,
        { code_id: otpRes.rows[0].id },
      );
      return json(res, 200, { ok: true, deviceId, companyId: x.companyId });
    }
    const clientDeviceDelete = req.url?.match(
      /^\/api\/client\/companies\/([^/]+)\/devices\/([^/]+)$/,
    );
    if (clientDeviceDelete && req.method === "DELETE") {
      const companyId = clientDeviceDelete[1];
      const deviceId = clientDeviceDelete[2];
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const check = await client.query(
          "SELECT * FROM devices WHERE (id=$1 OR fingerprint=$1) AND company_id=$2",
          [deviceId, companyId],
        );
        if (!check.rowCount) {
          await client.query("ROLLBACK");
          return json(res, 404, { error: "Device not found for this company" });
        }
        const dev = check.rows[0];

        await client.query(
          "UPDATE device_requests SET replace_device_id=NULL WHERE replace_device_id=$1",
          [dev.id],
        );

        await client.query(
          "DELETE FROM devices WHERE id=$1 AND company_id=$2",
          [dev.id, companyId],
        );

        await client.query(
          "UPDATE licenses SET token_version=token_version+1, updated_at=now() WHERE company_id=$1",
          [companyId],
        );

        await audit(
          client,
          companyId,
          "client.device_deleted",
          "device",
          dev.id,
          {
            name: dev.name,
            user: dev.assigned_user,
            fingerprint: dev.fingerprint,
            serialNumber: dev.serial_number,
          },
        );

        await client.query("COMMIT");
        return json(res, 200, { ok: true, deviceId: dev.id, name: dev.name });
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Delete client device error:", e);
        return json(res, 500, { error: e.message });
      } finally {
        client.release();
      }
    }
    if (req.url === "/api/client/device/disconnect" && req.method === "POST") {
      const x = await body(req);
      const companyId = String(x.companyId || "").trim();
      const deviceId = String(x.deviceId || "").trim();
      const fingerprint = String(x.fingerprint || "").trim();

      if (!companyId || (!deviceId && !fingerprint)) {
        return json(res, 400, {
          error: "companyId and device identifier (deviceId or fingerprint) are required",
        });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const check = await client.query(
          "SELECT * FROM devices WHERE company_id=$1 AND (id=$2 OR fingerprint=$3)",
          [companyId, deviceId || "none", fingerprint || "none"],
        );

        if (!check.rowCount) {
          await client.query("ROLLBACK");
          return json(res, 200, {
            ok: true,
            message: "Device was already unlinked or not found.",
          });
        }

        const dev = check.rows[0];

        await client.query(
          "UPDATE device_requests SET replace_device_id=NULL WHERE replace_device_id=$1",
          [dev.id],
        );

        await client.query(
          "DELETE FROM devices WHERE id=$1 AND company_id=$2",
          [dev.id, companyId],
        );

        await client.query(
          "UPDATE licenses SET token_version=token_version+1, updated_at=now() WHERE company_id=$1",
          [companyId],
        );

        await audit(
          client,
          companyId,
          "client.device_disconnected",
          "device",
          dev.id,
          {
            name: dev.name,
            user: dev.assigned_user,
            fingerprint: dev.fingerprint,
            serialNumber: dev.serial_number,
            unlinkedBy: "client_workstation",
          },
        );

        await client.query("COMMIT");
        return json(res, 200, { ok: true, deviceId: dev.id, name: dev.name });
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Disconnect device error:", e);
        return json(res, 500, { error: e.message });
      } finally {
        client.release();
      }
    }
    const clientDeviceAdd = req.url?.match(
      /^\/api\/client\/companies\/([^/]+)\/devices$/,
    );
    if (clientDeviceAdd && req.method === "POST") {
      const companyId = clientDeviceAdd[1];
      const x = await body(req);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const compRes = await client.query(
          "SELECT * FROM companies WHERE id=$1 FOR UPDATE",
          [companyId],
        );
        if (!compRes.rowCount) {
          await client.query("ROLLBACK");
          return json(res, 404, { error: "Company not found" });
        }
        const comp = compRes.rows[0];

        const countRes = await client.query(
          "SELECT count(*)::int as count FROM devices WHERE company_id=$1 AND status='active'",
          [companyId],
        );
        const activeCount = countRes.rows[0].count;
        if (activeCount >= comp.devices_allowed) {
          await client.query("ROLLBACK");
          return json(res, 400, {
            error: `Device limit reached (${comp.devices_allowed} devices allowed on ${comp.plan}). Delete an existing device or upgrade plan.`,
          });
        }

        const deviceId = x.id || `d_${randomUUID()}`;
        const name = (x.name || "Office Desktop").trim();
        const user = (
          x.assignedUser ||
          x.user ||
          comp.super_admin_user ||
          "Operator"
        ).trim();
        const os = (x.os || "Windows 11 Pro 64-bit").trim();
        const serialNumber = (
          x.serialNumber || `SN-WIN-${randomUUID().slice(0, 8).toUpperCase()}`
        ).trim();
        const fingerprint = (
          x.fingerprint || `fp:win-${randomUUID().slice(0, 10).toUpperCase()}`
        ).trim();

        const planInterval = getPlanOfflineInterval(
          comp.plan,
          comp.devices_allowed,
          comp.offline_lease_override,
        );
        const result = await client.query(
          `INSERT INTO devices(id, company_id, assigned_user, name, os, fingerprint, serial_number, status, activated_at, last_verified_at, lease_expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,'active',now(),now(),now()+interval '${planInterval}') RETURNING *`,
          [deviceId, companyId, user, name, os, fingerprint, serialNumber],
        );

        await audit(
          client,
          companyId,
          "client.device_added",
          "device",
          deviceId,
          { name, user, fingerprint, serialNumber },
        );

        await client.query("COMMIT");
        return json(res, 201, { ok: true, device: result.rows[0] });
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Add client device error:", e);
        return json(res, 500, { error: e.message });
      } finally {
        client.release();
      }
    }
    if (
      req.url === "/api/client/install-request-otp" &&
      req.method === "POST"
    ) {
      const x = await body(req);
      const emailOrUser = (x.emailOrUser || x.email || "").trim().toLowerCase();
      const password = (x.password || "").trim();
      if (!emailOrUser || !password) {
        return json(res, 400, {
          error: "Super Admin email/username and password are required",
        });
      }
      const compRes = await pool.query(
        "SELECT * FROM companies WHERE (lower(super_admin_user)=$1 OR lower(email)=$1) AND super_admin_password=$2",
        [emailOrUser, password],
      );
      if (!compRes.rowCount) {
        return json(res, 401, {
          error:
            "Invalid Super Admin credentials. Please check your username and password.",
        });
      }
      const company = compRes.rows[0];

      if (company.status !== "active") {
        return json(res, 403, {
          error: `Company account is ${company.status}. Installation is not allowed.`,
        });
      }
      const licenseRes = await pool.query(
        "SELECT * FROM licenses WHERE company_id=$1 ORDER BY created_at DESC LIMIT 1",
        [company.id],
      );
      let companyLicense = licenseRes.rows[0];
      if (!companyLicense && company.status === "active") {
        const licId = `lic_${randomUUID()}`;
        const ins = await pool.query(
          "INSERT INTO licenses(id,company_id,status,starts_at,expires_at,offline_lease_hours,token_version,reverify_epoch) VALUES($1,$2,'active',now(),now()+interval '1 year',72,1,1) RETURNING *",
          [licId, company.id],
        );
        companyLicense = ins.rows[0];
      }
      if (
        !companyLicense ||
        companyLicense.status !== "active" ||
        new Date(companyLicense.expires_at).getTime() <= Date.now()
      ) {
        return json(res, 403, {
          error:
            "An active, unexpired commercial license is required for installation.",
        });
      }
      if (company.status === "blocked") {
        return json(res, 403, {
          error: "This company account has been blocked by the Administrator.",
        });
      }
      const code = String(randomInt(100000, 1000000));
      const hash = createHash("sha256").update(code).digest("hex");
      await pool.query(
        "INSERT INTO activation_otps(company_id, code_hash, expires_at, created_by) VALUES($1, $2, now()+interval '15 minutes', 'install-wizard')",
        [company.id, hash],
      );
      await audit(
        pool,
        company.id,
        "otp.requested_installation",
        "activation_otp",
        null,
        { user: emailOrUser, recipient: company.email },
      );

      // Dispatch security email to company Gmail/Email
      const emailResult = await sendActivationOtpEmail(
        company.email,
        code,
        company.name,
      );

      const parts = company.email.split("@");
      const maskedUser =
        parts[0].length > 2
          ? `${parts[0].slice(0, 2)}****${parts[0].slice(-1)}`
          : parts[0];
      const maskedEmail = `${maskedUser}@${parts[1] || "gmail.com"}`;

      return json(res, 200, {
        ok: true,
        companyId: company.id,
        companyName: company.name,
        email: company.email,
        maskedEmail,
        emailSent: emailResult.sent,
        otpPreview: emailResult.sent ? undefined : code,
        expiresInSeconds: 900,
      });
    }
    if (req.url === "/api/client/install-verify" && req.method === "POST") {
      const x = await body(req);
      const emailOrUser = (x.emailOrUser || x.email || "").trim().toLowerCase();
      const password = (x.password || "").trim();
      const otpCode = String(x.otp || "").trim();
      const rawKey = String(x.installationKey || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      const deviceName = (x.deviceName || "Windows 11 Desktop").trim();
      const serialNumber = (
        x.serialNumber || `SN-WIN-${randomUUID().slice(0, 8).toUpperCase()}`
      ).trim();
      const fingerprint = (
        x.fingerprint || `fp:win-${randomUUID().slice(0, 8).toUpperCase()}`
      ).trim();
      const os = (x.os || "Windows 11 Pro 64-bit").trim();

      if (!emailOrUser || !password) {
        return json(res, 400, { error: "Super Admin credentials required" });
      }
      if (!otpCode) {
        return json(res, 400, { error: "6-digit OTP code is required" });
      }
      if (!rawKey || rawKey.length !== 10) {
        return json(res, 400, {
          error:
            "Installation Key must be exactly 10 characters (format: XXX-XXX-XXXX)",
        });
      }

      const compRes = await pool.query(
        "SELECT * FROM companies WHERE (lower(super_admin_user)=$1 OR lower(email)=$1) AND super_admin_password=$2",
        [emailOrUser, password],
      );
      if (!compRes.rowCount) {
        return json(res, 401, { error: "Invalid Super Admin credentials" });
      }
      const company = compRes.rows[0];

      // Verify 10-character installation key
      const compKeyRaw = String(company.installation_key || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      if (compKeyRaw !== rawKey) {
        return json(res, 400, {
          error:
            "Invalid Installation Key. Please check the 10-character key provided by Software Administrator.",
        });
      }

      // Verify OTP
      const hash = createHash("sha256").update(otpCode).digest("hex");
      const otpRes = await pool.query(
        "SELECT * FROM activation_otps WHERE company_id=$1 AND code_hash=$2 AND used_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
        [company.id, hash],
      );
      if (!otpRes.rowCount) {
        return json(res, 400, {
          error:
            "Invalid or expired OTP code. Please request a new verification code.",
        });
      }

      // Check or register device
      const existingDevice = await pool.query(
        "SELECT * FROM devices WHERE company_id=$1 AND (fingerprint=$2 OR serial_number=$3)",
        [company.id, fingerprint, serialNumber],
      );

      const planInterval = getPlanOfflineInterval(
        company.plan,
        company.devices_allowed,
        company.offline_lease_override,
      );
      let deviceId;
      if (existingDevice.rowCount > 0) {
        deviceId = existingDevice.rows[0].id;
        await pool.query(
          `UPDATE devices SET status='active', serial_number=$1, name=$2, os=$3, last_verified_at=now(), lease_expires_at=now()+interval '${planInterval}' WHERE id=$4`,
          [serialNumber, deviceName, os, deviceId],
        );
      } else {
        const countRes = await pool.query(
          "SELECT count(*)::int n FROM devices WHERE company_id=$1 AND status='active'",
          [company.id],
        );
        if (countRes.rows[0].n >= company.devices_allowed) {
          return json(res, 400, {
            error: `Device limit reached (${company.devices_allowed} allowed). Please ask Admin to upgrade license or revoke unused device.`,
          });
        }
        deviceId = `d_${randomUUID()}`;
        await pool.query(
          `INSERT INTO devices(id, company_id, assigned_user, name, os, fingerprint, serial_number, status, activated_at, last_verified_at, lease_expires_at) VALUES($1, $2, $3, $4, $5, $6, $7, 'active', now(), now(), now()+interval '${planInterval}')`,
          [
            deviceId,
            company.id,
            company.super_admin_user || company.email,
            deviceName,
            os,
            fingerprint,
            serialNumber,
          ],
        );
      }

      // Query the updated device record
      const devRes = await pool.query(
        "SELECT * FROM devices WHERE id=$1",
        [deviceId],
      );
      const devRow = devRes.rows[0] || {};

      // Query company license
      const licenseRes = await pool.query(
        "SELECT * FROM licenses WHERE company_id=$1 ORDER BY created_at DESC LIMIT 1",
        [company.id],
      );
      let companyLicense = licenseRes.rows[0] || null;

      // Mark OTP as used only after device registration is completely successful
      await pool.query("UPDATE activation_otps SET used_at=now() WHERE id=$1", [
        otpRes.rows[0].id,
      ]);

      await audit(
        pool,
        company.id,
        "device.installed_and_activated",
        "device",
        deviceId,
        {
          serialNumber,
          fingerprint,
          deviceName,
          os,
          installationKey: company.installation_key,
        },
      );

      return json(res, 200, {
        ok: true,
        message:
          "Device hardware registered and desktop installed successfully!",
        company,
        device: {
          id: deviceId,
          name: devRow.name || deviceName,
          serialNumber: devRow.serial_number || serialNumber,
          fingerprint: devRow.fingerprint || fingerprint,
          os: devRow.os || os,
          status: devRow.status || "active",
          leaseExpiresAt: devRow.lease_expires_at,
          verifiedAt: devRow.last_verified_at,
        },
        license: companyLicense,
      });
    }
    if (req.url?.startsWith("/api/client/device/status") && req.method === "GET") {
      const url = new URL(req.url, "http://localhost");
      const companyId = (url.searchParams.get("companyId") || "").trim();
      const deviceId = (url.searchParams.get("deviceId") || "").trim();
      const fingerprint = (url.searchParams.get("fingerprint") || "").trim();

      if (!companyId || (!deviceId && !fingerprint)) {
        return json(res, 400, {
          error: "companyId and device identifier are required",
        });
      }

      const check = await pool.query(
        `SELECT d.id, d.status, d.name, c.status AS company_status, l.status AS license_status, l.expires_at AS license_expires_at
           FROM devices d
           JOIN companies c ON c.id=d.company_id
           LEFT JOIN licenses l ON l.company_id=c.id
          WHERE d.company_id=$1 AND (d.id=$2 OR d.fingerprint=$3)
          ORDER BY (CASE WHEN d.status='active' THEN 0 ELSE 1 END), (CASE WHEN d.id=$2 THEN 0 ELSE 1 END) LIMIT 1`,
        [companyId, deviceId || "none", fingerprint || "none"],
      );

      if (!check.rowCount) {
        return json(res, 200, {
          active: false,
          revoked: true,
          reason:
            "This device has been unlinked from the portal by an administrator.",
        });
      }

      const row = check.rows[0];
      if (row.company_status !== "active") {
        return json(res, 200, {
          active: false,
          revoked: true,
          reason: "Company subscription has been suspended.",
        });
      }

      if (row.status !== "active") {
        return json(res, 200, {
          active: false,
          revoked: true,
          reason: `Device access revoked (${row.status}).`,
        });
      }

      if (
        row.license_expires_at &&
        new Date(row.license_expires_at).getTime() <= Date.now()
      ) {
        return json(res, 200, {
          active: false,
          revoked: true,
          reason: "Commercial license has expired.",
        });
      }

      return json(res, 200, {
        active: true,
        revoked: false,
        deviceId: row.id,
      });
    }
    if (req.url === "/api/client/lease/refresh" && req.method === "POST") {
      const x = await body(req);
      const companyId = String(x.companyId || "").trim();
      const deviceId = String(x.deviceId || "").trim();
      const fingerprint = String(x.fingerprint || "").trim();
      const serialNumber = String(x.serialNumber || "").trim();
      const safeDeviceId = deviceId || "dev_client";
      const safeSerialNumber =
        serialNumber ||
        (fingerprint.startsWith("fp:win-")
          ? fingerprint.replace("fp:win-", "")
          : "SN-DEFAULT");
      if (!companyId || !fingerprint) {
        return json(res, 400, {
          error: "Complete device identity is required",
        });
      }

      const result = await pool.query(
        `SELECT d.*, c.status AS company_status, c.name AS company_name, c.plan AS company_plan, c.devices_allowed AS company_devices_allowed,
                c.offline_lease_override AS company_offline_lease_override,
                c.super_admin_user, c.email, l.status AS license_status,
                l.expires_at AS license_expires_at
           FROM devices d
           JOIN companies c ON c.id=d.company_id
           JOIN licenses l ON l.company_id=c.id
          WHERE (d.id=$1 OR (d.fingerprint=$3 AND d.status='active')) AND d.company_id=$2
          ORDER BY (CASE WHEN d.status='active' THEN 0 ELSE 1 END), (CASE WHEN d.id=$1 THEN 0 ELSE 1 END), d.created_at DESC LIMIT 1`,
        [safeDeviceId, companyId, fingerprint],
      );
      if (!result.rowCount) {
        return json(res, 404, { error: "This device is not registered" });
      }
      const record = result.rows[0];
      if (record.fingerprint !== fingerprint) {
        await pool.query(
          "INSERT INTO security_events(id,company_id,event_type,severity,device_name,fingerprint,details) VALUES($1,$2,'device_identity_mismatch','high',$3,$4,$5)",
          [
            `evt_${randomUUID()}`,
            companyId,
            record.name,
            fingerprint,
            JSON.stringify({
              reason:
                "Hardware identity did not match the authorized installation",
            }),
          ],
        );
        return json(res, 403, { error: "Device hardware identity mismatch" });
      }
      if (serialNumber && record.serial_number !== serialNumber) {
        await pool.query("UPDATE devices SET serial_number=$1 WHERE id=$2", [
          serialNumber,
          record.id,
        ]);
        record.serial_number = serialNumber;
      }
      if (!record.serial_number && serialNumber) {
        await pool.query("UPDATE devices SET serial_number=$1 WHERE id=$2", [
          serialNumber,
          record.id,
        ]);
        record.serial_number = serialNumber;
      }
      if (
        record.company_status !== "active" ||
        record.license_status !== "active"
      ) {
        return json(res, 403, { error: "Company or license is not active" });
      }
      if (record.status !== "active") {
        return json(res, 403, { error: `Device is ${record.status}` });
      }
      if (new Date(record.license_expires_at).getTime() <= Date.now()) {
        return json(res, 403, { error: "Commercial license has expired" });
      }

      const planInterval = getPlanOfflineInterval(
        record.company_plan,
        record.company_devices_allowed,
        record.company_offline_lease_override,
      );
      const refreshed = await pool.query(
        `UPDATE devices SET last_verified_at=now(), lease_expires_at=now()+interval '${planInterval}' WHERE id=$1 RETURNING *`,
        [record.id],
      );
      await audit(
        pool,
        companyId,
        "device.lease_refreshed",
        "device",
        record.id,
        {},
      );
      return json(res, 200, {
        ok: true,
        deviceId: record.id,
        verifiedAt: refreshed.rows[0].last_verified_at,
        leaseExpiresAt: refreshed.rows[0].lease_expires_at,
        companyName: record.company_name,
        authenticatedUser: record.super_admin_user || record.email,
      });
    }
    if (req.url === "/api/client/app-version" && req.method === "GET") {
      return json(res, 200, {
        currentVersion: "1.4.2",
        latestVersion: "1.4.3",
        hasUpdate: true,
        hotUpdateAvailable: true,
        updateType: "differential",
        releaseDate: "2026-10-26",
        releaseNotes: "In-place differential patch: Updated offline lease synchronization, auto-unlock PIN security vault, and responsive theme engine.",
        filesChanged: [
          { path: "dist/assets/index.js", size: "418 KB", hash: "a8f3b9c1d2e4" },
          { path: "dist/assets/theme.css", size: "14 KB", hash: "9e2c4f1a0b8d" }
        ],
        totalPatchSize: "432 KB"
      });
    }
    if (req.url === "/api/client/app-hot-update" && req.method === "POST") {
      const payload = await body(req);
      const targetVersion = payload.targetVersion || "1.4.3";
      return json(res, 200, {
        ok: true,
        updatedVersion: targetVersion,
        message: "Differential update applied successfully! Changed assets replaced in-place without installer reinstallation.",
        filesUpdated: 2,
        bytesDownloaded: 442368,
        appliedAt: new Date().toISOString()
      });
    }
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, () =>
  console.log(`BillionDue API listening on http://localhost:${port}`),
);
