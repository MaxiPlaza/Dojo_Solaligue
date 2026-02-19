/**
 * Script para crear un usuario Admin en Supabase
 * 
 * Uso:
 *   1. Instalar dependencias: npm install @supabase/supabase-js bcryptjs
 *   2. Configurar las variables de entorno abajo
 *   3. Ejecutar: node scripts/create_admin.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// =========================================
// CONFIGURAR ESTOS VALORES ANTES DE EJECUTAR
// =========================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'TU_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'TU_SERVICE_ROLE_KEY';

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@dojosolaligue.com';
const ADMIN_PASSWORD = 'admin123'; // CAMBIAR EN PRODUCCIÓN
// =========================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin() {
    try {
        // Check if admin already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', ADMIN_EMAIL)
            .single();

        if (existing) {
            console.log('Admin ya existe con ID:', existing.id);
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const { data, error } = await supabase
            .from('users')
            .insert({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                plan_id: 3
            })
            .select('id')
            .single();

        if (error) throw error;

        console.log('✅ Admin creado exitosamente!');
        console.log('   ID:', data.id);
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('\n⚠️  CAMBIA LA CONTRASEÑA EN PRODUCCIÓN');
    } catch (err) {
        console.error('❌ Error al crear admin:', err.message);
    }
}

createAdmin();
