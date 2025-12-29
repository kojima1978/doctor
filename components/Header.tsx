'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/calculator.svg"
            alt="計算機"
            width="60"
            height="60"
          />
          <h1 className="text-2xl font-bold m-0">
            出資持分の評価額試算ツール
          </h1>
        </div>
        <Link
          href="/similar-industry-settings"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Settings size={20} />
          類似業種データ設定
        </Link>
      </div>
    </header>
  );
}
