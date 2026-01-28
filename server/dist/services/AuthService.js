"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const UserRepository = __importStar(require("../repositories/UserRepository"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
/**
 * Handle user signup
 * @param input - Signup data (email, password, displayName)
 * @returns User object and JWT token
 * @throws ConflictError if user already exists
 */
const signup = async (input) => {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
        throw new AppError_1.ConflictError('User already exists');
    }
    const hashedPassword = await (0, password_1.hashPassword)(input.password);
    const user = await UserRepository.create({
        email: input.email,
        password: hashedPassword,
        displayName: input.displayName,
    });
    const token = (0, jwt_1.generateToken)(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
};
exports.signup = signup;
/**
 * Handle user login
 * @param input - Login data (email, password)
 * @returns User object and JWT token
 * @throws UnauthorizedError if credentials are invalid
 */
const login = async (input) => {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    const isValid = await (0, password_1.comparePassword)(input.password, user.password);
    if (!isValid) {
        throw new AppError_1.UnauthorizedError('Invalid credentials');
    }
    const token = (0, jwt_1.generateToken)(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
};
exports.login = login;
