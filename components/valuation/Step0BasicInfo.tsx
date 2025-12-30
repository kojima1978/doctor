import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, Building2, CalendarDays, UserPen } from 'lucide-react';
import Modal from '@/components/Modal';
import { toWareki } from '@/lib/date-utils';
import { buttonStyle, btnHoverClass } from '@/lib/button-styles';

type User = {
    id: string;
    name: string;
};

type Company = {
    id: string;
    company_name: string;
};

type Props = {
    fiscalYear: string;
    setFiscalYear: (value: string) => void;
    companyName: string;
    setCompanyName: (value: string) => void;
    personInCharge: string;
    setPersonInCharge: (value: string) => void;
};

export default function Step0BasicInfo({
    fiscalYear,
    setFiscalYear,
    companyName,
    setCompanyName,
    personInCharge,
    setPersonInCharge,
}: Props) {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const buttonHoverClass = btnHoverClass;

    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = currentYear + 5; i >= currentYear - 5; i--) {
        yearOptions.push(i);
    }

    // ユーザー一覧を取得
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('ユーザー一覧の取得に失敗しました:', error);
        }
    };

    // 会社一覧を取得
    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error('会社一覧の取得に失敗しました:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, []);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="mt-0 mb-0">STEP０．基本情報を入力する</h2>
                <button
                    onClick={() => router.push('/saved-data')}
                    className={buttonHoverClass}
                    style={buttonStyle}
                >
                    <File size={20} />
                    読み込み
                </button>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th className="text-left w-1/4">項目</th>
                        <th className="text-left">入力</th>
                    </tr>
                    <tr>
                        <td>会社名</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                                <select
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    style={{ width: '200px' }}
                                >
                                    <option value="">選択してください</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.company_name}>
                                            {company.company_name}
                                        </option>
                                    ))}
                                </select>
                                <a
                                    href="/company-settings"
                                    className={buttonHoverClass}
                                    style={{ ...buttonStyle, textDecoration: 'none' }}
                                >
                                    <Building2 size={20} />
                                    会社マスタ設定
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>年度</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                                <select
                                    value={fiscalYear}
                                    onChange={(e) => setFiscalYear(e.target.value)}
                                    style={{ width: '200px' }}
                                >
                                    <option value="">選択してください</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year.toString()}>
                                            {toWareki(year)}年度
                                        </option>
                                    ))}
                                </select>
                                <a
                                    href="/similar-industry-settings"
                                    className={buttonHoverClass}
                                    style={{ ...buttonStyle, textDecoration: 'none' }}
                                >
                                    <CalendarDays size={20} />
                                    類似業種データ設定
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>担当者</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                                <select
                                    value={personInCharge}
                                    onChange={(e) => setPersonInCharge(e.target.value)}
                                    style={{ width: '200px' }}
                                >
                                    <option value="">選択してください</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.name}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                <a
                                    href="/user-settings"
                                    className={buttonHoverClass}
                                    style={{ ...buttonStyle, textDecoration: 'none' }}
                                >
                                    <UserPen size={20} />
                                    担当者マスタ設定
                                </a>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
