CREATE TABLE IF NOT EXISTS model_quota_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  enabled_models jsonb NOT NULL DEFAULT '[]',
  monthly_quota integer NOT NULL DEFAULT 0,
  used_quota integer NOT NULL DEFAULT 0,
  remaining_quota integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'enabled',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE model_quota_assignments
  DROP CONSTRAINT IF EXISTS model_quota_assignments_subject_type_check;

ALTER TABLE model_quota_assignments
  ADD CONSTRAINT model_quota_assignments_subject_type_check
  CHECK (subject_type IN ('user', 'role'));

ALTER TABLE model_quota_assignments
  DROP CONSTRAINT IF EXISTS model_quota_assignments_status_check;

ALTER TABLE model_quota_assignments
  ADD CONSTRAINT model_quota_assignments_status_check
  CHECK (status IN ('enabled', 'disabled'));

CREATE INDEX IF NOT EXISTS model_quota_assignments_subject_type_idx
ON model_quota_assignments(subject_type);

CREATE INDEX IF NOT EXISTS model_quota_assignments_subject_id_idx
ON model_quota_assignments(subject_id);
