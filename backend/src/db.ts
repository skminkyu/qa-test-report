import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'qa_reports.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS testers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      phone TEXT,
      signature_image TEXT,
      is_team_leader INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS test_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      default_result TEXT,
      standard TEXT,
      method TEXT
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_no TEXT UNIQUE,
      receipt_date TEXT,
      company TEXT,
      issue_date TEXT,
      sequence INTEGER DEFAULT 1,
      tester_id INTEGER,
      product_name TEXT,
      equipment_notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (tester_id) REFERENCES testers(id)
    );

    CREATE TABLE IF NOT EXISTS report_test_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      test_item_name TEXT,
      test_method TEXT,
      test_result TEXT,
      test_standard TEXT,
      detail_method TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS report_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      image_data TEXT,
      caption TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);

  seedData(db);
}

function seedData(db: Database.Database): void {
  const testerCount = (db.prepare('SELECT COUNT(*) as cnt FROM testers').get() as { cnt: number }).cnt;
  if (testerCount === 0) {
    const insertTester = db.prepare(
      'INSERT INTO testers (code, name, title, email, phone, is_team_leader) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const testers = [
      ['01', '임인성', '임인성 팀장', 'lim@skstoa.com', '010-0001-0001', 1],
      ['02', '이주빈', '이주빈 매니저', 'lee.jubin@skstoa.com', '010-0001-0002', 0],
      ['03', '김민주', '김민주 매니저', 'kim.minju@skstoa.com', '010-0001-0003', 0],
      ['04', '윤효신', '윤효신 매니저', 'yoon@skstoa.com', '010-0001-0004', 0],
      ['05', '장현식', '장현식 매니저', 'jang@skstoa.com', '010-0001-0005', 0],
      ['06', '이석호', '이석호 매니저', 'lee.seokho@skstoa.com', '010-0001-0006', 0],
      ['07', '김민규', '김민규 매니저', 'kim.mingyu@skstoa.com', '010-0001-0007', 0],
      ['08', '방수교', '방수교 매니저', 'bang@skstoa.com', '010-0001-0008', 0],
      ['09', '박세라', '박세라 매니저', 'park@skstoa.com', '010-0001-0009', 0],
      ['10', '안연진', '안연진 매니저', 'ahn@skstoa.com', '010-0001-0010', 0],
    ];
    for (const t of testers) {
      insertTester.run(...t);
    }
  }

  const itemCount = (db.prepare('SELECT COUNT(*) as cnt FROM test_items').get() as { cnt: number }).cnt;
  if (itemCount === 0) {
    const insertItem = db.prepare(
      'INSERT INTO test_items (name, code, default_result, standard, method) VALUES (?, ?, ?, ?, ?)'
    );
    const items = [
      ['배송온도', 'STQ 23:01', '적합', '냉장: 0~10℃ / 냉동: -18℃ 이하', '디지털 온도계 측정'],
      ['배송 낙하테스트', 'STQ 23:02', '적합', '포장 파손 없음', '낙하 후 육안 검사'],
      ['형광유무', 'STQ 23:03', '음성', '형광물질 불검출', '형광증백제 검사지 사용'],
      ['제품의 중량', 'STQ 23:04', '적합', '표시중량 ±5% 이내', '전자저울 측정'],
      ['당도', 'STQ 23:05', '적합', '규격 기준 이상', '굴절당도계 측정'],
      ['돼지고기 원산지 판별', 'STQ 23:06', '적합', '표시원산지 일치', 'PCR 검사'],
      ['라돈 측정', 'STQ 23:07', '적합', '200 Bq/m³ 이하', '라돈 측정기 사용'],
      ['소비전력 측정', 'STQ 23:08', '적합', '표시전력 ±10% 이내', '전력분석기 측정'],
      ['스테인리스 종류분석', 'STQ 23:09', '적합', 'SUS 304 이상', 'XRF 분석'],
      ['내열/내한', 'STQ 23:10', '적합', '내열 100℃ / 내한 -20℃', '항온항습기 테스트'],
      ['완제품 세탁평가', 'STQ 23:11', '적합', '세탁 후 형태 변형 없음', '세탁기 세탁 후 육안 검사'],
      ['식세척기 사용 적합여부', 'STQ 23:12', '적합', '세척 후 변형 없음', '식기세척기 세척 후 육안 검사'],
      ['세균수', 'STQ 23:13', '적합', '1,000 CFU/g 이하', '평판도말법'],
      ['동작 시험', 'STQ 23:14', '적합', '정상 동작', '동작 확인'],
      ['성능 시험', 'STQ 26:01', '적합', '성능 기준 이상', '성능 측정'],
    ];
    for (const item of items) {
      insertItem.run(...item);
    }
  }
}

export default getDb;
