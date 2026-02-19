import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res, ['admin']);
    if (!user) return;

    const { id } = req.query;

    try {
        if (parseInt(id) === user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
