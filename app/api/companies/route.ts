import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createRecord, updateRecord } from '@/lib/api-utils';

export async function GET() {
  try {
    const db = getDatabase();
    const companies = db.prepare('SELECT id, company_name, created_at, updated_at FROM companies ORDER BY company_name').all();
    return NextResponse.json(companies);
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '会社一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { company_name } = await request.json();

    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { error: '会社名を入力してください' },
        { status: 400 }
      );
    }

    return await createRecord({
      tableName: 'companies',
      nameField: 'company_name',
      data: { name: company_name },
      idPrefix: 'company',
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '会社の登録に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, company_name } = await request.json();

    if (!id || !company_name || !company_name.trim()) {
      return NextResponse.json(
        { error: 'IDと会社名を入力してください' },
        { status: 400 }
      );
    }

    return await updateRecord({
      tableName: 'companies',
      nameField: 'company_name',
      data: { id, name: company_name },
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '会社情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'IDを指定してください' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ message: '会社を削除しました' });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '会社の削除に失敗しました' },
      { status: 500 }
    );
  }
}
