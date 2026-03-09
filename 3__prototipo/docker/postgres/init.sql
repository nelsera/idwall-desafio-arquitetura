CREATE TABLE IF NOT EXISTS recommendation_requests (
  request_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  initial_date DATE NOT NULL,
  final_date DATE NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP NULL,
  result JSONB NULL
);