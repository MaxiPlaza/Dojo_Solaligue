import db from './database.js';
import bcrypt from 'bcryptjs';

const setupAdmin = async () => {
    const email = 'admin@gmail.com';
    const password = 'admin234';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existing) {
            db.prepare('UPDATE users SET password = ?, role = ? WHERE email = ?').run(hashedPassword, 'admin', email);
            console.log(`Admin account ${email} updated successfully.`);
        } else {
            db.prepare(`
                INSERT INTO users (name, email, password, role, plan_id, phone)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run('Super Admin', email, hashedPassword, 'admin', 3, 'Admin-01');
            console.log(`Admin account ${email} created successfully.`);
        }
    } catch (error) {
        console.error('Error setting up admin:', error);
    }
};

setupAdmin();
