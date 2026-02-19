import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('dojos').select('*');
            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'POST') {
            const user = requireAuth(req, res, ['admin']);
            if (!user) return;

            const { name, address, phone, lat, lng } = req.body;
            const { error } = await supabase
                .from('dojos')
                .insert({ name, address, phone, lat, lng });

            if (error) throw error;
            return res.status(201).json({ message: 'Dojo created' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
