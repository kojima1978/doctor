# 出資持分の評価額試算ツール (Next.js版)

医療法人の出資持分の評価額の概算を知りたい方向けのツールです。

## 機能

- **STEP1**: 医療法人の規模を判定するためのデータを選択
- **STEP2**: 決算書より医療法人の財務データを入力
- **STEP3**: 出資者名簿より出資者情報を入力
- **計算結果**: 出資持分評価額・みなし贈与税額の表示

## セットアップ

### 依存パッケージのインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## 技術スタック

- **Next.js 15** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **App Router** - Next.jsのルーティングシステム

## プロジェクト構造

```
doctor-nextjs/
├── app/
│   ├── page.tsx           # 入力フォームページ
│   ├── results/
│   │   └── page.tsx       # 計算結果ページ
│   ├── layout.tsx         # ルートレイアウト
│   └── globals.css        # グローバルスタイル
├── components/
│   ├── Header.tsx         # ヘッダーコンポーネント
│   └── Button.tsx         # ボタンコンポーネント
├── lib/
│   ├── types.ts           # 型定義
│   └── calculations.ts    # 計算ロジック
└── package.json
```

## 注意事項

※ 正確な評価額を算出するには、税理士等の専門家へご相談ください。
