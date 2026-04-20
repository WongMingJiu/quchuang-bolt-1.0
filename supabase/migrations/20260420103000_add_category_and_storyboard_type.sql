ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '太极',
  ADD COLUMN IF NOT EXISTS storyboard_type text NOT NULL DEFAULT '口播类';

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_category_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_category_check
  CHECK (category IN ('太极', '唱歌', '瑜伽', '普拉提', '手机摄影'));

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_storyboard_type_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_storyboard_type_check
  CHECK (storyboard_type IN ('口播类', '情景类', 'IP代练'));
