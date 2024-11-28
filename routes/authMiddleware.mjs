import jwt from 'jsonwebtoken';  // Använd import istället för require

// Middleware för att autentisera JWT-token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Extrahera endast token-delen
    if (!token) return res.status(401).send('Access Denied');  // Om ingen token finns, neka åtkomst
    

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {  // Verifierar token
        if (err) return res.status(403).send('Token is not valid');  // Om token är ogiltig, returnera ett 403 fel
        req.user = user;  // Lägg till användaren i request-objektet
        next();  // Fortsätt till nästa middleware eller rutt
    });
};

export default authenticateToken;  // Exportera middleware med export default
