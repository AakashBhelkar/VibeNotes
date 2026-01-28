"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const NoteRoutes_1 = __importDefault(require("./routes/NoteRoutes"));
const attachments_1 = __importDefault(require("./routes/attachments"));
const ColorLabelRoutes_1 = __importDefault(require("./routes/ColorLabelRoutes"));
const FolderRoutes_1 = __importDefault(require("./routes/FolderRoutes"));
const ActivityRoutes_1 = __importDefault(require("./routes/ActivityRoutes"));
const CommentRoutes_1 = __importDefault(require("./routes/CommentRoutes"));
const WorkspaceRoutes_1 = __importDefault(require("./routes/WorkspaceRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const constants_1 = require("./config/constants");
const app = (0, express_1.default)();
// Rate limiting for auth endpoints (prevent brute force attacks)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.AUTH_CONFIG.RATE_LIMIT_WINDOW_MS,
    max: constants_1.AUTH_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    message: { error: { message: 'Too many authentication attempts, please try again later' } },
    standardHeaders: true,
    legacyHeaders: false,
});
// General rate limiting
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: { message: 'Too many requests, please slow down' } },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, morgan_1.default)('dev'));
// Apply general rate limiting to all routes
app.use(generalLimiter);
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Documentation (Swagger UI)
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VibeNotes API Documentation',
}));
// Apply stricter rate limiting to auth routes
app.use('/auth', authLimiter, AuthRoutes_1.default);
app.use('/notes', NoteRoutes_1.default);
app.use('/api/attachments', attachments_1.default);
app.use('/api/color-labels', ColorLabelRoutes_1.default);
app.use('/api/folders', FolderRoutes_1.default);
app.use('/api/activities', ActivityRoutes_1.default);
app.use('/api/comments', CommentRoutes_1.default);
app.use('/api/workspaces', WorkspaceRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
