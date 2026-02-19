import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabase
            .from('coach_students')
            .select('users:coach_id ( id, name, email, phone )')
            .eq('student_id', user.id)
            .single();

        if (error || !data) {
            return res.json(null);
        }

        res.json(data.users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener coach asignado' });
    }
}
