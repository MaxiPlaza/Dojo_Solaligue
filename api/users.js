import bcrypt from 'bcryptjs';
import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    const { url, method } = req;
    const path = url.split('?')[0];

    // GET /api/users
    if (path.endsWith('/api/users') && method === 'GET') {
        const user = requireAuth(req, res, ['admin']);
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, role, plan_id, phone, created_at');
            if (error) throw error;
            return res.json(data);
        } catch (err) {
            return res.status(500).json({ error: 'Server error' });
        }
    }

    // GET /api/users/students
    if (path.endsWith('/students') && method === 'GET') {
        const user = requireAuth(req, res, ['coach', 'admin']);
        if (!user) return;
        try {
            if (user.role === 'admin') {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, email, phone, plan_id')
                    .eq('role', 'student');
                if (error) throw error;
                return res.json(data);
            }
            const { data, error } = await supabase
                .from('coach_students')
                .select('users:student_id ( id, name, email, phone, plan_id )')
                .eq('coach_id', user.id);
            if (error) throw error;
            return res.json((data || []).map(row => row.users));
        } catch (err) {
            return res.status(500).json({ error: 'Server error' });
        }
    }

    // GET /api/users/coaches
    if (path.endsWith('/coaches') && method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, role')
                .in('role', ['coach', 'admin']);
            if (error) throw error;
            return res.json(data);
        } catch (err) {
            return res.status(500).json({ error: 'Server error' });
        }
    }

    // POST /api/users/assign
    if (path.endsWith('/assign') && method === 'POST') {
        const user = requireAuth(req, res, ['admin']);
        if (!user) return;
        const { coach_id, student_id } = req.body;
        try {
            const { error } = await supabase.from('coach_students').insert({ coach_id, student_id });
            if (error) throw error;
            return res.json({ message: 'Student assigned to coach' });
        } catch (err) {
            return res.status(500).json({ error: 'Could not assign student' });
        }
    }

    // POST /api/users/create_coach
    if (path.endsWith('/create_coach') && method === 'POST') {
        const user = requireAuth(req, res, ['admin']);
        if (!user) return;
        const { name, email, password, phone } = req.body;
        try {
            const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
            if (existingUser) return res.status(400).json({ error: 'Email already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const { error } = await supabase.from('users').insert({
                name, email, password: hashedPassword, role: 'coach', plan_id: 3, phone: phone || null
            });
            if (error) throw error;
            return res.status(201).json({ message: 'Coach created successfully' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // POST /api/users/link_friend
    if (path.endsWith('/link_friend') && method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;
        const { friendEmail } = req.body;
        try {
            const { data: userData } = await supabase.from('users').select('plan_id, role').eq('id', user.id).single();
            if (userData.role === 'coach') return res.status(403).json({ error: 'Los coaches no gozan del beneficio 2x1.' });
            if (userData.plan_id !== 3 && userData.role !== 'admin') return res.status(403).json({ error: 'Solo los alumnos del Plan Maestro pueden invitar amigos.' });
            const { data: friend } = await supabase.from('users').select('id, plan_id').eq('email', friendEmail).single();
            if (!friend) return res.status(404).json({ error: 'Usuario no encontrado.' });
            if (friend.id === user.id) return res.status(400).json({ error: 'No puedes invitarte a ti mismo.' });
            const { error } = await supabase.from('users').update({ plan_id: 3, linked_maestro_id: user.id }).eq('id', friend.id);
            if (error) throw error;
            return res.json({ message: 'Amigo vinculado exitosamente!' });
        } catch (err) {
            return res.status(500).json({ error: 'Error al vincular amigo' });
        }
    }

    // DELETE /api/users/:id
    if (method === 'DELETE') {
        const user = requireAuth(req, res, ['admin']);
        if (!user) return;
        const parts = path.split('/');
        const id = parts[parts.length - 1];
        if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
        try {
            if (parseInt(id) === user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'User deleted' });
        } catch (err) {
            return res.status(500).json({ error: 'Server error' });
        }
    }

    return res.status(404).json({ error: 'Not Found' });
}
