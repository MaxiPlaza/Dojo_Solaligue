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

    const { coach_id, student_id } = req.body;

    try {
        const { error } = await supabase
            .from('coach_students')
            .insert({ coach_id, student_id });

        if (error) throw error;
        res.json({ message: 'Student assigned to coach' });
    } catch (err) {
        res.status(500).json({ error: 'Could not assign student (maybe already assigned)' });
    }
}
