import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const user = requireAuth(req, res);
    if (!user) return;

    const { url, method } = req;
    const path = url.split('?')[0];

    try {
        // GET /api/mentorship/coaches
        if (path.endsWith('/coaches') && method === 'GET') {
            const { data, error } = await supabase.from('users').select('id, name, email, phone').eq('role', 'coach');
            if (error) throw error;
            return res.json(data);
        }

        // GET /api/mentorship/my_coach
        if (path.endsWith('/my_coach') && method === 'GET') {
            const { data, error } = await supabase
                .from('coach_students')
                .select('users:coach_id ( id, name, email, phone )')
                .eq('student_id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return res.json(data ? data.users : null);
        }

        // GET /api/mentorship/my_students
        if (path.endsWith('/my_students') && method === 'GET') {
            const { data, error } = await supabase
                .from('coach_students')
                .select('users:student_id ( id, name, email, phone, plan_id )')
                .eq('coach_id', user.id);
            if (error) throw error;
            return res.json((data || []).map(row => row.users));
        }

        // POST /api/mentorship/assign_coach
        if (path.endsWith('/assign_coach') && method === 'POST') {
            const { coach_id } = req.body;
            const { error } = await supabase.from('coach_students').insert({ coach_id, student_id: user.id });
            if (error) throw error;
            return res.json({ message: 'Coach assigned' });
        }

        // /api/mentorship/notes (GET and POST)
        if (path.endsWith('/notes')) {
            if (method === 'GET') {
                const view = req.query.view;
                if (view === 'received' || user.role === 'student') {
                    const { data, error } = await supabase
                        .from('mentorship_notes')
                        .select('*, users:coach_id ( name )')
                        .or(`student_id.eq.${user.id},student_id.is.null`)
                        .order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.json((data || []).map(n => ({ ...n, coach_name: n.users?.name || null, users: undefined })));
                } else {
                    const { data, error } = await supabase
                        .from('mentorship_notes')
                        .select('*, users:student_id ( name )')
                        .eq('coach_id', user.id)
                        .order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.json((data || []).map(n => ({ ...n, student_name: n.users?.name || null, users: undefined })));
                }
            }
            if (method === 'POST') {
                if (user.role !== 'coach' && user.role !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });
                const { student_id, message } = req.body;
                const { error } = await supabase.from('mentorship_notes').insert({ coach_id: user.id, student_id: student_id || null, message });
                if (error) throw error;
                return res.status(201).json({ message: 'Note sent' });
            }
        }

        return res.status(404).json({ error: 'Not Found' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}
