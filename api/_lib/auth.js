import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

export function authenticateToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return null;

    try {
        const user = jwt.verify(token, JWT_SECRET);
        return user;
    } catch (err) {
        return null;
    }
}

export function requireAuth(req, res, roles = null) {
    const user = authenticateToken(req);
    if (!user) {
        res.status(401).json({ error: 'Access denied' });
        return null;
    }
    if (roles && !roles.includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return null;
    }
    return user;
}
