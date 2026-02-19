import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const user = requireAuth(req, res);
    if (!user) return;

    try {
        if (req.method === 'GET') {
            const view = req.query.view;

            if (view === 'received' || user.role === 'student') {
                // Student sees notes addressed to them or broadcasts
                const { data, error } = await supabase
                    .from('mentorship_notes')
                    .select('*, users:coach_id ( name )')
                    .or(`student_id.eq.${user.id},student_id.is.null`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formatted = (data || []).map(n => ({
                    ...n,
                    coach_name: n.users?.name || null,
                    users: undefined
                }));

                return res.json(formatted);
            } else {
                // Coach/Admin sees notes they sent
                const { data, error } = await supabase
                    .from('mentorship_notes')
                    .select('*, users:student_id ( name )')
                    .eq('coach_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formatted = (data || []).map(n => ({
                    ...n,
                    student_name: n.users?.name || null,
                    users: undefined
                }));

                return res.json(formatted);
            }
        }

        if (req.method === 'POST') {
            if (user.role !== 'coach' && user.role !== 'admin') {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            const { student_id, message } = req.body;

            const { error } = await supabase
                .from('mentorship_notes')
                .insert({
                    coach_id: user.id,
                    student_id: student_id || null,
                    message
                });

            if (error) throw error;
            return res.status(201).json({ message: 'Note sent' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
