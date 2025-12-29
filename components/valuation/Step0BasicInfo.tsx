import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { toWareki } from '@/lib/date-utils';

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
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(false);
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [isCompanySelectModalOpen, setIsCompanySelectModalOpen] = useState(false);
    const [isCompanyFormModalOpen, setIsCompanyFormModalOpen] = useState(false);
    const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create');
    const [companyFormMode, setCompanyFormMode] = useState<'create' | 'edit'>('create');
    const [userName, setUserName] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');

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

    // 担当者選択モーダルを開く
    const handleOpenUserSelectModal = () => {
        setIsUserSelectModalOpen(true);
    };

    // 担当者を選択
    const handleSelectUser = (selectedUserName: string) => {
        setPersonInCharge(selectedUserName);
        setIsUserSelectModalOpen(false);
    };

    // 担当者登録モーダルを開く（選択モーダルから）
    const handleOpenCreateUserModal = () => {
        setIsUserSelectModalOpen(false);
        setUserFormMode('create');
        setUserName('');
        setIsUserFormModalOpen(true);
    };

    // 会社選択モーダルを開く
    const handleOpenCompanySelectModal = () => {
        setIsCompanySelectModalOpen(true);
    };

    // 会社を選択
    const handleSelectCompany = (selectedCompanyName: string) => {
        setCompanyName(selectedCompanyName);
        setIsCompanySelectModalOpen(false);
    };

    // 会社登録モーダルを開く（選択モーダルから）
    const handleOpenCreateCompanyModal = () => {
        setIsCompanySelectModalOpen(false);
        setCompanyFormMode('create');
        setCompanyNameInput('');
        setIsCompanyFormModalOpen(true);
    };

    // 担当者登録
    const handleCreateUser = async () => {
        if (!userName.trim()) {
            alert('担当者名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '担当者を登録しました');
                await fetchUsers();
                setPersonInCharge(userName);
                setIsUserFormModalOpen(false);
            } else {
                alert(result.error || '担当者の登録に失敗しました');
            }
        } catch (error) {
            console.error('担当者登録エラー:', error);
            alert('担当者の登録に失敗しました。' + (error instanceof Error ? error.message : ''));
        }
    };

    // 担当者修正
    const handleUpdateUser = async () => {
        if (!userName.trim()) {
            alert('担当者名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedUserId, name: userName }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '担当者情報を更新しました');
                await fetchUsers();
                setPersonInCharge(userName);
                setIsUserFormModalOpen(false);
            } else {
                alert(result.error || '担当者情報の更新に失敗しました');
            }
        } catch (error) {
            console.error('担当者更新エラー:', error);
            alert('担当者情報の更新に失敗しました。' + (error instanceof Error ? error.message : ''));
        }
    };

    // 会社登録
    const handleCreateCompany = async () => {
        if (!companyNameInput.trim()) {
            alert('会社名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_name: companyNameInput }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '会社を登録しました');
                await fetchCompanies();
                setCompanyName(companyNameInput);
                setIsCompanyFormModalOpen(false);
            } else {
                alert(result.error || '会社の登録に失敗しました');
            }
        } catch (error) {
            console.error('会社登録エラー:', error);
            alert('会社の登録に失敗しました。' + (error instanceof Error ? error.message : ''));
        }
    };

    // 会社修正
    const handleUpdateCompany = async () => {
        if (!companyNameInput.trim()) {
            alert('会社名を入力してください');
            return;
        }

        try {
            const response = await fetch('/api/companies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCompanyId, company_name: companyNameInput }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '会社情報を更新しました');
                await fetchCompanies();
                setCompanyName(companyNameInput);
                setIsCompanyFormModalOpen(false);
            } else {
                alert(result.error || '会社情報の更新に失敗しました');
            }
        } catch (error) {
            console.error('会社更新エラー:', error);
            alert('会社情報の更新に失敗しました。' + (error instanceof Error ? error.message : ''));
        }
    };

    // ユーザーモーダルの送信処理
    const handleUserSubmit = () => {
        if (userFormMode === 'create') {
            handleCreateUser();
        } else {
            handleUpdateUser();
        }
    };

    // 会社モーダルの送信処理
    const handleCompanySubmit = () => {
        if (companyFormMode === 'create') {
            handleCreateCompany();
        } else {
            handleUpdateCompany();
        }
    };

    return (
        <div className="card">
            <h2 className="mt-0">STEP０．基本情報を入力する</h2>
            <table>
                <tbody>
                    <tr>
                        <th className="text-left w-1/4">項目</th>
                        <th className="text-left">入力</th>
                    </tr>
                    <tr>
                        <td>会社名</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {companyName || '未選択'}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenCompanySelectModal}
                                    className="btn btn-primary"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    会社を選択
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>年度</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select
                                    value={fiscalYear}
                                    onChange={(e) => setFiscalYear(e.target.value)}
                                    style={{ flex: 1 }}
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
                                    className="btn btn-primary"
                                    style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                                >
                                    類似業種データ設定
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>担当者</td>
                        <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {personInCharge || '未選択'}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenUserSelectModal}
                                    className="btn btn-primary"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    担当者を選択
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 担当者選択モーダル */}
            {isUserSelectModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setIsUserSelectModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            minWidth: '500px',
                            maxWidth: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>担当者を選択</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <button
                                type="button"
                                onClick={handleOpenCreateUserModal}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                新規担当者登録
                            </button>
                        </div>

                        {users.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                登録されている担当者がいません。新規登録してください。
                            </p>
                        ) : (
                            <div>
                                <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                                    登録済み担当者一覧:
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleSelectUser(user.name)}
                                                className="btn btn-secondary"
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    backgroundColor: personInCharge === user.name ? '#e0e7ff' : 'white',
                                                    border: personInCharge === user.name ? '2px solid #4f46e5' : '1px solid #ddd',
                                                }}
                                            >
                                                {user.name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsUserSelectModalOpen(false);
                                                    setUserFormMode('edit');
                                                    setSelectedUserId(user.id);
                                                    setUserName(user.name);
                                                    setIsUserFormModalOpen(true);
                                                }}
                                                className="btn btn-secondary"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                修正
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setIsUserSelectModalOpen(false)}
                                className="btn btn-secondary"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 担当者登録・修正モーダル */}
            {isUserFormModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setIsUserFormModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            minWidth: '400px',
                            maxWidth: '90%',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>
                            {userFormMode === 'create' ? '担当者登録' : '担当者修正'}
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>
                                担当者名
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="担当者名を入力してください"
                                style={{ width: '100%' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUserSubmit();
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setIsUserFormModalOpen(false)}
                                className="btn btn-secondary"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={handleUserSubmit}
                                className="btn btn-primary"
                            >
                                {userFormMode === 'create' ? '登録' : '更新'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 会社選択モーダル */}
            {isCompanySelectModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setIsCompanySelectModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            minWidth: '500px',
                            maxWidth: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>会社を選択</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <button
                                type="button"
                                onClick={handleOpenCreateCompanyModal}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                新規会社登録
                            </button>
                        </div>

                        {companies.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                登録されている会社がありません。新規登録してください。
                            </p>
                        ) : (
                            <div>
                                <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                                    登録済み会社一覧:
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {companies.map((company) => (
                                        <div
                                            key={company.id}
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleSelectCompany(company.company_name)}
                                                className="btn btn-secondary"
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    backgroundColor: companyName === company.company_name ? '#e0e7ff' : 'white',
                                                    border: companyName === company.company_name ? '2px solid #4f46e5' : '1px solid #ddd',
                                                }}
                                            >
                                                {company.company_name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCompanySelectModalOpen(false);
                                                    setCompanyFormMode('edit');
                                                    setSelectedCompanyId(company.id);
                                                    setCompanyNameInput(company.company_name);
                                                    setIsCompanyFormModalOpen(true);
                                                }}
                                                className="btn btn-secondary"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                修正
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setIsCompanySelectModalOpen(false)}
                                className="btn btn-secondary"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 会社登録・修正モーダル */}
            {isCompanyFormModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setIsCompanyFormModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            minWidth: '400px',
                            maxWidth: '90%',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>
                            {companyFormMode === 'create' ? '会社登録' : '会社修正'}
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>
                                会社名
                            </label>
                            <input
                                type="text"
                                value={companyNameInput}
                                onChange={(e) => setCompanyNameInput(e.target.value)}
                                placeholder="会社名を入力してください"
                                style={{ width: '100%' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCompanySubmit();
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setIsCompanyFormModalOpen(false)}
                                className="btn btn-secondary"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={handleCompanySubmit}
                                className="btn btn-primary"
                            >
                                {companyFormMode === 'create' ? '登録' : '更新'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
