ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS usability_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS usability_reason_tags jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS usability_note text,
  ADD COLUMN IF NOT EXISTS usability_marked_at timestamptz;

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_usability_status_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_usability_status_check
  CHECK (usability_status IN ('pending', 'usable', 'optimizable', 'unusable'));

CREATE INDEX IF NOT EXISTS generations_usability_status_idx
ON generations(usability_status);
