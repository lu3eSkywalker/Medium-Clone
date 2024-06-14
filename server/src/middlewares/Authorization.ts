import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    // Split the Authorization header to get the token part after 'Bearer '
    const [bearer, token] = authHeader.split(' ');

    if (!token || bearer.toLowerCase() !== 'bearer') {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}

export default authenticate;