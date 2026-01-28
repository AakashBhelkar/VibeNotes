import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { setupCollaborationHandlers } from './collaboration';

/**
 * WebSocket server setup
 * Handles real-time collaboration features
 */

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userEmail?: string;
}

// Type guard for decoded token
function isValidDecodedToken(decoded: unknown): decoded is { userId: string } {
    return (
        typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded &&
        typeof (decoded as { userId: unknown }).userId === 'string'
    );
}

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
        path: '/socket.io',
    });

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = verifyToken(token);

            if (!isValidDecodedToken(decoded)) {
                return next(new Error('Invalid token'));
            }

            socket.userId = decoded.userId;
            next();
        } catch {
            return next(new Error('Invalid or expired token'));
        }
    });

    // Connection handler
    io.on('connection', (socket: AuthenticatedSocket) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`User connected: ${socket.userId}`);
        }

        // Setup collaboration handlers
        setupCollaborationHandlers(io, socket);

        // Handle disconnect
        socket.on('disconnect', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`User disconnected: ${socket.userId}`);
            }
        });
    });

    return io;
}

export type { AuthenticatedSocket };
