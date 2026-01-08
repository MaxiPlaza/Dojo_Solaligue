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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import publicRoutes from './routes/public.js';

import contentRoutes from './routes/content.js';
import paymentRoutes from './routes/payment.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', publicRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/payment', paymentRoutes);

// Routes Placeholder
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sport Kombat Center API Running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
