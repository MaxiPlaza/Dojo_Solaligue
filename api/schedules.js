import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('schedules')
            .select(`
        *,
        dojos ( name ),
        modalities ( name ),
        users:coach_id ( name )
      `);

        if (error) throw error;

        // Reshape to match original API response format
        const formatted = (data || []).map(s => ({
            ...s,
            dojo_name: s.dojos?.name || null,
            modality_name: s.modalities?.name || null,
            coach_name: s.users?.name || null,
            dojos: undefined,
            modalities: undefined,
            users: undefined
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
