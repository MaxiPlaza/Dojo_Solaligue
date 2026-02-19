import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const { url, method } = req;
    const path = url.split('?')[0];

    // POST /api/auth/login
    if (path.endsWith('/login') && method === 'POST') {
        const { email, password } = req.body;
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: { id: user.id, name: user.name, role: user.role, plan_id: user.plan_id }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    // POST /api/auth/register
    if (path.endsWith('/register') && method === 'POST') {
        const { name, email, password, phone } = req.body;
        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const { data, error } = await supabase
                .from('users')
                .insert({
                    name,
                    email,
                    password: hashedPassword,
                    role: 'student',
                    plan_id: 0,
                    phone: phone || null
                })
                .select('id')
                .single();

            if (error) throw error;
            return res.status(201).json({ message: 'User registered successfully', userId: data.id });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    return res.status(404).json({ error: 'Not Found' });
}
