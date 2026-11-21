-- Run once on databases created before the CRM fields existed:
--   npx wrangler d1 execute salepunch --remote --config salepunch/wrangler.toml --file salepunch/migrations/0002_crm_lead_fields.sql
-- (New installs get these columns from schema.sql and must skip this file.)
ALTER TABLE leads ADD COLUMN company TEXT;
ALTER TABLE leads ADD COLUMN city TEXT;
ALTER TABLE leads ADD COLUMN deal_value INTEGER;
ALTER TABLE leads ADD COLUMN expected_close TEXT;
ALTER TABLE leads ADD COLUMN tags TEXT;
