import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');

    if (fiscalYear) {
      // 特定年度のデータを取得
      const data = db
        .prepare('SELECT * FROM similar_industry_data WHERE fiscal_year = ?')
        .get(fiscalYear);

      if (!data) {
        // データが見つからない場合は0を返す
        return NextResponse.json({
          fiscal_year: fiscalYear,
          profit_per_share: 0,
          net_asset_per_share: 0,
          average_stock_price: 0,
        });
      }

      return NextResponse.json(data);
    } else {
      // 全年度のデータを取得
      const allData = db
        .prepare('SELECT * FROM similar_industry_data ORDER BY fiscal_year DESC')
        .all();
      return NextResponse.json(allData);
    }
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '類似業種データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fiscal_year, profit_per_share, net_asset_per_share, average_stock_price } =
      await request.json();

    if (!fiscal_year) {
      return NextResponse.json(
        { error: '年度を入力してください' },
        { status: 400 }
      );
    }

    if (
      profit_per_share === undefined ||
      net_asset_per_share === undefined ||
      average_stock_price === undefined
    ) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 既存チェック
    const existing = db
      .prepare('SELECT id FROM similar_industry_data WHERE fiscal_year = ?')
      .get(fiscal_year);

    if (existing) {
      return NextResponse.json(
        { error: 'この年度のデータは既に登録されています' },
        { status: 409 }
      );
    }

    // 新規作成
    const id = generateId('sim', 9);
    db.prepare(`
      INSERT INTO similar_industry_data (id, fiscal_year, profit_per_share, net_asset_per_share, average_stock_price)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, fiscal_year, profit_per_share, net_asset_per_share, average_stock_price);

    return NextResponse.json({
      success: true,
      message: '類似業種データを登録しました',
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '類似業種データの登録に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, fiscal_year, profit_per_share, net_asset_per_share, average_stock_price } =
      await request.json();

    if (!id || !fiscal_year) {
      return NextResponse.json(
        { error: 'IDと年度を入力してください' },
        { status: 400 }
      );
    }

    if (
      profit_per_share === undefined ||
      net_asset_per_share === undefined ||
      average_stock_price === undefined
    ) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 存在確認
    const existing = db
      .prepare('SELECT id FROM similar_industry_data WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'データが見つかりません' },
        { status: 404 }
      );
    }

    // 年度の重複チェック（自分以外）
    const duplicate = db
      .prepare('SELECT id FROM similar_industry_data WHERE fiscal_year = ? AND id != ?')
      .get(fiscal_year, id);

    if (duplicate) {
      return NextResponse.json(
        { error: 'この年度のデータは既に登録されています' },
        { status: 409 }
      );
    }

    // 更新
    db.prepare(`
      UPDATE similar_industry_data
      SET fiscal_year = ?, profit_per_share = ?, net_asset_per_share = ?, average_stock_price = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(fiscal_year, profit_per_share, net_asset_per_share, average_stock_price, id);

    return NextResponse.json({
      success: true,
      message: '類似業種データを更新しました',
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '類似業種データの更新に失敗しました' },
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
    const result = db.prepare('DELETE FROM similar_industry_data WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'データが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '類似業種データを削除しました',
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: '類似業種データの削除に失敗しました' },
      { status: 500 }
    );
  }
}
