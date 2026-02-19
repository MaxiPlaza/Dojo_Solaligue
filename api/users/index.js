import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res, ['admin']);
    if (!user) return;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, plan_id, phone, created_at');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
