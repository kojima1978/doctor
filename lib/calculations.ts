import { FormData, CalculationResult } from './types';

export type CompanySize = 'Big' | 'Medium' | 'Small';

export interface CompanySizeResult {
  size: CompanySize;
  sizeLabel: string;
  sizeMultiplier: 0.7 | 0.6 | 0.5;
  lRatio: 1.0 | 0.9 | 0.75 | 0.6 | 0.5;
}

/**
 * 会社規模を判定する（小売・サービス業/医療法人基準）
 * 国税庁通達179号に基づく
 */
export function determineCompanySize(
  employees: string,
  totalAssets: string,
  sales: string
): CompanySizeResult {
  const empNum = parseInt(employees);
  const assetsNum = parseInt(totalAssets);
  const salesNum = parseInt(sales);

  // 大会社判定
  if (empNum === 5) {
    // 70人以上
    return {
      size: 'Big',
      sizeLabel: '大会社',
      sizeMultiplier: 0.7,
      lRatio: 1.0,
    };
  }
  if (assetsNum === 5 && empNum > 3) {
    // 15億円以上（従業員数が35人以下の会社を除く）
    return {
      size: 'Big',
      sizeLabel: '大会社',
      sizeMultiplier: 0.7,
      lRatio: 1.0,
    };
  }
  if (salesNum === 5) {
    // 20億円以上
    return {
      size: 'Big',
      sizeLabel: '大会社',
      sizeMultiplier: 0.7,
      lRatio: 1.0,
    };
  }

  // 小会社判定
  if (assetsNum === 1) {
    // 4,000万円未満
    return {
      size: 'Small',
      sizeLabel: '小会社',
      sizeMultiplier: 0.5,
      lRatio: 0.5,
    };
  }
  if (empNum === 1) {
    // 従業員数が5人以下
    return {
      size: 'Small',
      sizeLabel: '小会社',
      sizeMultiplier: 0.5,
      lRatio: 0.5,
    };
  }
  if (salesNum === 1) {
    // 6,000万円未満
    return {
      size: 'Small',
      sizeLabel: '小会社',
      sizeMultiplier: 0.5,
      lRatio: 0.5,
    };
  }

  // 中会社判定（上記以外）
  // 資産と売上から最大のL値を選択
  let lAssets = 0.0;
  let lSales = 0.0;

  // 資産によるL値判定（小売・サービス業/医療法人基準）
  if (assetsNum === 4 && empNum > 3) {
    // 5億円以上（従業員35人以下除く）
    lAssets = 0.9;
  } else if (assetsNum === 3 && empNum > 2) {
    // 2.5億円以上（従業員20人以下除く）
    lAssets = 0.75;
  } else if (assetsNum >= 2 && empNum > 1) {
    // 4,000万円以上（従業員5人以下除く）
    lAssets = 0.6;
  }

  // 売上によるL値判定（小売・サービス業/医療法人基準）
  if (salesNum === 4) {
    // 5億円以上20億円未満
    lSales = 0.9;
  } else if (salesNum === 3) {
    // 2.5億円以上5億円未満
    lSales = 0.75;
  } else if (salesNum === 2) {
    // 6,000万円以上2.5億円未満
    lSales = 0.6;
  }

  // 最大のL値を選択
  const lRatio = Math.max(lAssets, lSales) as 0.9 | 0.75 | 0.6;

  let sizeLabel = '中会社';
  if (lRatio === 0.9) sizeLabel = '中会社の大';
  else if (lRatio === 0.75) sizeLabel = '中会社の中';
  else if (lRatio === 0.6) sizeLabel = '中会社の小';

  return {
    size: 'Medium',
    sizeLabel,
    sizeMultiplier: 0.6,
    lRatio: lRatio || 0.6,
  };
}

/**
 * 類似業種比準価額を計算（医療法人対応）
 */
