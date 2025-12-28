'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, CalculationResult } from '@/lib/types';
import { calculateEvaluation } from '@/lib/calculations';
import Button from '@/components/Button';

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    // localStorageからデータを取得
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      const data: FormData = JSON.parse(savedData);
      setFormData(data);

      // 評価額を計算
      const calculatedResult = calculateEvaluation(data);
      setResult(calculatedResult);
    }
  }, []);

  const goBack = () => {
    router.back();
  };

  if (!result || !formData) {
    return (
      <div className="p-6">
        <p>データを読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">評価額の概算（計算結果）</h1>

      {/* 1. 出資持分評価額・持分なし医療法人移行時のみなし贈与税額 */}
      <h2 className="text-2xl font-bold mt-8">
        1．出資持分評価額・持分なし医療法人移行時のみなし贈与税額
      </h2>

      <div className="flex justify-between items-center mt-6 gap-4">
        {/* 設立時 */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold mb-3">設立時</div>
          <div className="mb-3">
            <img src="/doctor.svg" alt="医療法人" className="mx-auto" width="120" height="80" />
          </div>
          <div className="font-bold mb-2">当初出資額</div>
          <div className="inline-block bg-blue-100 rounded-full px-6 py-3 text-lg font-bold">
            {result.totalCapital.toLocaleString('ja-JP')}千円
          </div>
        </div>

        {/* 矢印1 */}
        <div className="text-blue-500 text-4xl">→</div>

        {/* 現在（持分あり医療法人） */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold mb-3">現在（持分あり医療法人）</div>
          <div className="mb-3">
            <img src="/hospital.svg" alt="医療法人" className="mx-auto" width="120" height="80" />
          </div>
          <div className="font-bold mb-2">出資持分評価額</div>
          <div className="inline-block bg-blue-100 rounded-full px-6 py-3 text-lg font-bold">
            {result.totalEvaluationValue.toLocaleString('ja-JP')}千円
          </div>
        </div>

        {/* 矢印2 */}
        <div className="text-blue-400 text-4xl">→</div>

        {/* 移行後（持分なし医療法人） */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold mb-3">移行後（持分なし医療法人）</div>
          <div className="mb-3">
            <img src="/hospital.svg" alt="医療法人" className="mx-auto" width="120" height="80" />
          </div>
          <div className="font-bold mb-2">みなし贈与税額</div>
          <div className="inline-block bg-blue-100 rounded-full px-6 py-3 text-lg font-bold">
            {result.deemedGiftTax.toLocaleString('ja-JP')}千円
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4 text-center">
        ※全出資者がすべての持分を放棄した場合の、医療法人へのみなし贈与税額の試算です。
      </p>

      {/* 2. 各出資者の出資持分評価額 */}
      <h2 className="text-2xl font-bold mt-8">2．各出資者の出資持分評価額</h2>
      <table className="border-collapse w-full mt-3">
        <thead>
          <tr>
            <th className="border border-gray-400 bg-gray-100 p-2 text-center">
              №
            </th>
            <th className="border border-gray-400 bg-gray-100 p-2 text-left">
              出資者名
            </th>
            <th className="border border-gray-400 bg-gray-100 p-2 text-center">
              出資金額
            </th>
            <th className="border border-gray-400 bg-gray-100 p-2 text-center">
              出資持分評価額
            </th>
            <th className="border border-gray-400 bg-gray-100 p-2 text-center">
              贈与税額
            </th>
          </tr>
        </thead>
        <tbody>
          {result.investorResults.map((investor, index) => (
            <tr key={index}>
              <td className="border border-gray-400 p-2 text-center">
                {index + 1}
              </td>
              <td className="border border-gray-400 p-2 text-left">
                {investor.name || ''}
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {investor.amount.toLocaleString('ja-JP')}円
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {investor.evaluationValue.toLocaleString('ja-JP')}千円
              </td>
              <td className="border border-gray-400 p-2 text-right">
                {investor.giftTax.toLocaleString('ja-JP')}千円
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-400 p-2 text-center">合計</td>
            <td className="border border-gray-400 p-2"></td>
            <td className="border border-gray-400 p-2 text-right">
              {formData.investors
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString('ja-JP')}
              円
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.investorResults
                .reduce((sum, inv) => sum + inv.evaluationValue, 0)
                .toLocaleString('ja-JP')}
              千円
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.investorResults
                .reduce((sum, inv) => sum + inv.giftTax, 0)
                .toLocaleString('ja-JP')}
              千円
            </td>
          </tr>
        </tfoot>
      </table>

      {/* （参考）出資持分評価額を算定する上での各要素 */}
      <h2 className="text-2xl font-bold mt-8">
        （参考）出資持分評価額を算定する上での各要素
      </h2>
      <table className="border-collapse w-full mt-3">
        <thead>
          <tr>
            <th className="border border-gray-400 bg-gray-100 p-2 text-left">
              項目
            </th>
            <th className="border border-gray-400 bg-gray-100 p-2 text-center">
              対象法人
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 p-2 text-left">会社規模</td>
            <td className="border border-gray-400 p-2 text-right">
              {result.companySize}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              特定の評価会社の該当判定
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.specialCompanyType}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              出資金額総額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.totalCapital.toLocaleString('ja-JP')}千円
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              総出資口数（1口50円と仮定）
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.totalShares.toLocaleString('ja-JP')}口
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              出資持分の相続税評価額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.inheritanceTaxValue.toLocaleString('ja-JP')}千円
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              持分なし医療法人移行時のみなし贈与税額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.deemedGiftTax.toLocaleString('ja-JP')}千円
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              1口あたりの類似業種比準価額方式による評価額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.perShareSimilarIndustryValue.toLocaleString('ja-JP')}円
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left pl-8">
              　類似業種の利益
            </td>
            <td className="border border-gray-400 p-2 text-right">51円</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left pl-8">
              　類似業種の純資産
            </td>
            <td className="border border-gray-400 p-2 text-right">395円</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left pl-8">
              　類似業種の令和6年平均株価
            </td>
            <td className="border border-gray-400 p-2 text-right">532円</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              1口あたりの純資産価額方式による評価額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.perShareNetAssetValue.toLocaleString('ja-JP')}円
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              L値（併用割合）
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.lRatio.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              評価方式
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.evaluationMethod}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 text-left">
              1口あたりの評価額
            </td>
            <td className="border border-gray-400 p-2 text-right">
              {result.perShareValue.toLocaleString('ja-JP')}円
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-sm text-gray-600 mt-2">
        ※ 類似業種の株価等は、令和7年12月時点の公表データを採用しています。
      </p>

      {/* ボタン */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="primary"
          className="text-base px-6 py-3"
          onClick={goBack}
        >
          ← 入力画面に戻る
        </Button>
        <Button
          variant="primary"
          className="text-base px-6 py-3"
          onClick={() => router.push('/gift-tax-table')}
        >
          相続税額早見表を見る →
        </Button>
      </div>
    </div>
  );
}
