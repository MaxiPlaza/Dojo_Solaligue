import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Helper to ensure directory exists on every request (safety)
const ensureDir = (req, res, next) => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    next();
};

// Upload Content (Admin/Coach)
router.post('/', authenticateToken, requireRole(['admin', 'coach']), ensureDir, upload.single('file'), (req, res) => {
    try {
        console.log('--- Upload Attempt Details ---');
        console.log('User:', req.user);

        const { title, description, type, plan_min_level, url } = req.body;

        if (!title || !type) {
            return res.status(400).json({ error: 'Título y tipo son requeridos' });
        }

        // If file uploaded, use file path, else use provided url (for links/meetings)
        let finalUrl = url;
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        if (!finalUrl && type !== 'meeting') {
            return res.status(400).json({ error: 'Se requiere un archivo o una URL para este tipo de contenido' });
        }

        const p_level = parseInt(plan_min_level) || 0;
        const uploader_id = req.user?.id;

        if (!uploader_id) {
            return res.status(401).json({ error: 'ID de usuario no encontrado en el token' });
        }

        const result = db.prepare(`
            INSERT INTO content (title, description, type, url, plan_min_level, uploader_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(title, description || '', type, finalUrl || '', p_level, uploader_id);

        console.log('Upload Success ID:', result.lastInsertRowid);
        res.status(201).json({ message: 'Contenido creado con éxito', id: result.lastInsertRowid });
    } catch (error) {
        console.error('--- Upload Failed ---');
        console.error(error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
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

// Update Content
router.put('/:id', authenticateToken, requireRole(['admin', 'coach']), (req, res) => {
    const { title, description, plan_min_level } = req.body;
    try {
        db.prepare(`
            UPDATE content 
            SET title = ?, description = ?, plan_min_level = ?
            WHERE id = ?
        `).run(title, description, plan_min_level, req.params.id);
        res.json({ message: 'Content updated successfully' });
    } catch (error) {
        console.error(error);
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
