ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS generate_audio boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS watermark boolean NOT NULL DEFAULT false;

UPDATE generations
SET mode = 'omni-reference'
WHERE mode IN ('all-reference', 'video-to-video');

ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_mode_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_mode_check
  CHECK (
    mode IN (
      'omni-reference',
      'image-to-video-first-last',
      'image-to-video',
      'text-to-video'
    )
  );

CREATE INDEX IF NOT EXISTS generations_generate_audio_idx
ON generations(generate_audio);

CREATE INDEX IF NOT EXISTS generations_watermark_idx
ON generations(watermark);
