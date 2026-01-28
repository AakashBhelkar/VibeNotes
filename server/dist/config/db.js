"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Graceful shutdown handler for Prisma
 * Ensures database connections are properly closed on app termination
 */
async function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Closing database connections...`);
    await prisma.$disconnect();
    process.exit(0);
}
// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions gracefully
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await prisma.$disconnect();
    process.exit(1);
});
exports.default = prisma;
