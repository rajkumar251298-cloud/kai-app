-- Security audit log table (insert via service role from API; no client access).

CREATE TABLE IF NOT EXISTS security_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  details text,
  user_id text,
  timestamp timestamptz DEFAULT now(),
  user_agent text
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No user access to logs"
ON security_logs FOR ALL
USING (false);
