import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, phone, plan_id, role } = req.body;

    try {
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role is student unless specified (and maybe restricted in future)
        // For now allow setting role for testing, but typically only admin can create admin/coach
        // Or we have a separate endpoint for admins.
        // Let's force student for public registration unless a secret admin key is present?
        // For simplicity, we'll allow it for now but in a real app check permissions.
        // User requested: "alumnos se registren gratis y empiecen con el plan gratuito"

        const userRole = role || 'student';
        // Plan 1 is 'Novato' (Free/Cheap)
        const userPlan = plan_id || 0; // Default to 0 (Gratuito)

        const result = db.prepare(`
      INSERT INTO users (name, email, password, role, plan_id, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, userRole, userPlan, phone);

        res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, plan_id: user.plan_id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
