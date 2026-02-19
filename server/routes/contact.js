import express from 'express';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Send contact message
router.post('/', (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
            .run(name, email, subject, message);
        res.status(201).json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

// Admin: Get all contact messages
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
});

export default router;
