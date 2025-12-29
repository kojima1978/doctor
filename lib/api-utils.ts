import { NextResponse } from 'next/server';
import { getDatabase } from './db';
import { generateId } from './utils';

/**
 * 共通のCRUD操作ユーティリティ
 */

interface CreateOptions {
  tableName: string;
  nameField: string;
  data: { name: string };
  idPrefix: string;
}

interface UpdateOptions {
  tableName: string;
  nameField: string;
  data: { id: string; name: string };
}

/**
 * 新規レコード作成
 */
export async function createRecord(options: CreateOptions) {
  const { tableName, nameField, data, idPrefix } = options;
  const db = getDatabase();

  // 重複チェック
  const existing = db
    .prepare(`SELECT id FROM ${tableName} WHERE ${nameField} = ?`)
    .get(data.name);

  if (existing) {
    return NextResponse.json(
      { error: `${data.name}は既に登録されています` },
      { status: 400 }
    );
  }

  // 新規作成
  const id = generateId(idPrefix, 9);
  db.prepare(`INSERT INTO ${tableName} (id, ${nameField}) VALUES (?, ?)`).run(
    id,
    data.name
  );

  return NextResponse.json({
    success: true,
    message: `${data.name}を登録しました`,
  });
}

/**
 * レコード更新
 */
export async function updateRecord(options: UpdateOptions) {
  const { tableName, nameField, data } = options;
  const db = getDatabase();

  // 重複チェック（自分自身を除く）
  const existing = db
    .prepare(`SELECT id FROM ${tableName} WHERE ${nameField} = ? AND id != ?`)
    .get(data.name, data.id);

  if (existing) {
    return NextResponse.json(
      { error: `${data.name}は既に登録されています` },
      { status: 400 }
    );
  }

  // 更新
  db.prepare(
    `UPDATE ${tableName} SET ${nameField} = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`
  ).run(data.name, data.id);

  return NextResponse.json({
    success: true,
    message: `${data.name}に更新しました`,
  });
}