function calculateSimilarIndustryValue(
  formData: FormData,
  sizeMultiplier: number,
  totalShares: number
): { value: number; specialCompanyType: string } {
  // 類似業種データを使用（登録されていない場合は0）
  const similarData = formData.similarIndustryData || {
    profit_per_share: 0,
    net_asset_per_share: 0,
    average_stock_price: 0,
  };

  const A = similarData.average_stock_price; // 類似業種の平均株価
  const B = 0; // 配当（医療法人は配当なしのため0）
  const C: number = similarData.profit_per_share; // 類似業種の利益
  const D: number = similarData.net_asset_per_share; // 類似業種の純資産

  // 評価会社の指標（50円換算）
  // 配当は医療法人では0
  const b = 0;

  // 利益の計算
  const profitPrev = formData.currentPeriodProfit * 1000; // 直前期（円）
  const profit2Prev = formData.previousPeriodProfit * 1000; // 直前々期（円）
  const profit3Prev = formData.previousPreviousPeriodProfit * 1000; // 直前々々期（円）

  // cの計算: 直前期と(直前期+直前々期)÷2の低い方
  const profitPerSharePrev = totalShares > 0 ? profitPrev / totalShares : 0;
  const profitPrevPerShare = Math.floor(Math.max(0, profitPerSharePrev));

  const avgProfit12 = (profitPrev + profit2Prev) / 2; // 直前期と直前々期の平均
  const profitPerShareAvg12 = totalShares > 0 ? avgProfit12 / totalShares : 0;
  const profitAvgPerShare12 = Math.floor(Math.max(0, profitPerShareAvg12));

  const c = Math.min(profitPrevPerShare, profitAvgPerShare12);

  // c1の計算: 直前期と(直前期+直前々期)÷2の高い方
  const c1 = Math.max(profitPrevPerShare, profitAvgPerShare12);

  // c2の計算: 直前々期と(直前々期+直前々々期)÷2の高い方
  const profit2PerSharePrev = totalShares > 0 ? profit2Prev / totalShares : 0;
  const profit2PrevPerShare = Math.floor(Math.max(0, profit2PerSharePrev));

  const avgProfit23 = (profit2Prev + profit3Prev) / 2; // 直前々期と直前々々期の平均
  const profitPerShareAvg23 = totalShares > 0 ? avgProfit23 / totalShares : 0;
  const profitAvgPerShare23 = Math.floor(Math.max(0, profitPerShareAvg23));

  const c2 = Math.max(profit2PrevPerShare, profitAvgPerShare23);

  // 純資産（直前期の相続税評価額）
  const netAsset = formData.netAssetTaxValue * 1000;
  const netAssetPerShare = totalShares > 0 ? netAsset / totalShares : 0;
  const d = Math.floor(netAssetPerShare);

  // d1の計算: 直前期の帳簿価額による純資産
  const netAsset1 = formData.currentPeriodNetAsset * 1000;
  const netAssetPerShare1 = totalShares > 0 ? netAsset1 / totalShares : 0;
  const d1 = Math.floor(netAssetPerShare1);

  // d2の計算: 直前々期の純資産
  const netAsset2 = formData.previousPeriodNetAsset * 1000;
  const netAssetPerShare2 = totalShares > 0 ? netAsset2 / totalShares : 0;
  const d2 = Math.floor(netAssetPerShare2);

  // デバッグ用ログ
  console.log('比準要素判定:', {
    currentPeriodProfit: formData.currentPeriodProfit,
    currentPeriodNetAsset: formData.currentPeriodNetAsset,
    c1, d1, c2, d2,
    totalShares
  });

  // 比準要素数0の会社判定
  if (c1 === 0 && d1 === 0) {
    // 比準要素数0の会社は類似業種比準価額を使用できない
    // 純資産価額方式のみとなるため、類似業種比準価額は0を返す
    console.warn('比準要素数0の会社と判定されました');
    return { value: 0, specialCompanyType: '比準0（比準要素数0の会社）' };
  }

  // 比準要素数1の会社判定
  const isOneElementZero_d1 = (c1 === 0 || d1 === 0) && !(c1 === 0 && d1 === 0);
  const isOneOrBothElementZero_d2 = c2 === 0 || d2 === 0;

  if (isOneElementZero_d1 && isOneOrBothElementZero_d2) {
    // 比準要素数1の会社
    // 類似業種比準価額を使用できない（純資産価額方式のみ）
    return { value: 0, specialCompanyType: '比準1（比準要素数1の会社）' };
  }

  // 比準割合の計算（医療法人は配当を除く2要素で計算）
  let ratioC = 0;
  let ratioD = 0;

  if (C !== 0 && D !== 0) {
    ratioC = Math.floor((c / C) * 100) / 100;
    ratioD = Math.floor((d / D) * 100) / 100;
  }

  // 医療法人の場合は（利益比準 + 純資産比準）÷ 2
  const avgRatio = Math.floor(((ratioC + ratioD) / 2) * 100) / 100;

  // 類似業種比準価額（50円あたり）
  const S_50 = Math.floor(A * avgRatio * sizeMultiplier);

  return { value: S_50, specialCompanyType: '非該当' };
}

/**
 * 純資産価額を計算
 */
function calculateNetAssetValue(
  formData: FormData,
  totalShares: number
): number {
  // 相続税評価額による純資産
  const netAssetInheritance = formData.netAssetTaxValue * 1000;

  // 帳簿価額による純資産（簡易計算：直前期の純資産）
  const netAssetBook = formData.currentPeriodNetAsset * 1000;

  // 評価差額
  const evalDiff = netAssetInheritance - netAssetBook;

  // 法人税等相当額（37%）
  const tax = evalDiff > 0 ? evalDiff * 0.37 : 0;

  // 純資産価額（調整後）
  const netAssetAdjusted = netAssetInheritance - tax;

  // 1口あたりの純資産価額
  const N = totalShares > 0 ? Math.floor(netAssetAdjusted / totalShares) : 0;

  return N;
}

