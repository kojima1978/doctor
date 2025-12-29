import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'doctor.db');

interface OldValuation {
  id: string;
  fiscal_year: string;
  company_name: string;
  person_in_charge: string;
  employees: string;
  total_assets: string;
  sales: string;
  current_period_net_asset: number;
  previous_period_net_asset: number;
  net_asset_tax_value: number;
  current_period_profit: number;
  previous_period_profit: number;
  previous_previous_period_profit: number;
  investors: string;
  created_at: string;
  updated_at: string;
}

interface OldValuationWithUserId {
  id: string;
  fiscal_year: string;
  company_name?: string;
  company_id?: string;
  person_in_charge?: string;
  user_id?: string;
  employees: string;
  total_assets: string;
  sales: string;
  current_period_net_asset: number;
  previous_period_net_asset: number;
  net_asset_tax_value: number;
  current_period_profit: number;
  previous_period_profit: number;
  previous_previous_period_profit: number;
  investors: string;
  created_at: string;
  updated_at: string;
}

// 担当者テーブル追加の移行処理
function migrateToUsersTable(db: Database.Database) {
  console.log('担当者データを取得中...');

  // valuations から person_in_charge カラムのデータを取得
  const valuations = db.prepare(`
    SELECT v.id, v.person_in_charge, v.company_id, v.fiscal_year, v.created_at, v.updated_at
    FROM valuations v
  `).all() as Array<{
    id: string;
    person_in_charge: string;
    company_id: string;
    fiscal_year: string;
    created_at: string;
    updated_at: string;
  }>;

  console.log(`${valuations.length}件の評価データを取得しました。`);

  // バックアップ作成
  console.log('旧テーブルをバックアップ中...');
  db.exec(`
    DROP TABLE IF EXISTS valuations_backup_users;
    CREATE TABLE valuations_backup_users AS SELECT * FROM valuations;
  `);

  // users テーブルを作成
  console.log('usersテーブルを作成中...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 一意の担当者名を抽出してusersテーブルに挿入
  const userMap = new Map<string, string>();

  const transaction = db.transaction(() => {
    for (const valuation of valuations) {
      const personName = valuation.person_in_charge;

      if (!userMap.has(personName)) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        userMap.set(personName, userId);

        db.prepare(`
          INSERT INTO users (id, name)
          VALUES (?, ?)
        `).run(userId, personName);
      }
    }
  });

  transaction();

  console.log(`${userMap.size}人の担当者を作成しました。`);

  // valuations テーブルに user_id カラムを追加
  console.log('valuationsテーブルにuser_idカラムを追加中...');

  // 新しいvaluationsテーブルを作成
  db.exec(`
    CREATE TABLE valuations_new (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(company_id, fiscal_year)
    );
  `);

  // データを新しいテーブルにコピー
  const copyTransaction = db.transaction(() => {
    for (const valuation of valuations) {
      const userId = userMap.get(valuation.person_in_charge);

      db.prepare(`
        INSERT INTO valuations_new (id, company_id, user_id, fiscal_year, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        valuation.id,
        valuation.company_id,
        userId,
        valuation.fiscal_year,
        valuation.created_at,
        valuation.updated_at
      );
    }
  });

  copyTransaction();

  // 古いテーブルを削除して新しいテーブルをリネーム
  db.exec(`
    DROP TABLE valuations;
    ALTER TABLE valuations_new RENAME TO valuations;
  `);

  // インデックスを再作成
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_valuations_company_id ON valuations(company_id);
    CREATE INDEX IF NOT EXISTS idx_valuations_user_id ON valuations(user_id);
  `);

  console.log('担当者テーブルへの移行が完了しました。');
  console.log('バックアップテーブル valuations_backup_users を確認後、削除してください。');
}

function migrateData() {
  const db = new Database(dbPath);

  console.log('データ移行を開始します...');

  try {
    // 1. 旧テーブルが存在するか確認
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='valuations'
    `).get();

    if (!tableExists) {
      console.log('旧テーブルが存在しません。移行をスキップします。');
      db.close();
      return;
    }

    // 2. 旧テーブルのカラム構造を確認
    const columns = db.prepare(`PRAGMA table_info(valuations)`).all() as any[];
    const hasCompanyIdColumn = columns.some((col: any) => col.name === 'company_id');
    const hasUserIdColumn = columns.some((col: any) => col.name === 'user_id');

    if (hasCompanyIdColumn && hasUserIdColumn) {
      console.log('すでに最新のスキーマに移行済みです。');
      db.close();
      return;
    }

    // company_idはあるがuser_idがない場合（担当者テーブル追加のみ）
    if (hasCompanyIdColumn && !hasUserIdColumn) {
      console.log('担当者テーブル追加の移行を実行します...');
      migrateToUsersTable(db);
      db.close();
      return;
    }

    console.log('旧スキーマのデータを取得中...');

    // 3. 旧データを全て取得（最初の正規化移行）
    const oldData = db.prepare('SELECT * FROM valuations').all() as OldValuation[];

    if (oldData.length === 0) {
      console.log('移行するデータがありません。');
    } else {
      console.log(`${oldData.length}件のデータを取得しました。`);
    }

    // 4. 旧テーブルをバックアップ
    console.log('旧テーブルをバックアップ中...');
    db.exec(`
      DROP TABLE IF EXISTS valuations_backup;
      CREATE TABLE valuations_backup AS SELECT * FROM valuations;
    `);

    // 5. 旧テーブルを削除
    console.log('旧テーブルを削除中...');
    db.exec('DROP TABLE valuations');

    // 6. 新しいスキーマでテーブルを作成
    console.log('新しいスキーマでテーブルを作成中...');
    db.exec(`
      -- 会社マスタテーブル
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 担当者マスタテーブル
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 評価レコードテーブル
      CREATE TABLE IF NOT EXISTS valuations (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        fiscal_year TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(company_id, fiscal_year)
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

    // 7. データを移行
    if (oldData.length > 0) {
      console.log('データを新しいスキーマに移行中...');

      const companyMap = new Map<string, string>();
      const userMap = new Map<string, string>();

      const transaction = db.transaction(() => {
        for (const record of oldData) {
          // 会社IDを取得または生成
          let companyId = companyMap.get(record.company_name);
          if (!companyId) {
            companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            companyMap.set(record.company_name, companyId);

            // 会社を挿入
            db.prepare(`
              INSERT INTO companies (id, company_name, created_at, updated_at)
              VALUES (?, ?, ?, ?)
            `).run(companyId, record.company_name, record.created_at, record.updated_at);
          }

          // 担当者IDを取得または生成
          let userId = userMap.get(record.person_in_charge);
          if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            userMap.set(record.person_in_charge, userId);

            // 担当者を挿入
            db.prepare(`
              INSERT INTO users (id, name, created_at, updated_at)
              VALUES (?, ?, ?, ?)
            `).run(userId, record.person_in_charge, record.created_at, record.updated_at);
          }

          // 評価レコードを挿入
          db.prepare(`
            INSERT INTO valuations (id, company_id, user_id, fiscal_year, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            record.id,
            companyId,
            userId,
            record.fiscal_year,
            record.created_at,
            record.updated_at
          );

          // 財務データを挿入
          db.prepare(`
            INSERT INTO financial_data (
              valuation_id,
              employees,
              total_assets,
              sales,
              current_period_net_asset,
              previous_period_net_asset,
              net_asset_tax_value,
              current_period_profit,
              previous_period_profit,
              previous_previous_period_profit,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            record.id,
            record.employees,
            record.total_assets,
            record.sales,
            record.current_period_net_asset,
            record.previous_period_net_asset,
            record.net_asset_tax_value,
            record.current_period_profit,
            record.previous_period_profit,
            record.previous_previous_period_profit,
            record.created_at,
            record.updated_at
          );

          // 投資家データをパースして挿入
          try {
            const investors = JSON.parse(record.investors);
            if (Array.isArray(investors)) {
              for (const investor of investors) {
                db.prepare(`
                  INSERT INTO investors (
                    valuation_id,
                    investor_name,
                    shares_held,
                    shareholding_ratio
                  ) VALUES (?, ?, ?, ?)
                `).run(
                  record.id,
                  investor.name || investor.investor_name || '',
                  investor.shares_held || investor.sharesHeld || 0,
                  investor.shareholding_ratio || investor.shareholdingRatio || 0
                );
              }
            }
          } catch (error) {
            console.warn(`投資家データのパースに失敗しました (ID: ${record.id}):`, error);
          }
        }
      });

      transaction();

      console.log(`${oldData.length}件のデータの移行が完了しました。`);
    }

    console.log('データ移行が正常に完了しました。');
    console.log('バックアップテーブル valuations_backup を確認後、削除してください。');

  } catch (error) {
    console.error('データ移行中にエラーが発生しました:', error);
    console.log('バックアップから復元するには、以下のSQLを実行してください:');
    console.log('DROP TABLE IF EXISTS valuations;');
    console.log('ALTER TABLE valuations_backup RENAME TO valuations;');
    throw error;
  } finally {
    db.close();
  }
}

// スクリプトを実行
migrateData();
