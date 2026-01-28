import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/AuthService';

/**
 * Handle user signup
 */
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await AuthService.signup(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await AuthService.login(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
