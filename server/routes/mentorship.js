import express from 'express';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Notes (As Student: My notes. As Coach: Sent notes)
router.get('/', authenticateToken, (req, res) => {
    try {
        const view = req.query.view;

        // If 'received' is requested OR role is student (default behavior for student)
        if (view === 'received' || req.user.role === 'student') {
            const notes = db.prepare(`
                SELECT m.*, u.name as coach_name 
                FROM mentorship_notes m
                JOIN users u ON m.coach_id = u.id
                WHERE m.student_id = ? OR m.student_id IS NULL
                ORDER BY m.created_at DESC
            `).all(req.user.id);
            res.json(notes);
        } else {
            // Coach/Admin see notes they sent (default for them)
            const notes = db.prepare(`
                SELECT m.*, u.name as student_name 
                FROM mentorship_notes m
                LEFT JOIN users u ON m.student_id = u.id
                WHERE m.coach_id = ?
                ORDER BY m.created_at DESC
            `).all(req.user.id);
            res.json(notes);
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Note (Coach only)
router.post('/', authenticateToken, requireRole(['coach', 'admin']), (req, res) => {
    const { student_id, message } = req.body;
    try {
        db.prepare('INSERT INTO mentorship_notes (coach_id, student_id, message) VALUES (?, ?, ?)').run(req.user.id, student_id, message);
        res.status(201).json({ message: 'Note sent' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
