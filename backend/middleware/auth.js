import jwt from 'jsonwebtoken';

function authenticate(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            error: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Requires admin privileges.'
        });
    }
    next();
};

// ✅ IMPORTANT
export { authenticate, authorizeAdmin };