import bcrypt from 'bcryptjs';
import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res, ['admin']);
    if (!user) return;

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

        const { error } = await supabase
            .from('users')
            .insert({
                name,
                email,
                password: hashedPassword,
                role: 'coach',
                plan_id: 3,
                phone: phone || null
            });

        if (error) throw error;
        res.status(201).json({ message: 'Coach created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
