import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createRecord, updateRecord } from '@/lib/api-utils';

export async function GET() {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT id, name FROM users ORDER BY name').all();
    return NextResponse.json(users);
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      idPrefix: 'user',
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '担当者の登録に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '担当者情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}
