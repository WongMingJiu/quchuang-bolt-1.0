ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_task_id text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE generations
SET mode = 'video-to-video'
WHERE mode = 'all-reference';

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_mode_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_mode_check
  CHECK (mode IN ('text-to-video', 'image-to-video', 'video-to-video'));

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_status_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_status_check
  CHECK (status IN ('pending', 'generating', 'completed', 'failed'));

CREATE INDEX IF NOT EXISTS generations_provider_task_id_idx ON generations(provider_task_id);
