import { cors } from './_lib/cors.js';

export default function handler(req, res) {
    if (cors(req, res)) return;
    res.json({ status: 'ok', message: 'Dojo Solaligue API Running' });
}
