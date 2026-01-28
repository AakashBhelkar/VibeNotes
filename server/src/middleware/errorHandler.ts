import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Only log errors in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err.message);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                type: err.constructor.name,
                message: err.message,
            },
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                type: 'ValidationError',
                message: 'Validation failed',
                details: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }

    return res.status(500).json({
        error: {
            type: 'InternalServerError',
            message: 'Something went wrong',
        },
    });
};
