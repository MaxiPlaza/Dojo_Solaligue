import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res);
    if (!user) return;

    const { plan_id, is_annual } = req.body;
    const userId = user.id;

    try {
        const endDate = new Date();
        if (is_annual === 'true' || is_annual === true) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const formattedDate = endDate.toISOString();

        const { error } = await supabase
            .from('users')
            .update({
                plan_id: plan_id,
                subscription_end_date: formattedDate
            })
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Suscripción actualizada correctamente', end_date: formattedDate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar la suscripción' });
    }
}
