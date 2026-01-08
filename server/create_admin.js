import db from './database.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    const email = 'admin@sportkombat.com';
    const password = 'admin'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existing) {
            console.log('Admin user already exists.');
            // Update password just in case
            db.prepare('UPDATE users SET password = ?, role = ? WHERE email = ?').run(hashedPassword, 'admin', email);
            console.log('Admin password reset to "admin".');
        } else {
            db.prepare(`
        INSERT INTO users (name, email, password, role, plan_id, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('Administrator', email, hashedPassword, 'admin', 3, '000-0000');
            console.log('Admin user created successfully.');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

createAdmin();
