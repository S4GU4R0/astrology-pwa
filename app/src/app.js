/**
 * App Initialization
 * Main application setup and initialization
 */

// Import template system
import { TemplateRenderer } from './assets/js/templates/template-renderer.js';
import { createHeaderTemplate } from './assets/js/templates/sections/header-template.js';
import { createSidebarTemplate } from './assets/js/templates/sections/sidebar-template.js';
import { createMainTemplate } from './assets/js/templates/sections/main-template.js';
import { createPropertiesTemplate } from './assets/js/templates/sections/properties-template.js';
import { createFooterTemplate } from './assets/js/templates/sections/footer-template.js';

// Import core modules
import { ChartData } from './lib/chart-data.js';
import { ViewManager } from './lib/view-manager.js';

// Import UI helpers (exposes showToast globally)
import './assets/js/ui-helpers.js';

// Import view components (web components self-register)
import './assets/js/components/planetary-conditions-view.js';
import './assets/js/components/test-suite-view.js';

// Store renderer reference for status bar updates
let renderer = null;

/**
 * Initialize the application
 */
export function initApp() {
    // Create and initialize renderer
    renderer = new TemplateRenderer();
    renderer.init('app-container');

    // Render all templates
    renderer.render({
        header: createHeaderTemplate,
        sidebar: createSidebarTemplate,
        main: createMainTemplate,
        properties: createPropertiesTemplate,
        footer: createFooterTemplate
    });

    // Load saved chart data
    const savedData = ChartData.load();
    if (savedData) {
        ChartData.setFormData(savedData);
        renderer.updateStatusBar(savedData);
    }

    // Setup form field change listeners
    setupFormListeners();

    // Setup calculate button
    setupCalculateButton();
}

/**
 * Setup form field change listeners
 */
function setupFormListeners() {
    ['chartName', 'chartDate', 'chartTime', 'chartLocation'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                const data = ChartData.getCurrentData();
                ChartData.save(data);
                if (renderer) {
                    renderer.updateStatusBar(data);
                }
            });
        }
    });
}

/**
 * Setup calculate chart button
 */
function setupCalculateButton() {
    const calcBtn = document.getElementById('calculateChartBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            const chartData = ChartData.getCurrentData();
            ChartData.save(chartData);

            const originalText = calcBtn.textContent;
            calcBtn.textContent = 'Calculating...';
            calcBtn.disabled = true;

            console.log('Calculate chart for:', chartData);

            setTimeout(() => {
                calcBtn.textContent = originalText;
                calcBtn.disabled = false;
                if (typeof window.showToast === 'function') {
                    window.showToast('Chart calculated successfully!', 'success');
                }
            }, 1000);
        });
    }
}

export default initApp;
