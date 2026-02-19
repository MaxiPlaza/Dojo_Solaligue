import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, plan_id: user.plan_id }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
