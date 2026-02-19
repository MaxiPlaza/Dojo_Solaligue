import db from './database.js';

const emailsToDelete = [
    'plazamaxi385@gmail.com',
    'plazamaxi392@gmail.com'
];

try {
    const deleteStmt = db.prepare('DELETE FROM users WHERE email = ?');

    emailsToDelete.forEach(email => {
        const info = deleteStmt.run(email);
        if (info.changes > 0) {
            console.log(`Successfully deleted user: ${email}`);
        } else {
            console.log(`User not found: ${email}`);
        }
    });
} catch (error) {
    console.error('Error deleting users:', error);
}
