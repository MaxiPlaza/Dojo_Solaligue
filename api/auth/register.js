import bcrypt from 'bcryptjs';
import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, password, phone } = req.body;

    try {
        // Check if user exists
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

        res.status(201).json({ message: 'User registered successfully', userId: data.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
