import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const user = requireAuth(req, res, ['admin', 'coach']);
    if (!user) return;

    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            const { title, description, plan_min_level } = req.body;

            const { error } = await supabase
                .from('content')
                .update({ title, description, plan_min_level })
                .eq('id', id);

            if (error) throw error;
            return res.json({ message: 'Content updated successfully' });
        }

        if (req.method === 'DELETE') {
            const { error } = await supabase
                .from('content')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.json({ message: 'Content deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
