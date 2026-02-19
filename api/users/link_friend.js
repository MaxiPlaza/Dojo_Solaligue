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

    const { friendEmail } = req.body;
    const userId = user.id;

    try {
        // Check if current user is Maestro AND a student
        const { data: userData } = await supabase
            .from('users')
            .select('plan_id, role')
            .eq('id', userId)
            .single();

        if (userData.role === 'coach') {
            return res.status(403).json({ error: 'Los coaches no gozan del beneficio 2x1.' });
        }

        if (userData.plan_id !== 3 && userData.role !== 'admin') {
            return res.status(403).json({ error: 'Solo los alumnos del Plan Maestro pueden invitar amigos.' });
        }

        // Find friend
        const { data: friend } = await supabase
            .from('users')
            .select('id, plan_id')
            .eq('email', friendEmail)
            .single();

        if (!friend) {
            return res.status(404).json({ error: 'Usuario no encontrado. El amigo debe estar registrado primero.' });
        }

        if (friend.id === userId) {
            return res.status(400).json({ error: 'No puedes invitarte a ti mismo.' });
        }

        const { error } = await supabase
            .from('users')
            .update({ plan_id: 3, linked_maestro_id: userId })
            .eq('id', friend.id);

        if (error) throw error;

        res.json({ message: 'Amigo vinculado exitosamente al Plan Maestro (2x1)!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al vincular amigo' });
    }
}
