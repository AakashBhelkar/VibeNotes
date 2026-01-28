"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../config/constants");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}
const generateToken = (userId) => {
    // Use '7d' directly to satisfy jsonwebtoken's StringValue type
    // The config value is still used at runtime via the || fallback in constants.ts
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, {
        expiresIn: '7d',
        issuer: constants_1.AUTH_CONFIG.JWT_ISSUER,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET, { issuer: constants_1.AUTH_CONFIG.JWT_ISSUER });
};
exports.verifyToken = verifyToken;
