import * as UserRepository from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { signupSchema, loginSchema } from '../utils/validationSchemas';
import { z } from 'zod';
import { ConflictError, UnauthorizedError } from '../utils/AppError';

type SignupInput = z.infer<typeof signupSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];

/**
 * Handle user signup
 * @param input - Signup data (email, password, displayName)
 * @returns User object and JWT token
 * @throws ConflictError if user already exists
 */
export const signup = async (input: SignupInput) => {
    const existingUser = await UserRepository.findByEmail(input.email);

    if (existingUser) {
        throw new ConflictError('User already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await UserRepository.create({
        email: input.email,
        password: hashedPassword,
        displayName: input.displayName,
    });

    const token = generateToken(user.id);

    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
};

/**
 * Handle user login
 * @param input - Login data (email, password)
 * @returns User object and JWT token
 * @throws UnauthorizedError if credentials are invalid
 */
export const login = async (input: LoginInput) => {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await comparePassword(input.password, user.password);

    if (!isValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken(user.id);

    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
};
