# 出資持分の評価額試算ツール (Next.js版)

医療法人の出資持分の評価額の概算を知りたい方向けのツールです。

## 主な機能

### 評価額計算
- **STEP0**: 会社名・担当者・事業年度の選択
- **STEP1**: 医療法人の規模を判定するためのデータを選択
- **STEP2**: 決算書より医療法人の財務データを入力
- **STEP3**: 出資者名簿より出資者情報を入力
- **計算結果**: 出資持分評価額・みなし贈与税額の表示

### マスタデータ管理
- **会社マスタ設定**: 会社情報の登録・編集・論理削除
- **担当者マスタ設定**: 担当者情報の登録・編集・論理削除
- **類似業種データ設定**: 類似業種比準方式の基準値管理

### データ管理機能
- **計算履歴**: 過去の評価計算の閲覧・削除
- **論理削除**: マスタデータの無効化機能（データの整合性維持）
- **検索・絞り込み**: 各種データの検索とフィルタリング

## セットアップ

### 依存パッケージのインストール

```bash
npm install
```

### データベースの初期化

アプリケーション起動時に自動的に `data/doctor.db` が作成され、テーブルが初期化されます。

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

### 本番ビルド

```bash
npm run build
npm start
```

### Dockerでの実行

#### 開発環境

```bash
docker-compose up dev
```

#### 本番環境

```bash
docker-compose up prod
```

## データベース

### スキーマ

- **companies**: 会社マスタ（論理削除対応）
- **users**: 担当者マスタ（論理削除対応）
- **valuations**: 評価レコード
- **financial_data**: 財務データ
- **investors**: 出資者情報
- **similar_industry_data**: 類似業種データ

詳細は [docs/er-diagram.md](docs/er-diagram.md) を参照してください。

### マイグレーション

データベーススキーマの変更が必要な場合は、`scripts/` ディレクトリにマイグレーションスクリプトを作成します。

```bash
npx tsx scripts/add-is-active-to-companies.ts
npx tsx scripts/add-is-active-to-users.ts
```

## 技術スタック

- **Next.js 15.5.9** - Reactフレームワーク (App Router)
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **SQLite** - データベース (better-sqlite3)
- **Lucide React** - アイコンライブラリ

## プロジェクト構造

```
doctor-nextjs/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # STEP0: 会社・担当者選択
│   ├── step1/page.tsx                # STEP1: 規模判定
│   ├── step2/page.tsx                # STEP2: 財務データ入力
│   ├── step3/page.tsx                # STEP3: 出資者情報入力
│   ├── results/page.tsx              # 計算結果表示
│   ├── history/page.tsx              # 計算履歴
│   ├── company-settings/page.tsx     # 会社マスタ設定
│   ├── user-settings/page.tsx        # 担当者マスタ設定
│   ├── similar-industry/page.tsx     # 類似業種データ設定
│   ├── api/                          # APIルート
│   │   ├── companies/route.ts        # 会社CRUD API
│   │   ├── users/route.ts            # 担当者CRUD API
│   │   ├── valuations/route.ts       # 評価レコードAPI
│   │   └── similar-industry/route.ts # 類似業種データAPI
│   ├── layout.tsx                    # ルートレイアウト
│   └── globals.css                   # グローバルスタイル
├── components/
│   ├── Header.tsx                    # ヘッダーコンポーネント
│   ├── Modal.tsx                     # モーダルダイアログ
│   └── CalculationDetailsModal.tsx   # 計算詳細表示モーダル
├── lib/
│   ├── db.ts                         # データベース初期化
│   ├── db-types.ts                   # データベース型定義
│   ├── types.ts                      # アプリケーション型定義
│   ├── calculations.ts               # 評価額計算ロジック
│   ├── button-styles.ts              # ボタンスタイル定義
│   ├── form-utils.ts                 # フォームユーティリティ
│   └── api-utils.ts                  # API共通処理
├── data/
│   └── doctor.db                     # SQLiteデータベース
├── scripts/
│   ├── add-is-active-to-companies.ts # 会社テーブル移行スクリプト
│   └── add-is-active-to-users.ts     # 担当者テーブル移行スクリプト
├── docs/
│   └── er-diagram.md                 # データベースER図
├── Dockerfile                        # Docker設定
├── docker-compose.yml                # Docker Compose設定
└── package.json
```

## トラブルシューティング

### Dockerコンテナでアプリケーションが落ちた場合

#### 1. ログの確認
```bash
# コンテナのログを確認
docker-compose logs dev
# または本番環境
docker-compose logs prod

# リアルタイムでログを監視
docker-compose logs -f dev
```

#### 2. コンテナの再起動
```bash
# コンテナを停止して再起動
docker-compose down
docker-compose up dev

# または強制的に再ビルド
docker-compose down
docker-compose build --no-cache dev
docker-compose up dev
```

#### 3. コンテナの状態確認
```bash
# 実行中のコンテナを確認
docker ps -a

# 特定のコンテナに入ってデバッグ
docker exec -it doctor-nextjs-dev sh

# コンテナ内でファイルを確認
docker exec -it doctor-nextjs-dev ls -la /app
```

#### 4. データベースの問題確認
```bash
# データベースファイルの存在確認
docker exec -it doctor-nextjs-dev ls -la /app/data

# データベースの権限確認
docker exec -it doctor-nextjs-dev ls -l /app/data/doctor.db

# 権限エラーの場合は修正
docker exec -it doctor-nextjs-dev chown nextjs:nodejs /app/data/doctor.db
```

#### 5. ボリュームのクリーンアップ（注意：データが消えます）
```bash
# すべてのコンテナとボリュームを削除
docker-compose down -v

# ボリュームを再作成して起動
docker-compose up dev
```

#### 6. よくある問題

**ポートが既に使用されている**
```bash
# Windowsでポートを確認
netstat -ano | findstr :3000

# docker-compose.ymlでポート番号を変更
ports:
  - "3001:3000"  # ホスト側のポートを変更
```

**本番環境の自動再起動**
本番環境では `restart: unless-stopped` が設定されているため、コンテナが落ちても自動的に再起動されます。

## 注意事項

※ 正確な評価額を算出するには、税理士等の専門家へご相談ください。
