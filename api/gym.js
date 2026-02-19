import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const { url, method } = req;
    const path = url.split('?')[0];

    try {
        // GET /api/dojos
        if (path.endsWith('/dojos') && method === 'GET') {
            const { data, error } = await supabase.from('dojos').select('*');
            if (error) throw error;
            return res.json(data);
        }

        // POST /api/dojos
        if (path.endsWith('/dojos') && method === 'POST') {
            const user = requireAuth(req, res, ['admin']);
            if (!user) return;
            const { name, address, phone, lat, lng } = req.body;
            const { error } = await supabase.from('dojos').insert({ name, address, phone, lat, lng });
            if (error) throw error;
            return res.status(201).json({ message: 'Dojo created' });
        }

        // GET /api/modalities
        if (path.endsWith('/modalities') && method === 'GET') {
            const { data, error } = await supabase.from('modalities').select('*');
            if (error) throw error;
            return res.json(data);
        }

        // POST /api/modalities
        if (path.endsWith('/modalities') && method === 'POST') {
            const user = requireAuth(req, res, ['admin']);
            if (!user) return;
            const { name, description, image_url } = req.body;
            const { error } = await supabase.from('modalities').insert({ name, description, image_url });
            if (error) throw error;
            return res.status(201).json({ message: 'Modality created' });
        }

        // GET /api/schedules
        if (path.endsWith('/schedules') && method === 'GET') {
            const { data, error } = await supabase.from('schedules').select('*, dojos ( name ), modalities ( name ), users:coach_id ( name )');
            if (error) throw error;
            const formatted = (data || []).map(s => ({
                ...s,
                dojo_name: s.dojos?.name || null,
                modality_name: s.modalities?.name || null,
                coach_name: s.users?.name || null,
                dojos: undefined, modalities: undefined, users: undefined
            }));
            return res.json(formatted);
        }

        return res.status(404).json({ error: 'Not Found' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
