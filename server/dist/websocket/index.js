"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = initializeWebSocket;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const collaboration_1 = require("./collaboration");
// Type guard for decoded token
function isValidDecodedToken(decoded) {
    return (typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded &&
        typeof decoded.userId === 'string');
}
/**
 * Initialize WebSocket server
 */
function initializeWebSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
        path: '/socket.io',
    });
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!isValidDecodedToken(decoded)) {
                return next(new Error('Invalid token'));
            }
            socket.userId = decoded.userId;
            next();
        }
        catch {
            return next(new Error('Invalid or expired token'));
        }
    });
    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        // Setup collaboration handlers
        (0, collaboration_1.setupCollaborationHandlers)(io, socket);
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
    return io;
}
