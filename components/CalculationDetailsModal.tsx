'use client';

import { FormData } from '@/lib/types';
import { toWareki } from '@/lib/date-utils';

interface CalculationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'similar' | 'netAsset';
  formData: FormData;
  totalShares: number;
  sizeMultiplier: number;
}

export default function CalculationDetailsModal({
  isOpen,
  onClose,
  type,
  formData,
  totalShares,
  sizeMultiplier,
}: CalculationDetailsModalProps) {
  if (!isOpen) return null;

  // 類似業種比準価額の計算過程
  const renderSimilarIndustryDetails = () => {
    const similarData = formData.similarIndustryData || {
      profit_per_share: 0,
      net_asset_per_share: 0,
      average_stock_price: 0,
    };

    const A = similarData.average_stock_price;
    const C = similarData.profit_per_share;
    const D = similarData.net_asset_per_share;

    // 利益の計算
    const profitPrev = formData.currentPeriodProfit * 1000;
    const profit2Prev = formData.previousPeriodProfit * 1000;

    const profitPerSharePrev = totalShares > 0 ? profitPrev / totalShares : 0;
    const profitPrevPerShare = Math.floor(Math.max(0, profitPerSharePrev));

    const avgProfit12 = (profitPrev + profit2Prev) / 2;
    const profitPerShareAvg12 = totalShares > 0 ? avgProfit12 / totalShares : 0;
    const profitAvgPerShare12 = Math.floor(Math.max(0, profitPerShareAvg12));

    const c = Math.min(profitPrevPerShare, profitAvgPerShare12);

    // 純資産
    const netAsset = formData.netAssetTaxValue * 1000;
    const netAssetPerShare = totalShares > 0 ? netAsset / totalShares : 0;
    const d = Math.floor(netAssetPerShare);

    // 比準割合
    const ratioC = C !== 0 ? Math.floor((c / C) * 100) / 100 : 0;
    const ratioD = D !== 0 ? Math.floor((d / D) * 100) / 100 : 0;
    const avgRatio = Math.floor(((ratioC + ratioD) / 2) * 100) / 100;

    const S_50 = Math.floor(A * avgRatio * sizeMultiplier);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b-2 border-blue-500 pb-2">
          1口あたりの類似業種比準価額方式による評価額の計算過程
        </h3>

        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-bold mb-2">【計算式】</h4>
          <p className="font-mono text-sm">
            類似業種比準価額 = A × [(c/C + d/D) ÷ 2] × 斟酌率
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">【類似業種の数値】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">A：類似業種の{formData?.fiscalYear ? `${toWareki(formData.fiscalYear)}年度` : '令和6年度'}平均株価</td>
                <td className="text-right font-mono">{A.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">C：類似業種の1株あたり利益</td>
                <td className="text-right font-mono">{C.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">D：類似業種の1株あたり純資産</td>
                <td className="text-right font-mono">{D.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-bold mb-2">【評価会社の数値（1口50円あたり）】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">c：評価会社の1口あたり利益</td>
                <td className="text-right font-mono">{c.toLocaleString()}円</td>
              </tr>
              <tr className="text-xs text-gray-600">
                <td className="py-1 pl-4">直前期の利益</td>
                <td className="text-right font-mono">{profitPrevPerShare.toLocaleString()}円</td>
              </tr>
              <tr className="text-xs text-gray-600 border-b">
                <td className="py-1 pl-4">直前期と直前々期の平均</td>
                <td className="text-right font-mono">{profitAvgPerShare12.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">d：評価会社の1口あたり純資産（相続税評価額）</td>
                <td className="text-right font-mono">{d.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-bold mb-2">【比準割合の計算】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">利益比準割合 (c/C)</td>
                <td className="text-right font-mono">{ratioC.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">純資産比準割合 (d/D)</td>
                <td className="text-right font-mono">{ratioD.toFixed(2)}</td>
              </tr>
              <tr className="border-b bg-yellow-50">
                <td className="py-2 font-bold">平均比準割合 [(c/C + d/D) ÷ 2]</td>
                <td className="text-right font-mono font-bold">{avgRatio.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-2">
            ※医療法人は配当がないため、利益と純資産の2要素で計算します
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">【斟酌率】</h4>
          <p className="text-sm">会社規模による斟酌率: {sizeMultiplier}</p>
        </div>

        <div className="bg-green-50 p-4 rounded border-2 border-green-500">
          <h4 className="font-bold mb-2">【計算結果】</h4>
          <p className="font-mono text-lg">
            {A.toLocaleString()} × {avgRatio.toFixed(2)} × {sizeMultiplier} = <span className="font-bold text-green-700">{S_50.toLocaleString()}円</span>
          </p>
        </div>
      </div>
    );
  };

  // 純資産価額の計算過程
  const renderNetAssetDetails = () => {
    const netAssetInheritance = formData.netAssetTaxValue * 1000;
    const netAssetBook = formData.currentPeriodNetAsset * 1000;
    const evalDiff = netAssetInheritance - netAssetBook;
    const tax = evalDiff > 0 ? evalDiff * 0.37 : 0;
    const netAssetAdjusted = netAssetInheritance - tax;
    const N = totalShares > 0 ? Math.floor(netAssetAdjusted / totalShares) : 0;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b-2 border-blue-500 pb-2">
          1口あたりの純資産価額方式による評価額の計算過程
        </h3>

        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-bold mb-2">【計算式】</h4>
          <p className="font-mono text-sm">
            純資産価額 = (相続税評価額による純資産 - 法人税等相当額) ÷ 総出資口数
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">【純資産の計算】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">①相続税評価額による純資産</td>
                <td className="text-right font-mono">{netAssetInheritance.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">②帳簿価額による純資産（直前期）</td>
                <td className="text-right font-mono">{netAssetBook.toLocaleString()}円</td>
              </tr>
              <tr className="border-b bg-yellow-50">
                <td className="py-2 font-bold">③評価差額（①-②）</td>
                <td className="text-right font-mono font-bold">{evalDiff.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-bold mb-2">【法人税等相当額の計算】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">評価差額</td>
                <td className="text-right font-mono">{evalDiff.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">法人税等の実効税率</td>
                <td className="text-right font-mono">37%</td>
              </tr>
              <tr className="border-b bg-yellow-50">
                <td className="py-2 font-bold">法人税等相当額</td>
                <td className="text-right font-mono font-bold">{tax.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-2">
            ※評価差額がマイナスの場合、法人税等相当額は0円となります
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">【調整後純資産額】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">相続税評価額による純資産</td>
                <td className="text-right font-mono">{netAssetInheritance.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">法人税等相当額</td>
                <td className="text-right font-mono">-{tax.toLocaleString()}円</td>
              </tr>
              <tr className="border-b bg-yellow-50">
                <td className="py-2 font-bold">調整後純資産額</td>
                <td className="text-right font-mono font-bold">{netAssetAdjusted.toLocaleString()}円</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-bold mb-2">【1口あたりの純資産価額】</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2">調整後純資産額</td>
                <td className="text-right font-mono">{netAssetAdjusted.toLocaleString()}円</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">総出資口数</td>
                <td className="text-right font-mono">{totalShares.toLocaleString()}口</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 p-4 rounded border-2 border-green-500">
          <h4 className="font-bold mb-2">【計算結果】</h4>
          <p className="font-mono text-lg">
            {netAssetAdjusted.toLocaleString()} ÷ {totalShares.toLocaleString()} = <span className="font-bold text-green-700">{N.toLocaleString()}円</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {type === 'similar' ? '類似業種比準価額' : '純資産価額'}の計算過程
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {type === 'similar' ? renderSimilarIndustryDetails() : renderNetAssetDetails()}
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
