import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';

import AuthRoutes from './routes/AuthRoutes';
import NoteRoutes from './routes/NoteRoutes';
import AttachmentRoutes from './routes/attachments';
import ColorLabelRoutes from './routes/ColorLabelRoutes';
import FolderRoutes from './routes/FolderRoutes';
import ActivityRoutes from './routes/ActivityRoutes';
import CommentRoutes from './routes/CommentRoutes';
import WorkspaceRoutes from './routes/WorkspaceRoutes';
import { errorHandler } from './middleware/errorHandler';
import { AUTH_CONFIG } from './config/constants';

const app = express();

// Rate limiting for auth endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
    windowMs: AUTH_CONFIG.RATE_LIMIT_WINDOW_MS,
    max: AUTH_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    message: { error: { message: 'Too many authentication attempts, please try again later' } },
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: { message: 'Too many requests, please slow down' } },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply stricter rate limiting to auth routes
app.use('/auth', authLimiter, AuthRoutes);
app.use('/notes', NoteRoutes);
app.use('/api/attachments', AttachmentRoutes);
app.use('/api/color-labels', ColorLabelRoutes);
app.use('/api/folders', FolderRoutes);
app.use('/api/activities', ActivityRoutes);
app.use('/api/comments', CommentRoutes);
app.use('/api/workspaces', WorkspaceRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});

app.use(errorHandler);

export default app;
