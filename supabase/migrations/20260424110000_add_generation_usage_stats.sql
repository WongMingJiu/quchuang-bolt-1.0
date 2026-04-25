ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS prompt_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_cost numeric(12,4) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS generations_total_tokens_idx
ON generations(total_tokens);

CREATE INDEX IF NOT EXISTS generations_estimated_cost_idx
ON generations(estimated_cost);
