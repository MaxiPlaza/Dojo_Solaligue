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

    const { coachId } = req.body;
    const studentId = user.id;

    try {
        // Check student plan
        const { data: student } = await supabase
            .from('users')
            .select('plan_id')
            .eq('id', studentId)
            .single();

        if (!student || student.plan_id < 2) {
            return res.status(403).json({ error: 'Tu plan no incluye mentoría 1 a 1.' });
        }

        // Check if coach exists and is valid
        const { data: coach } = await supabase
            .from('users')
            .select('id')
            .eq('id', coachId)
            .eq('role', 'coach')
            .single();

        if (!coach) {
            return res.status(404).json({ error: 'El coach seleccionado no es válido.' });
        }

        // Remove previous assignment then insert new one
        await supabase.from('coach_students').delete().eq('student_id', studentId);
        const { error } = await supabase
            .from('coach_students')
            .insert({ coach_id: coachId, student_id: studentId });

        if (error) throw error;
        res.json({ message: 'Coach asignado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al asignar coach' });
    }
}
