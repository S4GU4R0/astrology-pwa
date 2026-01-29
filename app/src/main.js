/**
 * Main Entry Point - Vue Application Bootstrap
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Import global CSS (Tailwind)
import './css/app.css';

// Import and initialize theme before app mounts
import { initTheme } from './composables/useTheme';
initTheme();

// Create Vue app
const app = createApp(App);

// Install Pinia (state management)
app.use(createPinia());

// Install Vue Router
app.use(router);

// Mount the app
app.mount('#app');

// PWA is handled automatically by vite-plugin-pwa
