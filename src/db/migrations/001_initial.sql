CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL,
  -- store definitions as JSONB so the product model can evolve without
  -- requiring a relational schema change for every new type
  definition JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS processed_events (
  platform TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (platform, external_event_id)
);

-- Used by the one-command demo.
INSERT INTO automations (id, version, definition)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  1,
  '{
    "trigger": {
      "type": "comment_created",
      "conditions": [
        { "field": "text", "operator": "equals", "value": "pricing" }
      ]
    },
    "steps": [
      { "type": "reply_to_comment", "text": "Sent you a DM!" },
      { "type": "send_dm", "text": "What''s your email address?" },
      { "type": "wait_for_message", "validator": "email" },
      { "type": "send_dm", "text": "Thanks! Here''s your link: https://example.com" }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
