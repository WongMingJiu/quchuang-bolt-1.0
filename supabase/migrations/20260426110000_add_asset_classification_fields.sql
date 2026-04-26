ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS asset_category text NOT NULL DEFAULT 'creative',
  ADD COLUMN IF NOT EXISTS asset_media_type text NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS ip_asset_type text;

UPDATE generations
SET asset_category = 'creative'
WHERE asset_category IS NULL;

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_asset_category_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_asset_category_check
  CHECK (asset_category IN ('creative', 'reference', 'ip_teacher'));

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_asset_media_type_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_asset_media_type_check
  CHECK (asset_media_type IN ('image', 'video', 'audio'));

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_ip_asset_type_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_ip_asset_type_check
  CHECK (ip_asset_type IN ('persona', 'scene') OR ip_asset_type IS NULL);
