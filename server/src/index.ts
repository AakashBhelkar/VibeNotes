import 'dotenv/config';
import { createServer } from 'http';

import { validateEnv } from './config/env';
import app from './app';
import { initializeWebSocket } from './websocket';

// Validate environment variables before starting
const config = validateEnv();

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
initializeWebSocket(httpServer);

httpServer.listen(config.PORT, () => {
    // Only log in development mode
    if (config.NODE_ENV !== 'production') {
        console.log(`Server running on port ${config.PORT}`);
        console.log(`WebSocket server initialized`);
    }
});
