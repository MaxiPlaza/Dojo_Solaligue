import express from 'express';
import db from '../database.js';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, email, role, plan_id, phone, created_at FROM users').all();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Coaches (Public/Admin)
router.get('/coaches', (req, res) => {
    try {
        const coaches = db.prepare('SELECT id, name, email, phone, role FROM users WHERE role = ? OR role = ?').all('coach', 'admin');
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Coach (Admin only)
router.post('/create_coach', authenticateToken, requireRole(['admin']), async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`
            INSERT INTO users (name, email, password, role, plan_id, phone)
            VALUES (?, ?, ?, 'coach', 3, ?)
        `).run(name, email, hashedPassword, phone);
        res.status(201).json({ message: 'Coach created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete User (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        // Prevent deleting yourself (optional safety)
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


// Get Students for a specific coach (Coach/Admin)
router.get('/students', authenticateToken, requireRole(['coach', 'admin']), (req, res) => {
    try {
        // If Admin, get all students. If Coach, get assigned students.
        if (req.user.role === 'admin') {
            const students = db.prepare('SELECT id, name, email, phone, plan_id FROM users WHERE role = ?').all('student');
            return res.json(students);
        }

        // For coach, find assigned students
        const students = db.prepare(`
        SELECT u.id, u.name, u.email, u.phone, u.plan_id 
        FROM users u 
        JOIN coach_students cs ON u.id = cs.student_id 
        WHERE cs.coach_id = ?
    `).all(req.user.id);

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Assign Student to Coach (Admin only)
router.post('/assign', authenticateToken, requireRole(['admin']), (req, res) => {
    const { coach_id, student_id } = req.body;
    try {
        db.prepare('INSERT INTO coach_students (coach_id, student_id) VALUES (?, ?)').run(coach_id, student_id);
        res.json({ message: 'Student assigned to coach' });
    } catch (error) {
        res.status(500).json({ error: 'Could not assign student (maybe already assigned)' });
    }
});

export default router;
