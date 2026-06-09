import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DB_DIR || path.join(__dirname, '..');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'qa_reports.db');

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
      code TEXT NOT NULL, name TEXT NOT NULL, title TEXT,
      email TEXT, phone TEXT, signature_image TEXT, is_team_leader INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS test_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, code TEXT NOT NULL,
      default_result TEXT, standard TEXT, method TEXT
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_no TEXT UNIQUE, receipt_date TEXT, company TEXT,
      issue_date TEXT, sequence INTEGER DEFAULT 1, tester_id INTEGER,
      product_name TEXT, equipment_notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (tester_id) REFERENCES testers(id)
    );
    CREATE TABLE IF NOT EXISTS report_test_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL, test_item_name TEXT, test_method TEXT,
      test_result TEXT, test_standard TEXT, detail_method TEXT, sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS report_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL, image_data TEXT, caption TEXT, sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);
  seedData(db);
}

function seedData(db: Database.Database): void {
  const testerCount = (db.prepare('SELECT COUNT(*) as cnt FROM testers').get() as { cnt: number }).cnt;
  if (testerCount === 0) {
    const ins = db.prepare('INSERT INTO testers (code, name, title, email, phone, is_team_leader) VALUES (?, ?, ?, ?, ?, ?)');
    [
      ['01', '임인성', '임인성 팀장', 'inseong@sk.con', '010-2613-2729', 1],
      ['02', '이주빈', '이주빈 매니저', 'dlwnals89@sk.c', '010-4942-8582', 0],
      ['03', '김민주', '김민주 매니저', 'minju212@sk.cc', '010-6559-7943', 0],
      ['04', '윤효신', '윤효신 매니저', 'hyoshin1105@sl', '010-9288-9207', 0],
      ['05', '장현식', '장현식 매니저', 'hyunsikkk@sk.c', '010-5002-1777', 0],
      ['06', '이석호', '이석호 매니저', 'seok7kr@sk.com', '010-8380-2697', 0],
      ['07', '김민규', '김민규 매니저', 'skyminkk@sk.cc', '010-7109-3699', 0],
      ['08', '방수교', '방수교 매니저', 'tnry04@sk.com', '010-3913-3098', 0],
      ['09', '박세라', '박세라 매니저', 'sarah.park@sk.', '010-9218-6419', 0],
      ['10', '안연진', '안연진 매니저', 'yjahn14@sk.con', '010-5238-8011', 0],
    ].forEach(t => ins.run(...t));
  }
  const itemCount = (db.prepare('SELECT COUNT(*) as cnt FROM test_items').get() as { cnt: number }).cnt;
  if (itemCount === 0) {
    const ins = db.prepare('INSERT INTO test_items (name, code, default_result, standard, method) VALUES (?, ?, ?, ?, ?)');
    [
      ['배송온도', 'STQ 23:01', '기준온도 이내 양호', '냉장: 영하1도 이하로 유지되어야 함 / 냉동: 영상5도 이하로 유지되어야 함', '측정기: Benetech GM320'],
      ['배송 낙하테스트', 'STQ 23:02', '이상없음', '외관, 내부 상품, 포장상태 이상없음', '보통 검시 (6회 낙하) / 파다로운 검사 (12회 낙하)'],
      ['형광유무', 'STQ 23:03', '형광을 나타내지 않음', '형광을 나타내지 않아야 함', '일반형광등에서 형광증백제 검출확인 / 장비명: RAY-DOC-D60'],
      ['제품의 중량', 'STQ 23:04', '○○○ g', '검교정 저울 측정', 'CAS SW-1S (20kg) / CAS MW-200 (비세)'],
      ['당도', 'STQ 23:05', '○○ Brix', '기준없음', '바파리 검사: SunForest H-100F 측정 / 파리 검사: ATAGO PAL-1 측정'],
      ['돼지고기 원산지 판별', 'STQ 23:06', '국내산', '기준없음', '원산지 판별 키트 검사 (Rapigen P30RVA1)'],
      ['라돈 측정', 'STQ 23:07', '○○○ Bq', '기준없음', '라돈측정경버 측정 (Radon Eye - RD 200)'],
      ['소비전력 측정치', 'STQ 23:08', '○○○ W', '기준없음', '소비전력 측정기 측정 (KORINS - KEM2500)'],
      ['스테인리스 종류분석', 'STQ 23:09', '○○○', '기준없음', 'XRF 기기 측정 (Olympus Vanta Series VCA)'],
      ['내열 / 내한', 'STQ 23:10', '이상없음', '기준없음', 'NOVA-CH800 항온항습기'],
      ['완제품 세탁평가', 'STQ 23:11', '세탁전 지수 - ○○○', '세탁 세탁후 대비 치수와 외관의 큰 차이 없음', '드럼용 세탁기 (삼성 WF17R7200KP)'],
      ['식세척기 사용 적합여부', 'STQ 23:12', '이상없음', '이상없음', '식기세척기 (삼성 DW50R4055FS) 구동'],
      ['세균수', 'STQ 23:13', '○○○ RLU', '기준없음', '3M-LM1 기기 측정'],
      ['동작 시험', 'STQ 23:14', '이상없음', '의뢰자 제시 시험기준', '동작 확인'],
      ['성능 시험', 'STQ 26:01', '이상없음', '사용설명서 원법 짓는 법', '성능 측정'],
    ].forEach(i => ins.run(...i));
  }
}

export default getDb;
