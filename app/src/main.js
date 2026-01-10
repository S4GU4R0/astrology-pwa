import { pwaInfo } from 'virtual:pwa-info';

// Styles
import '../css/style.css';

// Plugins
import * as Utils from "./plugins/utils";
import Themer from "./plugins/themer";

// App initialization
import { initApp } from './app.js';

// Initialize theme
const theme = Themer();
theme.initTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Debug info
console.log('Utils test:', Utils.msToTime(1300));
console.log('PWA Info:', pwaInfo);
