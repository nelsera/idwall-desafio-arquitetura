CREATE TABLE IF NOT EXISTS recommendation_requests (
  request_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP NULL,
  result JSONB NULL
);