/**
 * IDを生成するユーティリティ関数
 * @param prefix IDのプレフィックス (例: "val", "user", "company")
 * @param length ランダム部分の長さ (デフォルト: 11)
 * @returns 生成されたID
 */
export function generateId(prefix: string, length: number = 11): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * フォームデータの基本情報バリデーション
 * @param data バリデーション対象のデータ
 * @returns バリデーション結果 { isValid: boolean, message?: string }
 */
export function validateBasicInfo(data: {
  fiscalYear?: string;
  companyName?: string;
  personInCharge?: string;
}): { isValid: boolean; message?: string } {
  if (!data.fiscalYear || !data.companyName || !data.personInCharge) {
    return {
      isValid: false,
      message: 'STEP0の基本情報を入力してください。',
    };
  }
  return { isValid: true };
}

/**
 * 共通のエラーハンドラー
 * @param error エラーオブジェクト
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns エラーメッセージ
 */
export function handleError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * APIレスポンスのエラーチェック
 * @param response fetch APIのレスポンス
 * @returns レスポンスが正常かどうか
 */
export async function checkApiResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'リクエストに失敗しました');
  }
}
