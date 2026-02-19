import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role')
            .in('role', ['coach', 'admin']);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
