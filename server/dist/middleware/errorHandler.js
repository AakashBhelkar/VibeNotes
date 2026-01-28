"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: {
                type: err.constructor.name,
                message: err.message,
            },
        });
    }
    if (err instanceof zod_1.ZodError) {
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
exports.errorHandler = errorHandler;
