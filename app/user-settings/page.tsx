'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { buttonStyle, smallButtonStyle, btnHoverClass } from '@/lib/button-styles';
import { useCrudSettings } from '@/hooks/useCrudSettings';
import { handleDoubleClickToStep0, handleFormSubmit } from '@/lib/form-utils';

type User = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function UserSettingsPage() {
  const router = useRouter();
  const { data, loading, searchTerm, setSearchTerm, loadData, handleDelete: deleteItem, filterData } = useCrudSettings<User>({
    apiEndpoint: '/api/users',
    entityName: '担当者',
    getDisplayName: (user) => user.name,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState('');
  const [userName, setUserName] = useState('');
  const buttonHoverClass = btnHoverClass;

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormMode('create');
    setSelectedId('');
    setUserName('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record: User) => {
    setFormMode('edit');
    setSelectedId(record.id);
    setUserName(record.name);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userName.trim()) {
      alert('担当者名を入力してください。');
      return;
    }

    const requestData = {
      id: selectedId,
      name: userName,
    };

    const result = await handleFormSubmit(
      '/api/users',
      formMode === 'create' ? 'POST' : 'PUT',
      requestData
    );

    if (result.success) {
      alert(result.message);
      setIsFormModalOpen(false);
      loadData();
    } else {
      alert(result.message);
    }
  };

  // 検索フィルター
  const filteredData = filterData(data, (user) => user.name);

  return (
    <div>
      <Header />
      <h1>担当者マスタ設定</h1>

      <div className="card">
        <p className="mb-4">
          担当者情報を管理します。
          <br />
          評価額計算時に選択できます。
        </p>
        <button onClick={handleOpenCreateModal} className={buttonHoverClass} style={buttonStyle}>
          <Plus size={20} />
          新規登録
        </button>
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">担当者名で絞り込み</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="担当者名を入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                {filteredData.length}件の担当者が見つかりました
              </p>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th className="text-left">担当者名</th>
                <th className="text-center">登録日時</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500">
                    該当する担当者が見つかりません
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id}>
                    <td
                      className="text-left cursor-pointer hover:bg-blue-50"
                      onDoubleClick={() => handleDoubleClickToStep0('personInCharge', record.name, router)}
                      title="ダブルクリックで選択してSTEP0に戻る"
                    >
                      {record.name}
                    </td>
                    <td className="text-center">
                      {new Date(record.created_at).toLocaleString('ja-JP')}
                    </td>
                    <td className="text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className={buttonHoverClass}
                          style={smallButtonStyle}
                        >
                          <Edit2 size={16} />
                          修正
                        </button>
                        <button
                          onClick={() => deleteItem(record.id, record.name)}
                          className={buttonHoverClass}
                          style={smallButtonStyle}
                        >
                          <Trash2 size={16} />
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => router.push('/')} className={buttonHoverClass} style={buttonStyle}>
          <ArrowLeft size={20} />
          入力画面へ戻る
        </button>
      </div>

      {/* フォームモーダル */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? '担当者情報新規登録' : '担当者情報修正'}
        minWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">担当者名</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="例：山田太郎"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className={buttonHoverClass}
              style={buttonStyle}
            >
              <X size={20} />
              キャンセル
            </button>
            <button type="submit" className={buttonHoverClass} style={buttonStyle}>
              <Save size={20} />
              {formMode === 'create' ? '登録' : '更新'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
