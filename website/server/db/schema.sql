CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  email text NOT NULL,
  address text,
  status text NOT NULL CHECK (status IN ('active','suspended','blocked')),
  plan text NOT NULL,
  seats_used integer NOT NULL DEFAULT 0,
  seats_allowed integer NOT NULL CHECK (seats_allowed > 0),
  devices_allowed integer NOT NULL CHECK (devices_allowed > 0),
  super_admin_user text,
  super_admin_password text,
  installation_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE companies ADD COLUMN IF NOT EXISTS super_admin_user text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS super_admin_password text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS installation_key text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo text;

CREATE TABLE IF NOT EXISTS licenses (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active','suspended','blocked','expired','revoked')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  offline_lease_hours integer NOT NULL DEFAULT 72 CHECK (offline_lease_hours BETWEEN 1 AND 72),
  token_version integer NOT NULL DEFAULT 1,
  reverify_epoch integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_user text NOT NULL,
  name text NOT NULL,
  os text NOT NULL,
  fingerprint text NOT NULL,
  serial_number text,
  status text NOT NULL CHECK (status IN ('active','blocked','expired','replaced')),
  activated_at timestamptz,
  last_verified_at timestamptz,
  lease_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, fingerprint)
);

ALTER TABLE devices ADD COLUMN IF NOT EXISTS serial_number text;

CREATE TABLE IF NOT EXISTS device_requests (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requested_by text NOT NULL,
  device_name text NOT NULL,
  fingerprint text NOT NULL,
  app_version text NOT NULL,
  replace_device_id text REFERENCES devices(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by text,
  user_email text,
  is_relogin boolean DEFAULT false
);

ALTER TABLE device_requests ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE device_requests ADD COLUMN IF NOT EXISTS is_relogin boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_templates (
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(company_id, template_id)
);

CREATE TABLE IF NOT EXISTS activation_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_events (
  id text PRIMARY KEY,
  company_id text REFERENCES companies(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  device_name text,
  fingerprint text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  company_id text REFERENCES companies(id) ON DELETE SET NULL,
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devices_company ON devices(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_company_status ON device_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_security_company_created ON security_events(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_company_created ON audit_log(company_id, created_at DESC);
