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
        <div className="card">
            <h2 className="mt-0">STEP3．出資者名簿より出資者情報を入力【単位:円】</h2>
            <table>
                <thead>
                    <tr>
                        <th className="text-center w-16">№</th>
                        <th className="text-left">出資者名</th>
                        <th className="text-right">出資金額</th>
                    </tr>
                </thead>
                <tbody>
                    {investors.map((investor, index) => (
                        <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                                <input
                                    type="text"
                                    value={investor.name}
                                    onChange={(e) => updateInvestor(index, 'name', e.target.value)}
                                />
                            </td>
                            <td className="text-right">
                                <NumericFormat
                                    className="w-full px-3 py-2 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <td className="text-center">合計</td>
                        <td></td>
                        <td className="text-right">{totalInvestment.toLocaleString('ja-JP')}</td>
                    </tr>
                </tfoot>
            </table>

            <Button
                className="mt-4 text-sm px-4 py-2"
                onClick={addInvestorRow}
            >
                出資者を追加
            </Button>

            <p className="text-sm text-gray-600 mt-4">
                ※ 出資金額の合計は、貸借対照表の出資金（資本金）と一致させてください。
            </p>
        </div>
    );
}
