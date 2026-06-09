import { Router, Request, Response } from 'express';
import getDb from '../db';

const router = Router();

// GET next report number preview
router.get('/next-no', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { testerCode, date } = req.query as { testerCode: string; date: string };
    if (!testerCode || !date) {
      return res.status(400).json({ error: 'testerCode and date required' });
    }
    const prefix = `ST${testerCode}-${date}`;
    const existing = db.prepare(
      "SELECT COUNT(*) as cnt FROM reports WHERE report_no LIKE ?"
    ).get(`${prefix}-%`) as { cnt: number };
    const next = existing.cnt + 1;
    return res.json({ report_no: `${prefix}-${next}` });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// GET all reports (list)
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const reports = db.prepare(`
      SELECT r.*, t.name as tester_name,
        GROUP_CONCAT(rti.test_item_name, ', ') as test_items_summary
      FROM reports r
      LEFT JOIN testers t ON r.tester_id = t.id
      LEFT JOIN report_test_items rti ON rti.report_id = r.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `).all();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET single report with all details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const report = db.prepare(`
      SELECT r.*, t.name as tester_name, t.code as tester_code,
             t.title as tester_title, t.email as tester_email,
             t.signature_image as tester_signature
      FROM reports r
      LEFT JOIN testers t ON r.tester_id = t.id
      WHERE r.id = ?
    `).get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });

    const testItems = db.prepare(
      'SELECT * FROM report_test_items WHERE report_id = ? ORDER BY sort_order'
    ).all(req.params.id);

    const images = db.prepare(
      'SELECT * FROM report_images WHERE report_id = ? ORDER BY sort_order'
    ).all(req.params.id);

    return res.json({ ...report as object, test_items: testItems, images });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// POST create report
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const {
      receipt_date, company, issue_date, sequence, tester_id,
      product_name, test_items, images, equipment_notes
    } = req.body;

    // Generate report_no
    const tester = db.prepare('SELECT code FROM testers WHERE id = ?').get(tester_id) as { code: string } | undefined;
    if (!tester) return res.status(400).json({ error: 'Tester not found' });

    const dateStr = issue_date ? issue_date.replace(/-/g, '').slice(2) : '';
    const prefix = `ST${tester.code}-${dateStr}`;
    const existing = db.prepare(
      "SELECT COUNT(*) as cnt FROM reports WHERE report_no LIKE ?"
    ).get(`${prefix}-%`) as { cnt: number };
    const seqNo = existing.cnt + 1;
    const report_no = `${prefix}-${seqNo}`;

    const result = db.prepare(
      'INSERT INTO reports (report_no, receipt_date, company, issue_date, sequence, tester_id, product_name, equipment_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(report_no, receipt_date, company, issue_date, sequence || 1, tester_id, product_name, equipment_notes || '');

    const reportId = result.lastInsertRowid;

    // Insert test items
    if (test_items && Array.isArray(test_items)) {
      const insertItem = db.prepare(
        'INSERT INTO report_test_items (report_id, test_item_name, test_method, test_result, test_standard, detail_method, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      test_items.forEach((item: { test_item_name: string; test_method: string; test_result: string; test_standard: string; detail_method: string }, idx: number) => {
        insertItem.run(reportId, item.test_item_name, item.test_method, item.test_result, item.test_standard, item.detail_method, idx);
      });
    }

    // Insert images
    if (images && Array.isArray(images)) {
      const insertImg = db.prepare(
        'INSERT INTO report_images (report_id, image_data, caption, sort_order) VALUES (?, ?, ?, ?)'
      );
      images.forEach((img: { image_data: string; caption: string }, idx: number) => {
        insertImg.run(reportId, img.image_data, img.caption, idx);
      });
    }

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// PUT update report
router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const {
      receipt_date, company, issue_date, sequence, tester_id,
      product_name, test_items, images, equipment_notes
    } = req.body;
    const reportId = req.params.id;

    db.prepare(
      'UPDATE reports SET receipt_date=?, company=?, issue_date=?, sequence=?, tester_id=?, product_name=?, equipment_notes=? WHERE id=?'
    ).run(receipt_date, company, issue_date, sequence || 1, tester_id, product_name, equipment_notes || '', reportId);

    // Replace test items
    db.prepare('DELETE FROM report_test_items WHERE report_id = ?').run(reportId);
    if (test_items && Array.isArray(test_items)) {
      const insertItem = db.prepare(
        'INSERT INTO report_test_items (report_id, test_item_name, test_method, test_result, test_standard, detail_method, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      test_items.forEach((item: { test_item_name: string; test_method: string; test_result: string; test_standard: string; detail_method: string }, idx: number) => {
        insertItem.run(reportId, item.test_item_name, item.test_method, item.test_result, item.test_standard, item.detail_method, idx);
      });
    }

    // Replace images
    db.prepare('DELETE FROM report_images WHERE report_id = ?').run(reportId);
    if (images && Array.isArray(images)) {
      const insertImg = db.prepare(
        'INSERT INTO report_images (report_id, image_data, caption, sort_order) VALUES (?, ?, ?, ?)'
      );
      images.forEach((img: { image_data: string; caption: string }, idx: number) => {
        insertImg.run(reportId, img.image_data, img.caption, idx);
      });
    }

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE report
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
