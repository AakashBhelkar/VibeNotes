"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const db_1 = __importDefault(require("../config/db"));
// Type guard to validate decoded JWT structure
function isValidDecodedToken(decoded) {
    return (typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded &&
        typeof decoded.userId === 'string');
}
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: { message: 'Unauthorized - No token provided' } });
    }
    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
        return res.status(401).json({ error: { message: 'Unauthorized - Invalid token format' } });
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        // Validate the decoded token has the expected structure
        if (!isValidDecodedToken(decoded)) {
            return res.status(401).json({ error: { message: 'Unauthorized - Invalid token structure' } });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({ error: { message: 'Unauthorized - User not found' } });
        }
        req.user = { id: user.id, userId: user.id };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
};
exports.authenticate = authenticate;
// Alias for backward compatibility
exports.authenticateToken = exports.authenticate;
