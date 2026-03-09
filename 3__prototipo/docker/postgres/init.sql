CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (
  user_id,
  email,
  password,
  name
)
VALUES (
  '85cdae8a-7bfa-4915-b5b8-644c9235385e',
  'nelson@test.com',
  crypt('123456', gen_salt('bf')),
  'Nelson'
)
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  account_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  bank_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user_bank_accounts_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

INSERT INTO user_bank_accounts (
  account_id,
  user_id,
  bank_name,
  bank_user_id,
  status
)
VALUES (
  '7c6d4c72-7f2b-4bb8-8a2d-6c7c3a0d3d91',
  '85cdae8a-7bfa-4915-b5b8-644c9235385e',
  'bank-mock',
  '123',
  'active'
)
ON CONFLICT (account_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS recommendation_requests (
  request_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  initial_date DATE NOT NULL,
  final_date DATE NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP NULL,

  CONSTRAINT fk_recommendation_requests_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
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

CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_user_id
ON user_bank_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_requests_user_id
ON recommendation_requests(user_id);