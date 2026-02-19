import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const { url, method, query } = req;
    const path = url.split('?')[0];

    try {
        if (method === 'GET') {
            const user = requireAuth(req, res);
            if (!user) return;
            const { data: userData } = await supabase.from('users').select('plan_id').eq('id', user.id).single();
            const planId = userData ? userData.plan_id : 0;
            if (user.role === 'admin' || user.role === 'coach') {
                const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                return res.json(data);
            }
            const { data, error } = await supabase.from('content').select('*').lte('plan_min_level', planId).order('created_at', { ascending: false });
            if (error) throw error;
            return res.json(data);
        }

        if (method === 'POST') {
            const user = requireAuth(req, res, ['admin', 'coach']);
            if (!user) return;
            const { title, description, type, plan_min_level, url: finalUrl } = req.body;
            if (!title || !type) return res.status(400).json({ error: 'Título y tipo son requeridos' });
            if (!finalUrl && type !== 'meeting') return res.status(400).json({ error: 'Se requiere una URL' });
            const { data, error } = await supabase.from('content').insert({ title, description: description || '', type, url: finalUrl || '', plan_min_level: parseInt(plan_min_level) || 0, uploader_id: user.id }).select('id').single();
            if (error) throw error;
            return res.status(201).json({ message: 'Contenido creado con éxito', id: data.id });
        }

        const parts = path.split('/');
        const id = parts[parts.length - 1];

        if (method === 'PUT') {
            const user = requireAuth(req, res, ['admin', 'coach']);
            if (!user) return;
            const { title, description, plan_min_level } = req.body;
            const { error } = await supabase.from('content').update({ title, description, plan_min_level }).eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Content updated successfully' });
        }

        if (method === 'DELETE') {
            const user = requireAuth(req, res, ['admin', 'coach']);
            if (!user) return;
            const { error } = await supabase.from('content').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Content deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}
