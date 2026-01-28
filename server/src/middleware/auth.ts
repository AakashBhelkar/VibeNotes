import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/db';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        userId: string;
    };
}

// Type guard to validate decoded JWT structure
function isValidDecodedToken(decoded: unknown): decoded is { userId: string } {
    return (
        typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded &&
        typeof (decoded as { userId: unknown }).userId === 'string'
    );
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: { message: 'Unauthorized - No token provided' } });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
        return res.status(401).json({ error: { message: 'Unauthorized - Invalid token format' } });
    }

    try {
        const decoded = verifyToken(token);

        // Validate the decoded token has the expected structure
        if (!isValidDecodedToken(decoded)) {
            return res.status(401).json({ error: { message: 'Unauthorized - Invalid token structure' } });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ error: { message: 'Unauthorized - User not found' } });
        }

        req.user = { id: user.id, userId: user.id };
        next();
    } catch (error) {
        return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
};

// Alias for backward compatibility
export const authenticateToken = authenticate;
