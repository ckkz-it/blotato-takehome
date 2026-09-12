CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL,
  trigger_keyword TEXT NOT NULL,
  final_link TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS processed_events (
  platform TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (platform, external_event_id)
);

-- for demo script
INSERT INTO automations (id, version, trigger_keyword, final_link)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  1,
  'pricing',
  'https://example.com'
)
ON CONFLICT (id) DO NOTHING;
