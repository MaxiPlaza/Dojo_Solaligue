import express from 'express';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List all coaches
router.get('/coaches', authenticateToken, (req, res) => {
    try {
        const coaches = db.prepare('SELECT id, name, email, phone FROM users WHERE role = "coach"').all();
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener coaches' });
    }
});

// 2. Assign a coach (For Students Plan 2 or 3)
router.post('/assign_coach', authenticateToken, (req, res) => {
    const { coachId } = req.body;
    const studentId = req.user.id;

    try {
        // Check student plan
        const student = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(studentId);
        if (!student || student.plan_id < 2) {
            return res.status(403).json({ error: 'Tu plan no incluye mentoría 1 a 1.' });
        }

        // Check if coach exists and is a coach
        const coach = db.prepare('SELECT id FROM users WHERE id = ? AND role = "coach"').get(coachId);
        if (!coach) {
            return res.status(404).json({ error: 'El coach seleccionado no es válido.' });
        }

        // Assign (UPSERT behavior logic)
        db.prepare('DELETE FROM coach_students WHERE student_id = ?').run(studentId);
        db.prepare('INSERT INTO coach_students (coach_id, student_id) VALUES (?, ?)').run(coachId, studentId);

        res.json({ message: 'Coach asignado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar coach' });
    }
});

// 3. Get my assigned coach (For Students)
router.get('/my_coach', authenticateToken, (req, res) => {
    try {
        const coach = db.prepare(`
            SELECT u.id, u.name, u.email, u.phone 
            FROM users u
            JOIN coach_students cs ON u.id = cs.coach_id
            WHERE cs.student_id = ?
        `).get(req.user.id);

        res.json(coach || null);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener coach asignado' });
    }
});

// 4. Get my students (For Coaches)
router.get('/my_students', authenticateToken, requireRole(['coach', 'admin']), (req, res) => {
    try {
        const students = db.prepare(`
            SELECT u.id, u.name, u.email, u.phone, u.plan_id 
            FROM users u
            JOIN coach_students cs ON u.id = cs.student_id
            WHERE cs.coach_id = ?
        `).all(req.user.id);

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener alumnos asignados' });
    }
});

// Get Notes (As Student: My notes. As Coach: Sent notes)
router.get('/notes', authenticateToken, (req, res) => {
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
router.post('/notes', authenticateToken, requireRole(['coach', 'admin']), (req, res) => {
    const { student_id, message } = req.body;
    try {
        db.prepare('INSERT INTO mentorship_notes (coach_id, student_id, message) VALUES (?, ?, ?)').run(req.user.id, student_id, message);
        res.status(201).json({ message: 'Note sent' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
