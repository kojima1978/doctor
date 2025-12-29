# データベーススキーマ正規化移行ガイド

## 概要

このプロジェクトのデータベーススキーマを単一テーブル設計から正規化された複数テーブル設計に移行しました。

## 新しいテーブル設計

### 1. companies（会社マスタ）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | 会社ID |
| company_name | TEXT | NOT NULL UNIQUE | 会社名 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 2. valuations（評価レコード）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PRIMARY KEY | 評価ID |
| company_id | TEXT | NOT NULL, FK | 会社ID |
| fiscal_year | TEXT | NOT NULL | 事業年度 |
| person_in_charge | TEXT | NOT NULL | 担当者名 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

- UNIQUE制約: (company_id, fiscal_year)
- 外部キー: company_id → companies(id) ON DELETE CASCADE

### 3. financial_data（財務データ）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 財務データID |
| valuation_id | TEXT | NOT NULL, FK | 評価ID |
| employees | TEXT | | 従業員数 |
| total_assets | TEXT | | 総資産 |
| sales | TEXT | | 売上高 |
| current_period_net_asset | REAL | | 当期純資産 |
| previous_period_net_asset | REAL | | 前期純資産 |
| net_asset_tax_value | REAL | | 純資産税務価額 |
| current_period_profit | REAL | | 当期利益 |
| previous_period_profit | REAL | | 前期利益 |
| previous_previous_period_profit | REAL | | 前々期利益 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

- 外部キー: valuation_id → valuations(id) ON DELETE CASCADE

### 4. investors（投資家）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 投資家ID |
| valuation_id | TEXT | NOT NULL, FK | 評価ID |
| investor_name | TEXT | NOT NULL | 投資家名 |
| shares_held | INTEGER | | 保有株数 |
| shareholding_ratio | REAL | | 持株比率 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

- 外部キー: valuation_id → valuations(id) ON DELETE CASCADE

## 正規化のメリット

1. **データの一貫性**: 会社名が一箇所で管理され、重複がなくなります
2. **柔軟性**: 投資家情報が配列として自由に追加・削除可能
3. **パフォーマンス**: 適切なインデックスにより検索が高速化
4. **保守性**: テーブルごとに責務が明確で、メンテナンスが容易
5. **データ整合性**: 外部キー制約により参照整合性が保証されます

## 移行手順

### ステップ1: バックアップ
既存のデータベースをバックアップしてください。

```bash
cp data/doctor.db data/doctor.db.backup
```

### ステップ2: 移行スクリプトの実行
以下のコマンドで移行を実行します。

```bash
npm run migrate
```

移行スクリプトは以下を自動的に行います:
- 旧テーブルのバックアップ作成（valuations_backup）
- 新しいスキーマでテーブルを作成
- 既存データを新しいテーブルに移行
- インデックスの作成

### ステップ3: 動作確認
アプリケーションを起動して、データの読み書きが正常に動作することを確認してください。

```bash
npm run dev
```

### ステップ4: バックアップテーブルの削除（オプション）
移行が成功し、問題がないことを確認したら、バックアップテーブルを削除できます。

```sql
DROP TABLE valuations_backup;
```

## トラブルシューティング

### 移行に失敗した場合
バックアップから復元してください。

```bash
rm data/doctor.db
cp data/doctor.db.backup data/doctor.db
```

または、SQLiteクライアントで以下を実行:

```sql
DROP TABLE IF EXISTS valuations;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS financial_data;
DROP TABLE IF EXISTS investors;
ALTER TABLE valuations_backup RENAME TO valuations;
```

## API互換性

既存のAPI仕様は変更されていません。フロントエンドのコードを変更する必要はありません。

- POST /api/valuations - データの作成・更新
- GET /api/valuations - 全データの取得
- GET /api/valuations?id=xxx - 特定データの取得
- DELETE /api/valuations?id=xxx - データの削除

すべてのAPIレスポンスは以前と同じ形式を維持しています。
