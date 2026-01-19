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
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`
            INSERT INTO users (name, email, password, role, plan_id, phone)
            VALUES (?, ?, ?, 'coach', 3, ?)
        `).run(name, email, hashedPassword, phone);
        res.status(201).json({ message: 'Coach created successfully' });
    } catch (error) {
        console.error(error);
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

// Maestro Plan: Link a friend (2x1 logic)
router.post('/link_friend', authenticateToken, (req, res) => {
    const { friendEmail } = req.body;
    const userId = req.user.id;

    try {
        // Check if current user is Maestro AND a student (Exclude coaches)
        const user = db.prepare('SELECT plan_id, role FROM users WHERE id = ?').get(userId);

        if (user.role === 'coach') {
            return res.status(403).json({ error: 'Los coaches no gozan del beneficio 2x1.' });
        }

        if (user.plan_id !== 3 && user.role !== 'admin') {
            return res.status(403).json({ error: 'Solo los alumnos del Plan Maestro pueden invitar amigos.' });
        }

        // Find friend
        const friend = db.prepare('SELECT id, plan_id FROM users WHERE email = ?').get(friendEmail);
        if (!friend) {
            return res.status(404).json({ error: 'Usuario no encontrado. El amigo debe estar registrado primero.' });
        }

        if (friend.id === userId) {
            return res.status(400).json({ error: 'No puedes invitarte a ti mismo.' });
        }

        // Check if friend already has a plan or is already linked
        // (Optional: Allow upgrading them if they are 'Aspirante')

        db.prepare('UPDATE users SET plan_id = 3, linked_maestro_id = ? WHERE id = ?').run(userId, friend.id);

        res.json({ message: 'Amigo vinculado exitosamente al Plan Maestro (2x1)!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al vincular amigo' });
    }
});

export default router;
