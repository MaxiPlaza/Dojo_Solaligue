import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    try {
        if (req.method === 'POST') {
            const { name, email, subject, message } = req.body;

            const { error } = await supabase
                .from('contact_messages')
                .insert({ name, email, subject, message });

            if (error) throw error;
            return res.status(201).json({ message: 'Mensaje enviado correctamente' });
        }

        if (req.method === 'GET') {
            const user = requireAuth(req, res, ['admin']);
            if (!user) return;

            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.json(data);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
}
