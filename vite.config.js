import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    root: 'app',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./app/src', import.meta.url))
        }
    },
    css: {
        postcss: './postcss.config.js'
    },
    build: {
        sourcemap: process.env.SOURCE_MAP === 'true',
        outDir: '../dist'
    },
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'Lunar Ice',
                short_name: 'Lunar Ice',
                description: 'Hellenistic Astrology PWA',
                theme_color: '#1f2937',
                background_color: '#111827',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            devOptions: {
                enabled: process.env.SW_DEV === 'true'
            }
        })
    ]
});
