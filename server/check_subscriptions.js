import db from './database.js';

async function checkSubscriptions() {
    console.log('--- Checking for expired subscriptions ---');
    const now = new Date().toISOString();

    // 1. Reset users whose subscription has expired
    const expiredUsers = db.prepare(`
        UPDATE users 
        SET plan_id = 0, subscription_end_date = NULL 
        WHERE subscription_end_date IS NOT NULL AND subscription_end_date < ?
    `).run(now);

    console.log(`Expired users reset: ${expiredUsers.changes}`);

    // 2. Reset friends linked to expired (or inactive) Maestro accounts
    // If a user has a linked_maestro_id, but that maestro is no longer on plan 3, reset the friend.
    const expiredFriends = db.prepare(`
        UPDATE users 
        SET plan_id = 0, linked_maestro_id = NULL 
        WHERE linked_maestro_id IS NOT NULL 
        AND linked_maestro_id NOT IN (SELECT id FROM users WHERE plan_id = 3)
    `).run();

    console.log(`Linked friends reset (maestro inactive): ${expiredFriends.changes}`);

    console.log('--- Check complete ---');
}

checkSubscriptions().catch(console.error);
