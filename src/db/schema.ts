export const schema = `
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  webhook_url TEXT NOT NULL,
  cooldown_minutes INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered_at TIMESTAMPTZ,
  last_evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_signals_active ON signals(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  webhook_status INT,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_signal ON notification_log(signal_id);
`;
