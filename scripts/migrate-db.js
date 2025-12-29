const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'doctor.db');
const db = new Database(dbPath);

console.log('Dropping existing tables...');

try {
  db.exec(`
    DROP TABLE IF EXISTS investors;
    DROP TABLE IF EXISTS financial_data;
    DROP TABLE IF EXISTS valuations;
  `);
  console.log('Tables dropped successfully');

  console.log('Recreating tables with new schema...');
  db.exec(`
    -- 評価レコードテーブル
    CREATE TABLE IF NOT EXISTS valuations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 財務データテーブル
    CREATE TABLE IF NOT EXISTS financial_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valuation_id TEXT NOT NULL,
      employees TEXT,
      total_assets TEXT,
      sales TEXT,
      current_period_net_asset REAL,
      previous_period_net_asset REAL,
      net_asset_tax_value REAL,
      current_period_profit REAL,
      previous_period_profit REAL,
      previous_previous_period_profit REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (valuation_id) REFERENCES valuations(id) ON DELETE CASCADE
    );

    -- 投資家テーブル
    CREATE TABLE IF NOT EXISTS investors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valuation_id TEXT NOT NULL,
      investor_name TEXT NOT NULL,
      shares_held INTEGER,
      shareholding_ratio REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (valuation_id) REFERENCES valuations(id) ON DELETE CASCADE
    );

    -- インデックス作成
    CREATE INDEX IF NOT EXISTS idx_valuations_company_id ON valuations(company_id);
    CREATE INDEX IF NOT EXISTS idx_valuations_user_id ON valuations(user_id);
    CREATE INDEX IF NOT EXISTS idx_financial_data_valuation_id ON financial_data(valuation_id);
    CREATE INDEX IF NOT EXISTS idx_investors_valuation_id ON investors(valuation_id);
  `);

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}