/**
 * 最終評価額を計算（会社規模に応じた方式）
 */
function calculateFinalValue(
  S: number,
  N: number,
  size: CompanySize,
  lRatio: number
): { value: number; method: string } {
  let finalValue = 0;
  let method = '';

  if (size === 'Big') {
    // 大会社：類似業種比準価額と純資産価額の低い方
    if (S < N) {
      finalValue = S;
      method = '類似業種比準価額（原則）';
    } else {
      finalValue = N;
      method = '純資産価額（選択）';
    }
  } else if (size === 'Medium') {
    // 中会社：併用方式 (min(S,N) × L) + (N × (1-L))
    const minValue = Math.min(S, N);
    finalValue = Math.floor(minValue * lRatio + N * (1 - lRatio));
    method = `併用方式（L=${lRatio.toFixed(2)}）`;
  } else {
    // 小会社：純資産価額と併用方式(L=0.5)の低い方
    const blended = Math.floor(S * 0.5 + N * 0.5);
    if (N < blended) {
      finalValue = N;
      method = '純資産価額（原則）';
    } else {
      finalValue = blended;
      method = '併用方式（L=0.50選択）';
    }
  }

  return { value: finalValue, method };
}

/**
 * 評価額を計算する
 */
export function calculateEvaluation(formData: FormData): CalculationResult {
  // 会社規模の判定
  const companySizeResult = determineCompanySize(
    formData.employees,
    formData.totalAssets,
    formData.sales
  );

  // 出資金額総額を計算
  const totalInvestment = formData.investors.reduce(
    (sum, investor) => sum + (investor.amount || 0),
    0
  );

  // 総出資口数を計算（1口50円と仮定）
  const totalShares = totalInvestment > 0 ? totalInvestment / 50 : 0;

  // 類似業種比準価額（50円あたり）
  const similarIndustryResult = calculateSimilarIndustryValue(
    formData,
    companySizeResult.sizeMultiplier,
    totalShares
  );

  const S = similarIndustryResult.value;
  const specialCompanyType = similarIndustryResult.specialCompanyType;

  // 純資産価額（50円あたり）
  const N = calculateNetAssetValue(formData, totalShares);

  // 最終評価額（50円あたり）
  const finalResult = calculateFinalValue(
    S,
    N,
    companySizeResult.size,
    companySizeResult.lRatio
  );

  const perShareValue = finalResult.value;

  // 出資持分評価額総額（千円単位）
  const totalEvaluationValue = Math.round((totalShares * perShareValue) / 1000);

  // 贈与税を計算する関数
  const calculateGiftTax = (evaluationValue: number): number => {
    // 基礎控除後の課税価格（千円単位から万円単位に変換）
    const taxableAmount = evaluationValue - 110; // 基礎控除110万円

    if (taxableAmount <= 0) {
      return 0; // 基礎控除以下の場合は税額0
    }

    let tax = 0;

    // 贈与税の速算表（一般税率）を適用
    if (taxableAmount <= 200) {
      tax = taxableAmount * 0.1;
    } else if (taxableAmount <= 300) {
      tax = taxableAmount * 0.15 - 10;
    } else if (taxableAmount <= 400) {
      tax = taxableAmount * 0.2 - 25;
    } else if (taxableAmount <= 600) {
      tax = taxableAmount * 0.3 - 65;
    } else if (taxableAmount <= 1000) {
      tax = taxableAmount * 0.4 - 125;
    } else if (taxableAmount <= 1500) {
      tax = taxableAmount * 0.45 - 175;
    } else if (taxableAmount <= 3000) {
      tax = taxableAmount * 0.5 - 250;
    } else {
      tax = taxableAmount * 0.55 - 400;
    }

    return Math.round(tax);
  };

  // 各出資者の評価額と贈与税を計算
  const investorResults = formData.investors.map((investor) => {
    const amount = investor.amount || 0;
    const shares = amount / 50;
    const evaluationValue = Math.round((shares * perShareValue) / 1000);
    const giftTax = calculateGiftTax(evaluationValue);
    return {
      name: investor.name || '',
      amount: amount,
      evaluationValue,
      giftTax,
    };
  });

  // 持分なし医療法人移行時のみなし贈与税額を計算
  // 各出資者の贈与税を合計する
  const deemedGiftTax = investorResults.reduce(
    (totalTax, investor) => totalTax + investor.giftTax,
    0
  );

  return {
    companySize: companySizeResult.sizeLabel,
    specialCompanyType,
    totalCapital: Math.round(totalInvestment / 1000),
    totalShares,
    inheritanceTaxValue: totalEvaluationValue,
    perShareNetAssetValue: N,
    perShareSimilarIndustryValue: S,
    perShareValue,
    evaluationMethod: finalResult.method,
    lRatio: companySizeResult.lRatio,
    totalEvaluationValue,
    deemedGiftTax,
    investorResults,
  };
}
