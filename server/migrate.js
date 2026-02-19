import db from './database.js';

try {
    db.prepare("ALTER TABLE users ADD COLUMN subscription_end_date DATETIME").run();
    console.log("Added subscription_end_date column");
} catch (e) {
    console.log("subscription_end_date column already exists or error:", e.message);
}

try {
    db.prepare("ALTER TABLE users ADD COLUMN linked_maestro_id INTEGER").run();
    console.log("Added linked_maestro_id column");
} catch (e) {
    console.log("linked_maestro_id column already exists or error:", e.message);
}

process.exit(0);
