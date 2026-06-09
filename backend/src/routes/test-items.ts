import { Router, Request, Response } from 'express';
import getDb from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM test_items ORDER BY code').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, code, default_result, standard, method } = req.body;
    const result = db.prepare(
      'INSERT INTO test_items (name, code, default_result, standard, method) VALUES (?, ?, ?, ?, ?)'
    ).run(name, code, default_result || '', standard || '', method || '');
    const item = db.prepare('SELECT * FROM test_items WHERE id = ?').get(result.lastInsertRowid);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, code, default_result, standard, method } = req.body;
    db.prepare(
      'UPDATE test_items SET name=?, code=?, default_result=?, standard=?, method=? WHERE id=?'
    ).run(name, code, default_result || '', standard || '', method || '', req.params.id);
    const item = db.prepare('SELECT * FROM test_items WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM test_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
