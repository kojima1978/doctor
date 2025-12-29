'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { toWareki } from '@/lib/date-utils';

type SimilarIndustryData = {
  id: string;
  fiscal_year: string;
  profit_per_share: number;
  net_asset_per_share: number;
  average_stock_price: number;
  created_at: string;
  updated_at: string;
};

export default function SimilarIndustrySettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<SimilarIndustryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [profitPerShare, setProfitPerShare] = useState('51');
  const [netAssetPerShare, setNetAssetPerShare] = useState('395');
  const [averageStockPrice, setAverageStockPrice] = useState('532');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/similar-industry');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormMode('create');
    setSelectedId('');
    setFiscalYear('');
    setProfitPerShare('51');
    setNetAssetPerShare('395');
    setAverageStockPrice('532');
    setIsFormModalOpen(true);
  };

  // 登録済みの年度一覧を取得
  const getRegisteredYears = () => {
    return new Set(data.map(record => record.fiscal_year));
  };

  const handleOpenEditModal = (record: SimilarIndustryData) => {
    setFormMode('edit');
    setSelectedId(record.id);
    setFiscalYear(record.fiscal_year);
    setProfitPerShare(record.profit_per_share.toString());
    setNetAssetPerShare(record.net_asset_per_share.toString());
    setAverageStockPrice(record.average_stock_price.toString());
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fiscalYear || !profitPerShare || !netAssetPerShare || !averageStockPrice) {
      alert('すべての項目を入力してください。');
      return;
    }

    const requestData = {
      id: selectedId,
      fiscal_year: fiscalYear,
      profit_per_share: parseFloat(profitPerShare),
      net_asset_per_share: parseFloat(netAssetPerShare),
      average_stock_price: parseFloat(averageStockPrice),
    };

    try {
      const response = await fetch('/api/similar-industry', {
        method: formMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存に失敗しました');
      }

      alert(result.message || '保存しました');
      setIsFormModalOpen(false);
      loadData();
    } catch (error) {
      console.error('保存エラー:', error);
      alert(error instanceof Error ? error.message : '保存に失敗しました');
    }
  };

  const handleDelete = async (id: string, fiscalYear: string) => {
    if (!confirm(`${fiscalYear}年度のデータを削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/similar-industry?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      alert('データを削除しました');
      loadData();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div>
      <Header />
      <h1>類似業種データ設定</h1>

      <div className="card">
        <p className="mb-4">
          年度ごとの類似業種データ（医療・福祉業）を管理します。
          <br />
          評価額計算時に、選択した年度のデータが自動的に使用されます。
        </p>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
          <Plus size={20} />
          新規登録
        </Button>
      </div>

      {loading ? (
        <div className="card">
          <p>読み込み中...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="card">
          <p>登録されたデータはありません。</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th className="text-center">年度</th>
                <th className="text-right">類似業種の利益</th>
                <th className="text-right">類似業種の純資産</th>
                <th className="text-right">平均株価</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id}>
                  <td className="text-center">{toWareki(record.fiscal_year)}年度</td>
                  <td className="text-right">{record.profit_per_share}円</td>
                  <td className="text-right">{record.net_asset_per_share}円</td>
                  <td className="text-right">{record.average_stock_price}円</td>
                  <td className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        className="text-sm px-4 py-2 flex items-center gap-1"
                        onClick={() => handleOpenEditModal(record)}
                      >
                        <Edit2 size={16} />
                        修正
                      </Button>
                      <Button
                        className="text-sm px-4 py-2 flex items-center gap-1"
                        onClick={() => handleDelete(record.id, toWareki(record.fiscal_year))}
                      >
                        <Trash2 size={16} />
                        削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => router.push('/')} className="flex items-center gap-2">
          <ArrowLeft size={20} />
          入力画面へ戻る
        </Button>
      </div>

      {/* フォームモーダル */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? '類似業種データ新規登録' : '類似業種データ修正'}
        minWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">年度（西暦）</label>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              required
              disabled={formMode === 'edit'}
            >
              <option value="">選択してください</option>
              {Array.from({ length: 11 }, (_, i) => {
                const currentYear = new Date().getFullYear();
                return currentYear + 5 - i;
              })
                .filter((year) => {
                  const registeredYears = getRegisteredYears();
                  // 新規作成時は登録済み年度を除外、修正時は全て表示
                  return formMode === 'edit' || !registeredYears.has(year.toString());
                })
                .map((year) => (
                  <option key={year} value={year.toString()}>
                    {toWareki(year)}年度
                  </option>
                ))}
            </select>
            {formMode === 'edit' && (
              <p className="text-sm text-gray-600 mt-1">
                ※年度は変更できません
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">類似業種の利益（円）</label>
            <input
              type="number"
              step="0.01"
              value={profitPerShare}
              onChange={(e) => setProfitPerShare(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">類似業種の純資産（円）</label>
            <input
              type="number"
              step="0.01"
              value={netAssetPerShare}
              onChange={(e) => setNetAssetPerShare(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">平均株価（円）</label>
            <input
              type="number"
              step="0.01"
              value={averageStockPrice}
              onChange={(e) => setAverageStockPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="flex items-center gap-2"
            >
              <X size={20} />
              キャンセル
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save size={20} />
              {formMode === 'create' ? '登録' : '更新'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
