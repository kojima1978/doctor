import React from 'react';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';
import { Investor } from '@/lib/types';

type Props = {
    investors: Investor[];
    updateInvestor: (index: number, field: keyof Investor, value: string | number) => void;
    addInvestorRow: () => void;
    totalInvestment: number;
};

export default function Step3Investors({
    investors,
    updateInvestor,
    addInvestorRow,
    totalInvestment,
}: Props) {
    return (
        <div className="mt-10 mb-5">
            <h2 className="text-2xl font-bold mt-8">
                STEP3．出資者名簿より出資者情報を入力【単位:円】
            </h2>
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
                    </tr>
                </thead>
                <tbody>
                    {investors.map((investor, index) => (
                        <tr key={index}>
                            <td className="border border-gray-400 p-2 text-center">
                                {index + 1}
                            </td>
                            <td className="border border-gray-400 p-2 text-left">
                                <input
                                    type="text"
                                    className="w-full p-1 box-border"
                                    value={investor.name}
                                    onChange={(e) => updateInvestor(index, 'name', e.target.value)}
                                />
                            </td>
                            <td className="border border-gray-400 p-2 text-right">
                                <NumericFormat
                                    className="w-full p-1 box-border text-right"
                                    value={investor.amount || ''}
                                    onValueChange={(values) =>
                                        updateInvestor(index, 'amount', values.floatValue || 0)
                                    }
                                    thousandSeparator={true}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td className="border border-gray-400 p-2 text-center">合計</td>
                        <td className="border border-gray-400 p-2"></td>
                        <td className="border border-gray-400 p-2 text-right">
                            {totalInvestment.toLocaleString('ja-JP')}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <Button
                variant="primary"
                className="mt-3 mb-5 text-sm px-4 py-2"
                onClick={addInvestorRow}
            >
                ＋ 出資者を追加
            </Button>

            <p className="text-sm text-gray-600 mt-3 mb-5">
                ※ 出資金額の合計は、貸借対照表の出資金（資本金）と一致させてください。
            </p>
        </div>
    );
}
