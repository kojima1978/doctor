'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { buttonStyle, buttonHoverClass } from '@/lib/button-styles';

export default function Header() {
  const router = useRouter();

  const handleClearData = () => {
    if (confirm('すべてのデータをクリアしますか？\nこの操作は取り消せません。')) {
      // localStorageのformDataをクリア
      localStorage.removeItem('formData');
      alert('データをクリアしました。');
      // トップページにリダイレクト
      router.push('/');
      // ページをリロードして状態をリセット
      window.location.reload();
    }
  };

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
        <button
          onClick={handleClearData}
          className={buttonHoverClass}
          style={buttonStyle}
        >
          <Trash2 size={20} />
          データクリア
        </button>
      </div>
    </header>
  );
}
