"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const websocket_1 = require("./websocket");
// Validate environment variables before starting
const config = (0, env_1.validateEnv)();
// Create HTTP server
const httpServer = (0, http_1.createServer)(app_1.default);
// Initialize WebSocket server
(0, websocket_1.initializeWebSocket)(httpServer);
httpServer.listen(config.PORT, () => {
    // Only log in development mode
    if (config.NODE_ENV !== 'production') {
        console.log(`Server running on port ${config.PORT}`);
        console.log(`WebSocket server initialized`);
    }
});
