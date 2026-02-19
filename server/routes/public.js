import express from 'express';
import db from '../database.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// === PUBLIC ENDPOINTS ===

router.get('/plans', (req, res) => {
    const plans = db.prepare('SELECT * FROM plans').all();
    res.json(plans);
});

router.get('/dojos', (req, res) => {
    const dojos = db.prepare('SELECT * FROM dojos').all();
    res.json(dojos);
});

router.get('/modalities', (req, res) => {
    const modalities = db.prepare('SELECT * FROM modalities').all();
    res.json(modalities);
});

router.get('/schedules', (req, res) => {
    // Join to get names
    const schedules = db.prepare(`
        SELECT s.*, d.name as dojo_name, m.name as modality_name, u.name as coach_name 
        FROM schedules s
        JOIN dojos d ON s.dojo_id = d.id
        JOIN modalities m ON s.modality_id = m.id
        LEFT JOIN users u ON s.coach_id = u.id
    `).all();
    res.json(schedules);
});


// === ADMIN ENDPOINTS (Manage Content) ===

// Modalities
router.post('/modalities', authenticateToken, requireRole(['admin']), (req, res) => {
    const { name, description, image_url } = req.body;
    try {
        db.prepare('INSERT INTO modalities (name, description, image_url) VALUES (?, ?, ?)').run(name, description, image_url);
        res.status(201).json({ message: 'Modality created' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/modalities/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    const { name, description, image_url } = req.body;
    try {
        db.prepare('UPDATE modalities SET name = ?, description = ?, image_url = ? WHERE id = ?').run(name, description, image_url, req.params.id);
        res.json({ message: 'Modality updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/modalities/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        db.prepare('DELETE FROM modalities WHERE id = ?').run(req.params.id);
        res.json({ message: 'Modality deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Dojos
router.post('/dojos', authenticateToken, requireRole(['admin']), (req, res) => {
    const { name, address, phone, lat, lng } = req.body;
    try {
        db.prepare('INSERT INTO dojos (name, address, phone, lat, lng) VALUES (?, ?, ?, ?, ?)').run(name, address, phone, lat, lng);
        res.status(201).json({ message: 'Dojo created' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// Add PUT/DELETE for Dojos similarly if needed

export default router;
