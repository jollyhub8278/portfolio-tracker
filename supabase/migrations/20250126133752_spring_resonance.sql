/*
  # Portfolio Tracker Schema

  1. New Tables
    - `portfolios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `stock_holdings`
      - `id` (uuid, primary key)
      - `portfolio_id` (uuid, references portfolios)
      - `symbol` (text)
      - `company_name` (text)
      - `quantity` (numeric)
      - `purchase_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock holdings table
CREATE TABLE IF NOT EXISTS stock_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  company_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  purchase_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_holdings ENABLE ROW LEVEL SECURITY;

-- Policies for portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios"
  ON portfolios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for stock holdings
CREATE POLICY "Users can view own stock holdings"
  ON stock_holdings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = stock_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stock holdings in own portfolio"
  ON stock_holdings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = stock_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own stock holdings"
  ON stock_holdings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = stock_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own stock holdings"
  ON stock_holdings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = stock_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_holdings_portfolio_id ON stock_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_stock_holdings_symbol ON stock_holdings(symbol);