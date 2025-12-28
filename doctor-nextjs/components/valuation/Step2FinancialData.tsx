import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';

type Props = {
    currentPeriodNetAsset: string;
    setCurrentPeriodNetAsset: (value: string) => void;
    previousPeriodNetAsset: string;
    setPreviousPeriodNetAsset: (value: string) => void;
    netAssetTaxValue: string;
    setNetAssetTaxValue: (value: string) => void;
    currentPeriodProfit: string;
    setCurrentPeriodProfit: (value: string) => void;
    previousPeriodProfit: string;
    setPreviousPeriodProfit: (value: string) => void;
    previousPreviousPeriodProfit: string;
    setPreviousPreviousPeriodProfit: (value: string) => void;
    copyToTaxValue: () => void;
};

export default function Step2FinancialData({
    currentPeriodNetAsset,
    setCurrentPeriodNetAsset,
    previousPeriodNetAsset,
    setPreviousPeriodNetAsset,
    netAssetTaxValue,
    setNetAssetTaxValue,
    currentPeriodProfit,
    setCurrentPeriodProfit,
    previousPeriodProfit,
    setPreviousPeriodProfit,
    previousPreviousPeriodProfit,
    setPreviousPreviousPeriodProfit,
    copyToTaxValue,
}: Props) {
    const [showPopup1, setShowPopup1] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);

    return (
        <div className="mt-10 mb-5">
            <h2 className="text-2xl font-bold mt-8">
                STEP2．決算書より医療法人の財務データを入力【単位:円】
            </h2>
            <table className="border-collapse w-full mt-3">
                <thead>
                    <tr>
                        <th className="border border-gray-400 bg-gray-100 p-2 text-left">
                            項目
                        </th>
                        <th className="border border-gray-400 bg-gray-100 p-2 text-center">
                            直前期
                        </th>
                        <th className="border border-gray-400 bg-gray-100 p-2 text-center">
                            直前々期
                        </th>
                        <th className="border border-gray-400 bg-gray-100 p-2 text-center">
                            直前々々期
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 text-left">
                            「貸借対照表」の「純資産の部（又は資本の部）合計」の金額（注１）
                            <Button
                                variant="primary"
                                className="ml-2 text-xs !px-2 !py-1"
                                onClick={() => setShowPopup1(!showPopup1)}
                            >
                                正確な評価
                            </Button>
                            {showPopup1 && (
                                <div className="absolute bg-gray-50 border border-gray-400 p-3 rounded mt-2 text-xs max-w-md z-10">
                                    <button
                                        type="button"
                                        className="absolute top-1 right-2 text-gray-600 hover:text-gray-900 font-bold text-lg"
                                        onClick={() => setShowPopup1(false)}
                                    >
                                        ×
                                    </button>
                                    もしくは
                                    <br />
                                    法人税申告書の別表五(一)上、「Ⅰ利益積立金額」及び
                                    <br />
                                    「Ⅱ資本金等の額」の各「差引翌期首現在」列 「差引合計額」行の合計額
                                </div>
                            )}
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={currentPeriodNetAsset}
                                onValueChange={(values) => setCurrentPeriodNetAsset(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={previousPeriodNetAsset}
                                onValueChange={(values) => setPreviousPeriodNetAsset(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right bg-gray-100">
                            <input
                                type="number"
                                className="w-full p-1 box-border bg-gray-100 text-gray-400 cursor-not-allowed"
                                disabled
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 text-left">
                            貸借対照表の各勘定科目の金額について、相続税評価額とした金額を基に計算した
                            <br />
                            「純資産」の金額を上書き入力してください。
                            <Button
                                variant="primary"
                                className="ml-2 text-xs !px-2 !py-1"
                                onClick={copyToTaxValue}
                            >
                                複写
                            </Button>
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={netAssetTaxValue}
                                onValueChange={(values) => setNetAssetTaxValue(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right bg-gray-100">
                            <input
                                type="number"
                                className="w-full p-1 box-border bg-gray-100 text-gray-400 cursor-not-allowed"
                                disabled
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right bg-gray-100">
                            <input
                                type="number"
                                className="w-full p-1 box-border bg-gray-100 text-gray-400 cursor-not-allowed"
                                disabled
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 text-left">
                            「損益計算書」の「税引前当期純利益」の金額
                            <Button
                                variant="primary"
                                className="ml-2 text-xs !px-2 !py-1"
                                onClick={() => setShowPopup2(!showPopup2)}
                            >
                                正確な評価
                            </Button>
                            {showPopup2 && (
                                <div className="absolute bg-gray-50 border border-gray-400 p-3 rounded mt-2 text-xs max-w-md z-10">
                                    <button
                                        type="button"
                                        className="absolute top-1 right-2 text-gray-600 hover:text-gray-900 font-bold text-lg"
                                        onClick={() => setShowPopup2(false)}
                                    >
                                        ×
                                    </button>
                                    もしくは
                                    <br />
                                    法人税申告書上の「所得金額」に下記の金額を加減算した金額を入力してください。
                                    <br />
                                    ・受取配当等の益金不算入の金額は加算
                                    <br />
                                    ・繰越欠損金のうち損金算入した金額は加算
                                    <br />
                                    ・非経常的な利益の金額は減算
                                </div>
                            )}
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={currentPeriodProfit}
                                onValueChange={(values) => setCurrentPeriodProfit(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={previousPeriodProfit}
                                onValueChange={(values) => setPreviousPeriodProfit(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                            <NumericFormat
                                className="w-full p-1 box-border text-right"
                                value={previousPreviousPeriodProfit}
                                onValueChange={(values) => setPreviousPreviousPeriodProfit(values.value)}
                                thousandSeparator={true}
                                allowNegative={true}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <p className="text-sm text-gray-600 mt-3 mb-5">
                （注１）
                <br />
                「貸借対照表」の「純資産の部（又は資本の部）合計」の金額に、
                <br />
                ・賞与引当金、退職給付引当金等の税務上損金にならない金額を加算
                <br />
                ・圧縮積立金、圧縮引当金等の金額を減算
                <br />
                した金額を使用するとより正確な試算が可能となります。
            </p>
        </div>
    );
}
