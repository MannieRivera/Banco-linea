const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UTH202403CC03';


function verifyToken(req, res, next) {
    console.log("Incoming headers:", req.headers); // Log incoming headers
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Token requerido' });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded; // Optional: pass user info to the request object
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { verifyToken };
