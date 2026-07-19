CREATE TABLE IF NOT EXISTS agent_runs (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  caller_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  reply_preview TEXT,
  trace JSONB NOT NULL DEFAULT '[]',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  usd_cost NUMERIC(10, 8) NOT NULL DEFAULT 0,
  model TEXT NOT NULL,
  blocked_input BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_org_id ON agent_runs (org_id);
