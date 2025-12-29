/**
 * データベースのタイムスタンプをローカル時刻に変更するマイグレーションスクリプト
 *
 * 実行方法:
 * 1. 開発サーバーを停止
 * 2. node migrate-timestamps.js
 * 3. 開発サーバーを再起動
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'doctor.db');
const db = new Database(dbPath);

console.log('データベースマイグレーション開始...');

try {
  // トランザクション開始
  db.exec('BEGIN TRANSACTION');

  // 既存のテーブルを削除
  console.log('既存のテーブルを削除中...');
  db.exec(`
    DROP TABLE IF EXISTS investors;
    DROP TABLE IF EXISTS financial_data;
    DROP TABLE IF EXISTS valuations;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS companies;
    DROP TABLE IF EXISTS similar_industry_data;
  `);

  // 新しいスキーマでテーブルを作成
  console.log('新しいスキーマでテーブルを作成中...');
  db.exec(`
    -- 会社マスタテーブル
    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    -- 担当者マスタテーブル
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    -- 評価レコードテーブル
    CREATE TABLE valuations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 財務データテーブル
    CREATE TABLE financial_data (
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
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (valuation_id) REFERENCES valuations(id) ON DELETE CASCADE
    );

    -- 投資家テーブル
    CREATE TABLE investors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valuation_id TEXT NOT NULL,
      investor_name TEXT NOT NULL,
      shares_held INTEGER,
      shareholding_ratio REAL,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (valuation_id) REFERENCES valuations(id) ON DELETE CASCADE
    );

    -- 類似業種データマスタテーブル
    CREATE TABLE similar_industry_data (
      id TEXT PRIMARY KEY,
      fiscal_year TEXT NOT NULL UNIQUE,
      profit_per_share REAL NOT NULL DEFAULT 51,
      net_asset_per_share REAL NOT NULL DEFAULT 395,
      average_stock_price REAL NOT NULL DEFAULT 532,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    -- インデックス作成
    CREATE INDEX idx_valuations_company_id ON valuations(company_id);
    CREATE INDEX idx_valuations_user_id ON valuations(user_id);
    CREATE INDEX idx_financial_data_valuation_id ON financial_data(valuation_id);
    CREATE INDEX idx_investors_valuation_id ON investors(valuation_id);
    CREATE INDEX idx_similar_industry_fiscal_year ON similar_industry_data(fiscal_year);
  `);

  // デフォルトの類似業種データを挿入（令和6年度 = 2024年度）
  console.log('デフォルトデータを挿入中...');
  const defaultYear = '2024';
  const id = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  db.prepare(`
    INSERT INTO similar_industry_data (id, fiscal_year, profit_per_share, net_asset_per_share, average_stock_price)
    VALUES (?, ?, 51, 395, 532)
  `).run(id, defaultYear);

  // トランザクションコミット
  db.exec('COMMIT');

  console.log('✓ マイグレーション完了！');
  console.log('注意: 既存のデータはすべて削除されました。');

} catch (error) {
  db.exec('ROLLBACK');
  console.error('✗ マイグレーション失敗:', error);
  process.exit(1);
} finally {
  db.close();
}
