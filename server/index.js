import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import publicRoutes from './routes/public.js';

import contentRoutes from './routes/content.js';
import mentorshipRoutes from './routes/mentorship.js';
import paymentRoutes from './routes/payment.js';
import contactRoutes from './routes/contact.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', publicRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);

// Routes Placeholder
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sport Kombat Center API Running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler ---');
    console.error(err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
