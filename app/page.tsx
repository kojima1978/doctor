'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Calculator } from 'lucide-react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Investor } from '@/lib/types';
import Step0BasicInfo from '@/components/valuation/Step0BasicInfo';
import Step1CompanySize from '@/components/valuation/Step1CompanySize';
import Step2FinancialData from '@/components/valuation/Step2FinancialData';
import Step3Investors from '@/components/valuation/Step3Investors';
import { useSaveValuation } from '@/hooks/useSaveValuation';
import { validateBasicInfo } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const { saveValuation, isSaving } = useSaveValuation();

  const [fiscalYear, setFiscalYear] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [employees, setEmployees] = useState('');
  const [totalAssets, setTotalAssets] = useState('');
  const [sales, setSales] = useState('');
  const [currentPeriodNetAsset, setCurrentPeriodNetAsset] = useState('');
  const [previousPeriodNetAsset, setPreviousPeriodNetAsset] = useState('');
  const [netAssetTaxValue, setNetAssetTaxValue] = useState('');
  const [currentPeriodProfit, setCurrentPeriodProfit] = useState('');
  const [previousPeriodProfit, setPreviousPeriodProfit] = useState('');
  const [previousPreviousPeriodProfit, setPreviousPreviousPeriodProfit] = useState('');
  const [investors, setInvestors] = useState<Investor[]>([
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 },
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setFiscalYear(data.fiscalYear || '');
        setCompanyName(data.companyName || '');
        setPersonInCharge(data.personInCharge || '');
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

  const addInvestorRow = () => {
    setInvestors([...investors, { name: '', amount: 0 }]);
  };

  const updateInvestor = (index: number, field: keyof Investor, value: string | number) => {
    const newInvestors = [...investors];
    newInvestors[index] = { ...newInvestors[index], [field]: value };
    setInvestors(newInvestors);
  };

  const totalInvestment = investors.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const copyToTaxValue = () => {
    if (currentPeriodNetAsset) {
      setNetAssetTaxValue(currentPeriodNetAsset);
    }
  };

  const saveToDatabase = async () => {
    const validation = validateBasicInfo({ fiscalYear, companyName, personInCharge });
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    if (!employees || !totalAssets || !sales) {
      alert('STEP1の従業員数、総資産、売上高を選択してください。');
      return;
    }

    if (!currentPeriodNetAsset || !netAssetTaxValue || !currentPeriodProfit) {
      alert('STEP2の直前期の純資産、相続税評価額による純資産、直前期の利益を入力してください。');
      return;
    }

    const validInvestors = investors.filter((inv) => inv.name || inv.amount);
    if (validInvestors.length === 0) {
      alert('STEP3の出資者情報を入力してください。');
      return;
    }

    const formData = {
      fiscalYear,
      companyName,
      personInCharge,
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

    const success = await saveValuation(formData);
    if (success) {
      alert('データをデータベースに保存しました。');
    } else {
      alert('データの保存に失敗しました。再度お試しください。');
    }
  };

  const goToResults = () => {
    if (!employees || !totalAssets || !sales) {
      alert('STEP1の従業員数、総資産、売上高を選択してください。');
      return;
    }

    if (!currentPeriodNetAsset || !netAssetTaxValue || !currentPeriodProfit) {
      alert('STEP2の直前期の純資産、相続税評価額による純資産、直前期の利益を入力してください。');
      return;
    }

    const validInvestors = investors.filter((inv) => inv.name || inv.amount);
    if (validInvestors.length === 0) {
      alert('STEP3の出資者情報を入力してください。');
      return;
    }

    const formData = {
      fiscalYear,
      companyName,
      personInCharge,
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

    localStorage.setItem('formData', JSON.stringify(formData));
    router.push('/results');
  };

  return (
    <div>
      <Header />

      <div className="card">
        <p className="text-lg mb-4">医療法人の出資持分の評価額の概算を知りたい方向けのツールです。</p>
        <Button onClick={() => router.push('/saved-data')}>
          保存データを読み込む
        </Button>
      </div>

      <div className="card">
        <h2 className="mt-0">本ツールの目的</h2>
        <ul className="list-disc ml-6 space-y-1 text-gray-700">
          <li>持分あり医療法人を経営しており、相続発生時の概算を知りたい</li>
          <li>正確でなくてもよいので、まずは目安を把握したい</li>
          <li>決算書・出資者名簿が手元にある</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="mt-0">ご用意いただくもの</h2>
        <ul className="list-disc ml-6 space-y-1 text-gray-700">
          <li>直近3期分の決算書</li>
          <li>出資者名簿</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          ※ 正確な評価額を算出するには、税理士等の専門家へご相談ください。
        </p>
      </div>

      <Step0BasicInfo
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        companyName={companyName}
        setCompanyName={setCompanyName}
        personInCharge={personInCharge}
        setPersonInCharge={setPersonInCharge}
      />

      <Step1CompanySize
        employees={employees}
        setEmployees={setEmployees}
        totalAssets={totalAssets}
        setTotalAssets={setTotalAssets}
        sales={sales}
        setSales={setSales}
      />

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

      <Step3Investors
        investors={investors}
        updateInvestor={updateInvestor}
        addInvestorRow={addInvestorRow}
        totalInvestment={totalInvestment}
      />

      <div className="flex gap-4 mt-8">
        <Button onClick={saveToDatabase} className="flex items-center gap-2">
          <Save size={20} />
          保存
        </Button>
        <Button onClick={goToResults} className="flex items-center gap-2">
          <Calculator size={20} />
          計算結果を確認する
        </Button>
      </div>
    </div>
  );
}
