CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create series master table
CREATE TABLE IF NOT EXISTS series (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title           text NOT NULL UNIQUE,
    slug            text NOT NULL UNIQUE,
    description     text,
    thumbnail_url   text,
    status          text NOT NULL DEFAULT 'active',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Add series_id & episode_number to videos (nullable for back-fill)
ALTER TABLE videos
    ADD COLUMN IF NOT EXISTS series_id uuid,
    ADD COLUMN IF NOT EXISTS episode_number integer;

-- 3. Create legacy series row
INSERT INTO series (title, slug, description, status)
VALUES ('Legacy Videos', 'legacy-videos', 'Videos migrated before series feature', 'archived')
ON CONFLICT (slug) DO NOTHING;

-- 4. Back-fill existing videos → legacy series
WITH legacy AS (
    SELECT id FROM series WHERE slug = 'legacy-videos' LIMIT 1
), numbered AS (
    SELECT v.id, row_number() OVER (ORDER BY created_at) AS rn
    FROM videos v
)
UPDATE videos AS v
SET series_id = (SELECT id FROM legacy),
    episode_number = n.rn
FROM numbered n
WHERE v.id = n.id
  AND v.series_id IS NULL;

-- 5. Make columns NOT NULL after back-fill
ALTER TABLE videos
    ALTER COLUMN series_id SET NOT NULL,
    ALTER COLUMN episode_number SET NOT NULL;

-- 6. Add FK & unique index
ALTER TABLE videos
    ADD CONSTRAINT fk_videos_series FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS videos_series_episode_idx ON videos(series_id, episode_number);
