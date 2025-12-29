import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      fiscalYear,
      companyName,
      personInCharge,
      employees,
      totalAssets,
      sales,
      currentPeriodNetAsset,
      previousPeriodNetAsset,
      netAssetTaxValue,
      currentPeriodProfit,
      previousPeriodProfit,
      previousPreviousPeriodProfit,
      investors,
    } = data;

    if (!id || !fiscalYear || !companyName || !personInCharge) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // トランザクション開始
    const transaction = db.transaction(() => {
      // 1. 会社の存在確認または作成
      let company = db.prepare('SELECT id FROM companies WHERE company_name = ?').get(companyName) as { id: string } | undefined;

      let companyId: string;
      if (!company) {
        companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(`
          INSERT INTO companies (id, company_name)
          VALUES (?, ?)
        `).run(companyId, companyName);
      } else {
        companyId = company.id;
      }

      // 2. 担当者の存在確認または作成
      let user = db.prepare('SELECT id FROM users WHERE name = ?').get(personInCharge) as { id: string } | undefined;

      let userId: string;
      if (!user) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(`
          INSERT INTO users (id, name)
          VALUES (?, ?)
        `).run(userId, personInCharge);
      } else {
        userId = user.id;
      }

      // 3. 既存の評価レコードをチェック
      const existing = db.prepare('SELECT id FROM valuations WHERE id = ?').get(id);

      if (existing) {
        // 更新
        db.prepare(`
          UPDATE valuations SET
            company_id = ?,
            user_id = ?,
            fiscal_year = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(companyId, userId, fiscalYear, id);

        // 財務データを更新
        db.prepare(`
          UPDATE financial_data SET
            employees = ?,
            total_assets = ?,
            sales = ?,
            current_period_net_asset = ?,
            previous_period_net_asset = ?,
            net_asset_tax_value = ?,
            current_period_profit = ?,
            previous_period_profit = ?,
            previous_previous_period_profit = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE valuation_id = ?
        `).run(
          employees,
          totalAssets,
          sales,
          currentPeriodNetAsset,
          previousPeriodNetAsset,
          netAssetTaxValue,
          currentPeriodProfit,
          previousPeriodProfit,
          previousPreviousPeriodProfit,
          id
        );

        // 既存の投資家データを削除して再作成
        db.prepare('DELETE FROM investors WHERE valuation_id = ?').run(id);
      } else {
        // 新規作成
        db.prepare(`
          INSERT INTO valuations (
            id,
            company_id,
            user_id,
            fiscal_year
          ) VALUES (?, ?, ?, ?)
        `).run(id, companyId, userId, fiscalYear);

        // 財務データを作成
        db.prepare(`
          INSERT INTO financial_data (
            valuation_id,
            employees,
            total_assets,
            sales,
            current_period_net_asset,
            previous_period_net_asset,
            net_asset_tax_value,
            current_period_profit,
            previous_period_profit,
            previous_previous_period_profit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          employees,
          totalAssets,
          sales,
          currentPeriodNetAsset,
          previousPeriodNetAsset,
          netAssetTaxValue,
          currentPeriodProfit,
          previousPeriodProfit,
          previousPreviousPeriodProfit
        );
      }

      // 投資家データを挿入
      if (investors && Array.isArray(investors)) {
        const investorStmt = db.prepare(`
          INSERT INTO investors (
            valuation_id,
            investor_name,
            shares_held,
            shareholding_ratio
          ) VALUES (?, ?, ?, ?)
        `);

        // 総出資金額を計算
        const totalAmount = investors.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        for (const investor of investors) {
          const amount = investor.amount || 0;
          const ratio = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

          investorStmt.run(
            id,
            investor.name || '',
            amount,
            ratio
          );
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'データを保存しました' });
  } catch (error) {
    console.error('データベースエラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'データの保存に失敗しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const db = getDatabase();

    if (id) {
      // 特定のIDのデータを取得
      const valuation = db.prepare(`
        SELECT
          v.id,
          v.fiscal_year,
          v.created_at,
          v.updated_at,
          c.company_name,
          u.name as person_in_charge
        FROM valuations v
        JOIN companies c ON v.company_id = c.id
        JOIN users u ON v.user_id = u.id
        WHERE v.id = ?
      `).get(id) as any;

      if (!valuation) {
        return NextResponse.json(
          { error: 'データが見つかりません' },
          { status: 404 }
        );
      }

      // 財務データを取得
      const financialData = db.prepare(`
        SELECT
          employees,
          total_assets,
          sales,
          current_period_net_asset,
          previous_period_net_asset,
          net_asset_tax_value,
          current_period_profit,
          previous_period_profit,
          previous_previous_period_profit
        FROM financial_data
        WHERE valuation_id = ?
      `).get(id) as any;

      // 投資家データを取得
      const investors = db.prepare(`
        SELECT
          investor_name,
          shares_held,
          shareholding_ratio
        FROM investors
        WHERE valuation_id = ?
      `).all(id);

      const result = {
        id: valuation.id,
        fiscalYear: valuation.fiscal_year,
        companyName: valuation.company_name,
        personInCharge: valuation.person_in_charge,
        employees: financialData?.employees || '',
        totalAssets: financialData?.total_assets || '',
        sales: financialData?.sales || '',
        currentPeriodNetAsset: financialData?.current_period_net_asset || 0,
        previousPeriodNetAsset: financialData?.previous_period_net_asset || 0,
        netAssetTaxValue: financialData?.net_asset_tax_value || 0,
        currentPeriodProfit: financialData?.current_period_profit || 0,
        previousPeriodProfit: financialData?.previous_period_profit || 0,
        previousPreviousPeriodProfit: financialData?.previous_previous_period_profit || 0,
        investors: investors.map((inv: any) => ({
          name: inv.investor_name,
          amount: inv.shares_held,
        })),
        created_at: valuation.created_at,
        updated_at: valuation.updated_at,
      };

      return NextResponse.json(result);
    } else {
      // 全データを取得
      const valuations = db.prepare(`
        SELECT
          v.id,
          v.fiscal_year,
          v.created_at,
          v.updated_at,
          c.company_name,
          u.name as person_in_charge
        FROM valuations v
        JOIN companies c ON v.company_id = c.id
        JOIN users u ON v.user_id = u.id
        ORDER BY v.updated_at DESC
      `).all();

      const results = valuations.map((valuation: any) => {
        // 各評価の財務データを取得
        const financialData = db.prepare(`
          SELECT
            employees,
            total_assets,
            sales,
            current_period_net_asset,
            previous_period_net_asset,
            net_asset_tax_value,
            current_period_profit,
            previous_period_profit,
            previous_previous_period_profit
          FROM financial_data
          WHERE valuation_id = ?
        `).get(valuation.id) as any;

        // 各評価の投資家データを取得
        const investors = db.prepare(`
          SELECT
            investor_name,
            shares_held,
            shareholding_ratio
          FROM investors
          WHERE valuation_id = ?
        `).all(valuation.id);

        return {
          id: valuation.id,
          fiscalYear: valuation.fiscal_year,
          companyName: valuation.company_name,
          personInCharge: valuation.person_in_charge,
          employees: financialData?.employees || '',
          totalAssets: financialData?.total_assets || '',
          sales: financialData?.sales || '',
          currentPeriodNetAsset: financialData?.current_period_net_asset || 0,
          previousPeriodNetAsset: financialData?.previous_period_net_asset || 0,
          netAssetTaxValue: financialData?.net_asset_tax_value || 0,
          currentPeriodProfit: financialData?.current_period_profit || 0,
          previousPeriodProfit: financialData?.previous_period_profit || 0,
          previousPreviousPeriodProfit: financialData?.previous_previous_period_profit || 0,
          investors: investors.map((inv: any) => ({
            name: inv.investor_name,
            amount: inv.shares_held,
          })),
          created_at: valuation.created_at,
          updated_at: valuation.updated_at,
        };
      });

      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
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
        { error: 'IDが指定されていません' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // データの存在確認
    const existing = db.prepare('SELECT id FROM valuations WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'データが見つかりません' },
        { status: 404 }
      );
    }

    // 削除
    const stmt = db.prepare('DELETE FROM valuations WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true, message: 'データを削除しました' });
  } catch (error) {
    console.error('データベースエラー:', error);
    return NextResponse.json(
      { error: 'データの削除に失敗しました' },
      { status: 500 }
    );
  }
}
