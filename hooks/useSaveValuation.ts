import { useState } from 'react';
import { FormData } from '@/lib/types';
import { generateId, checkApiResponse } from '@/lib/utils';

/**
 * 評価データを保存するカスタムフック
 */
export function useSaveValuation() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveValuation = async (formData: FormData): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // IDが存在しない場合は自動生成
      const dataToSave = {
        ...formData,
        id: formData.id || generateId('val'),
      };

      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      await checkApiResponse(response);

      // localStorageも更新
      localStorage.setItem('formData', JSON.stringify(dataToSave));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの保存に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveValuation, isSaving, error };
}
