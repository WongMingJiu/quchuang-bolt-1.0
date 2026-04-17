
/*
  # AIGC Creation Platform - Initial Schema

  ## Overview
  Creates the core data tables for the AIGC material creation platform V1.

  ## New Tables

  ### generations
  Stores all AI generation tasks and their results (history).
  - `id` - Unique identifier
  - `prompt` - User's text prompt for generation
  - `mode` - Generation mode: 'text-to-video', 'image-to-video', 'all-reference'
  - `model` - AI model used: 'seedance2.0vip', 'seedance2.0fast', 'keling3.0'
  - `aspect_ratio` - Output video aspect ratio: '16:9', '9:16', '1:1', '4:3'
  - `duration` - Video duration in seconds (5-15)
  - `status` - Task status: 'generating', 'completed', 'failed'
  - `video_url` - URL to generated video
  - `thumbnail_url` - URL to video thumbnail/cover image
  - `is_favorited` - Whether user has favorited this result
  - `media_uploads` - JSON array of uploaded media URLs
  - `created_at` - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Anon role allowed for demo read/create/update access (no auth in V1)
  - Delete is intentionally not allowed for anon users in public demos
*/

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'text-to-video',
  model text NOT NULL DEFAULT 'keling3.0',
  aspect_ratio text NOT NULL DEFAULT '16:9',
  duration integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'generating',
  video_url text,
  thumbnail_url text,
  is_favorited boolean NOT NULL DEFAULT false,
  media_uploads jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select on generations"
  ON generations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert on generations"
  ON generations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on generations"
  ON generations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS generations_status_idx ON generations(status);
CREATE INDEX IF NOT EXISTS generations_is_favorited_idx ON generations(is_favorited);

INSERT INTO generations (prompt, mode, model, aspect_ratio, duration, status, thumbnail_url, is_favorited, created_at)
VALUES
  ('A futuristic city at night with glowing neon lights reflecting on wet streets, cinematic 4K', 'text-to-video', 'keling3.0', '16:9', 10, 'completed', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=600', true, now() - interval '2 hours'),
  ('Ocean waves crashing against rocky cliffs at golden hour, dramatic lighting', 'text-to-video', 'seedance2.0vip', '16:9', 8, 'completed', 'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&w=600', false, now() - interval '3 hours'),
  ('Abstract fluid art with vibrant colors swirling in slow motion', 'image-to-video', 'seedance2.0fast', '1:1', 5, 'completed', 'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=600', true, now() - interval '5 hours'),
  ('Aerial view of dense forest canopy during autumn, leaves turning gold and red', 'text-to-video', 'keling3.0', '16:9', 12, 'completed', 'https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=600', false, now() - interval '1 day'),
  ('Close-up of raindrops falling on a mirror surface, ultra slow motion', 'all-reference', 'seedance2.0vip', '9:16', 6, 'completed', 'https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?auto=compress&cs=tinysrgb&w=600', false, now() - interval '1 day'),
  ('Mountain peaks emerging through morning mist, time-lapse sunrise', 'text-to-video', 'keling3.0', '16:9', 15, 'completed', 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=600', true, now() - interval '2 days'),
  ('Cyberpunk character walking through a holographic marketplace', 'image-to-video', 'seedance2.0vip', '9:16', 8, 'failed', 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=600', false, now() - interval '2 days'),
  ('Microscopic view of crystals forming in slow motion, scientific beauty', 'text-to-video', 'seedance2.0fast', '1:1', 10, 'completed', 'https://images.pexels.com/photos/3571551/pexels-photo-3571551.jpeg?auto=compress&cs=tinysrgb&w=600', true, now() - interval '3 days');
