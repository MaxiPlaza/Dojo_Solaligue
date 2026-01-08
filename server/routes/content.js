import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'server/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload Content (Admin/Coach)
router.post('/', authenticateToken, requireRole(['admin', 'coach']), upload.single('file'), (req, res) => {
    const { title, description, type, plan_min_level, url } = req.body;
    // If file uploaded, use file path, else use provided url (for links/meetings)
    const finalUrl = req.file ? `/uploads/${req.file.filename}` : url;

    try {
        db.prepare(`
      INSERT INTO content (title, description, type, url, plan_min_level, uploader_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, type, finalUrl, plan_min_level, req.user.id);
        res.status(201).json({ message: 'Content created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Content (Student/Admin/Coach)
router.get('/', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(req.user.id);
        const planId = user ? user.plan_id : 0;

        // Admins/Coaches verify all content
        if (req.user.role === 'admin' || req.user.role === 'coach') {
            const content = db.prepare('SELECT * FROM content ORDER BY created_at DESC').all();
            return res.json(content);
        }

        // Students see content <= their plan level
        // Assuming plan_min_level 1=Novato, 2=Luchador, 3=Maestro (Matches Plan IDs)
        const content = db.prepare('SELECT * FROM content WHERE plan_min_level <= ? ORDER BY created_at DESC').all(planId);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Content
router.delete('/:id', authenticateToken, requireRole(['admin', 'coach']), (req, res) => {
    try {
        db.prepare('DELETE FROM content WHERE id = ?').run(req.params.id);
        res.json({ message: 'Content deleted' });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
