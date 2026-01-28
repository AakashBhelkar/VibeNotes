import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'logo.svg'],
            manifest: {
                name: 'VibeNotes',
                short_name: 'VibeNotes',
                description: 'Offline-first collaborative note-taking app',
                theme_color: '#6366f1',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'favicon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                    {
                        src: 'logo.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                // Cache strategies
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                        },
                    },
                ],
                // Precache app shell
                globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        // Code splitting configuration
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks for large libraries
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
                    'vendor-markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
                    'vendor-collab': ['yjs', 'socket.io-client'],
                    'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 600,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
    },
})
