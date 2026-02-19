import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    try {
        if (req.method === 'GET') {
            const user = requireAuth(req, res);
            if (!user) return;

            const { data: userData } = await supabase
                .from('users')
                .select('plan_id')
                .eq('id', user.id)
                .single();

            const planId = userData ? userData.plan_id : 0;

            // Admins/Coaches see all content
            if (user.role === 'admin' || user.role === 'coach') {
                const { data, error } = await supabase
                    .from('content')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return res.json(data);
            }

            // Students see content <= their plan level
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .lte('plan_min_level', planId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'POST') {
            const user = requireAuth(req, res, ['admin', 'coach']);
            if (!user) return;

            const { title, description, type, plan_min_level, url } = req.body;

            if (!title || !type) {
                return res.status(400).json({ error: 'Título y tipo son requeridos' });
            }

            // For file uploads, the frontend should upload to Supabase Storage first
            // and send the resulting URL here
            let finalUrl = url || '';

            if (!finalUrl && type !== 'meeting') {
                return res.status(400).json({ error: 'Se requiere una URL para este tipo de contenido' });
            }

            const p_level = parseInt(plan_min_level) || 0;

            const { data, error } = await supabase
                .from('content')
                .insert({
                    title,
                    description: description || '',
                    type,
                    url: finalUrl,
                    plan_min_level: p_level,
                    uploader_id: user.id
                })
                .select('id')
                .single();

            if (error) throw error;
            res.status(201).json({ message: 'Contenido creado con éxito', id: data.id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Error interno del servidor' });
    }
}
