
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS product_detail_settings JSONB DEFAULT '{}'::jsonb;
