import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res, ['coach', 'admin']);
    if (!user) return;

    try {
        const { data, error } = await supabase
            .from('coach_students')
            .select('users:student_id ( id, name, email, phone, plan_id )')
            .eq('coach_id', user.id);

        if (error) throw error;

        const students = (data || []).map(row => row.users);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener alumnos asignados' });
    }
}
