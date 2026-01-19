import db from './database.js';

const email = 'plazamaxi385@gmail.com';
try {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (user) {
        // Set plan 3 and a far-future subscription date
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10); // 10 years

        db.prepare(`
            UPDATE users 
            SET plan_id = 3, subscription_end_date = ? 
            WHERE id = ?
        `).run(futureDate.toISOString(), user.id);

        console.log(`Plan Maestro asignado con éxito a ${email}`);
    } else {
        console.log(`Usuario con email ${email} no encontrado.`);
    }
} catch (e) {
    console.error('Error al asignar plan:', e.message);
}

process.exit(0);
