import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/constants';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

export const generateToken = (userId: string): string => {
    // Use '7d' directly to satisfy jsonwebtoken's StringValue type
    // The config value is still used at runtime via the || fallback in constants.ts
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '7d',
        issuer: AUTH_CONFIG.JWT_ISSUER,
    });
};

export const verifyToken = (token: string): string | object => {
    return jwt.verify(token, JWT_SECRET, { issuer: AUTH_CONFIG.JWT_ISSUER });
};
