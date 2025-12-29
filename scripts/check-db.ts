import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'doctor.db');
const db = new Database(dbPath);

console.log('=== テーブル一覧 ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\n=== valuations テーブルの構造 ===');
const columns = db.prepare('PRAGMA table_info(valuations)').all();
console.log(columns);

console.log('\n=== valuations テーブルのデータ ===');
const valuations = db.prepare('SELECT * FROM valuations LIMIT 5').all();
console.log(valuations);

console.log('\n=== companies テーブルのデータ ===');
const companies = db.prepare('SELECT * FROM companies LIMIT 5').all();
console.log(companies);

console.log('\n=== users テーブルのデータ ===');
const users = db.prepare('SELECT * FROM users LIMIT 5').all();
console.log(users);

console.log('\n=== JOINクエリのテスト ===');
const joined = db.prepare(`
  SELECT
    v.id,
    v.fiscal_year,
    c.company_name,
    u.name as person_in_charge
  FROM valuations v
  JOIN companies c ON v.company_id = c.id
  JOIN users u ON v.user_id = u.id
  LIMIT 3
`).all();
console.log(joined);

db.close();
