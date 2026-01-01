import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createRecord, updateRecord, withErrorHandler } from '@/lib/api-utils';

export async function GET() {
  return withErrorHandler(async () => {
    const db = getDatabase();
    const users = db.prepare('SELECT id, name, created_at, updated_at FROM users ORDER BY name').all();
    return NextResponse.json(users);
  }, 'ユーザー一覧の取得に失敗しました');
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '担当者名を入力してください' },
        { status: 400 }
      );
    }

    return await createRecord({
      tableName: 'users',
      nameField: 'name',
      data: { name },
    });
  }, '担当者の登録に失敗しました');
}

export async function PUT(request: NextRequest) {
  return withErrorHandler(async () => {
    const { id, name } = await request.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: 'IDと担当者名を入力してください' },
        { status: 400 }
      );
    }

    return await updateRecord({
      tableName: 'users',
      nameField: 'name',
      data: { id, name },
    });
  }, '担当者情報の更新に失敗しました');
}

export async function DELETE(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'IDを指定してください' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ message: '担当者を削除しました' });
  }, '担当者の削除に失敗しました');
}
