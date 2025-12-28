'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Investor } from '@/lib/types';
import Step1CompanySize from '@/components/valuation/Step1CompanySize';
import Step2FinancialData from '@/components/valuation/Step2FinancialData';
import Step3Investors from '@/components/valuation/Step3Investors';

export default function Home() {
  const router = useRouter();

  // STEP1: 会社規模判定
  const [employees, setEmployees] = useState('');
  const [totalAssets, setTotalAssets] = useState('');
  const [sales, setSales] = useState('');

  // STEP2: 財務データ
  const [currentPeriodNetAsset, setCurrentPeriodNetAsset] = useState('');
  const [previousPeriodNetAsset, setPreviousPeriodNetAsset] = useState('');
  const [netAssetTaxValue, setNetAssetTaxValue] = useState('');
  const [currentPeriodProfit, setCurrentPeriodProfit] = useState('');
  const [previousPeriodProfit, setPreviousPeriodProfit] = useState('');
  const [previousPreviousPeriodProfit, setPreviousPreviousPeriodProfit] = useState('');

  // STEP3: 出資者情報
  const [investors, setInvestors] = useState<Investor[]>([
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 },
  ]);

  // ページ読み込み時にlocalStorageからデータを復元
  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setEmployees(data.employees || '');
        setTotalAssets(data.totalAssets || '');
        setSales(data.sales || '');
        setCurrentPeriodNetAsset(data.currentPeriodNetAsset?.toString() || '');
        setPreviousPeriodNetAsset(data.previousPeriodNetAsset?.toString() || '');
        setNetAssetTaxValue(data.netAssetTaxValue?.toString() || '');
        setCurrentPeriodProfit(data.currentPeriodProfit?.toString() || '');
        setPreviousPeriodProfit(data.previousPeriodProfit?.toString() || '');
        setPreviousPreviousPeriodProfit(data.previousPreviousPeriodProfit?.toString() || '');
        if (data.investors && data.investors.length > 0) {
          setInvestors(data.investors);
        }
      } catch (error) {
        console.error('Failed to restore form data:', error);
      }
    }
  }, []);

  // 出資者を追加
  const addInvestorRow = () => {
    setInvestors([...investors, { name: '', amount: 0 }]);
  };

  // 出資者情報を更新
  const updateInvestor = (index: number, field: keyof Investor, value: string | number) => {
    const newInvestors = [...investors];
    newInvestors[index] = { ...newInvestors[index], [field]: value };
    setInvestors(newInvestors);
  };

  // 出資金額の合計を計算
  const totalInvestment = investors.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  // 複写機能
  const copyToTaxValue = () => {
    if (currentPeriodNetAsset) {
      setNetAssetTaxValue(currentPeriodNetAsset);
    }
  };

  // 計算結果ページへ遷移
  const goToResults = () => {
    // バリデーション: STEP1の必須項目チェック
    if (!employees || !totalAssets || !sales) {
      alert('STEP1の従業員数、総資産、売上高を選択してください。');
      return;
    }

    // バリデーション: STEP2の必須項目チェック
    if (!currentPeriodNetAsset || !netAssetTaxValue || !currentPeriodProfit) {
      alert('STEP2の直前期の純資産、相続税評価額による純資産、直前期の利益を入力してください。');
      return;
    }

    // バリデーション: STEP3の出資者情報チェック
    const validInvestors = investors.filter((inv) => inv.name || inv.amount);
    if (validInvestors.length === 0) {
      alert('STEP3の出資者情報を入力してください。');
      return;
    }

    const formData = {
      employees,
      totalAssets,
      sales,
      currentPeriodNetAsset: parseFloat(currentPeriodNetAsset) || 0,
      previousPeriodNetAsset: parseFloat(previousPeriodNetAsset) || 0,
      netAssetTaxValue: parseFloat(netAssetTaxValue) || 0,
      currentPeriodProfit: parseFloat(currentPeriodProfit) || 0,
      previousPeriodProfit: parseFloat(previousPeriodProfit) || 0,
      previousPreviousPeriodProfit: parseFloat(previousPreviousPeriodProfit) || 0,
      investors: validInvestors,
    };

    // localStorageに保存
    localStorage.setItem('formData', JSON.stringify(formData));

    // 結果ページへ遷移
    router.push('/results');
  };

  return (
    <div>
      <Header />

      <p>医療法人の出資持分の評価額の概算を知りたい方向けのツールです。</p>

      <div className="mt-10 mb-5">
        <h2 className="text-2xl font-bold mt-8">本ツールの目的</h2>
        <ul className="list-disc ml-6">
          <li>持分あり医療法人を経営しており、相続発生時の概算を知りたい</li>
          <li>正確でなくてもよいので、まずは目安を把握したい</li>
          <li>決算書・出資者名簿が手元にある</li>
        </ul>
      </div>

      <div className="mt-10 mb-5">
        <h2 className="text-2xl font-bold mt-8">ご用意いただくもの</h2>
        <ul className="list-disc ml-6">
          <li>直近3期分の決算書</li>
          <li>出資者名簿</li>
        </ul>
        <p className="text-sm text-gray-600 mt-3 mb-5">
          ※ 正確な評価額を算出するには、税理士等の専門家へご相談ください。
        </p>
      </div>

      {/* STEP1 */}
      <Step1CompanySize
        employees={employees}
        setEmployees={setEmployees}
        totalAssets={totalAssets}
        setTotalAssets={setTotalAssets}
        sales={sales}
        setSales={setSales}
      />

      {/* STEP2 */}
      <Step2FinancialData
        currentPeriodNetAsset={currentPeriodNetAsset}
        setCurrentPeriodNetAsset={setCurrentPeriodNetAsset}
        previousPeriodNetAsset={previousPeriodNetAsset}
        setPreviousPeriodNetAsset={setPreviousPeriodNetAsset}
        netAssetTaxValue={netAssetTaxValue}
        setNetAssetTaxValue={setNetAssetTaxValue}
        currentPeriodProfit={currentPeriodProfit}
        setCurrentPeriodProfit={setCurrentPeriodProfit}
        previousPeriodProfit={previousPeriodProfit}
        setPreviousPeriodProfit={setPreviousPeriodProfit}
        previousPreviousPeriodProfit={previousPreviousPeriodProfit}
        setPreviousPreviousPeriodProfit={setPreviousPreviousPeriodProfit}
        copyToTaxValue={copyToTaxValue}
      />

      {/* STEP3 */}
      <Step3Investors
        investors={investors}
        updateInvestor={updateInvestor}
        addInvestorRow={addInvestorRow}
        totalInvestment={totalInvestment}
      />

      <div className="mt-10 mb-5">
        <Button
          variant="primary"
          className="text-base px-6 py-3"
          onClick={goToResults}
        >
          計算結果を確認する
        </Button>
      </div>
    </div>
  );
}
