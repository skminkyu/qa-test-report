import { Router, Request, Response } from 'express';
import getDb from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const testers = db.prepare('SELECT * FROM testers ORDER BY code').all();
    res.json(testers);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { code, name, title, email, phone, signature_image, is_team_leader } = req.body;
    if (is_team_leader) {
      db.prepare('UPDATE testers SET is_team_leader = 0').run();
    }
    const result = db.prepare(
      'INSERT INTO testers (code, name, title, email, phone, signature_image, is_team_leader) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(code, name, title || '', email || '', phone || '', signature_image || null, is_team_leader ? 1 : 0);
    const tester = db.prepare('SELECT * FROM testers WHERE id = ?').get(result.lastInsertRowid);
    res.json(tester);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { code, name, title, email, phone, signature_image, is_team_leader } = req.body;
    if (is_team_leader) {
      db.prepare('UPDATE testers SET is_team_leader = 0 WHERE id != ?').run(id);
    }
    db.prepare(
      'UPDATE testers SET code=?, name=?, title=?, email=?, phone=?, signature_image=?, is_team_leader=? WHERE id=?'
    ).run(code, name, title || '', email || '', phone || '', signature_image !== undefined ? signature_image : null, is_team_leader ? 1 : 0, id);
    const tester = db.prepare('SELECT * FROM testers WHERE id = ?').get(id);
    res.json(tester);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM testers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/:id/signature', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { signature_image } = req.body;
    db.prepare('UPDATE testers SET signature_image = ? WHERE id = ?').run(signature_image, req.params.id);
    const tester = db.prepare('SELECT * FROM testers WHERE id = ?').get(req.params.id);
    res.json(tester);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
