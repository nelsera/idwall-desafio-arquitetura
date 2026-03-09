CREATE TABLE IF NOT EXISTS recommendation_requests (
  request_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  initial_date DATE NOT NULL,
  final_date DATE NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS recommendation_expenses (
  expense_id UUID PRIMARY KEY,
  request_id UUID NOT NULL,
  category TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_recommendation_request
    FOREIGN KEY (request_id)
    REFERENCES recommendation_requests(request_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recommendation_expenses_request_id
ON recommendation_expenses(request_id);