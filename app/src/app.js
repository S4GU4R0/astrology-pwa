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

// Import chart renderer
import chartRenderer from './assets/js/chart-renderer.js';

// Import UI helpers (exposes showToast globally)
import './assets/js/ui-helpers.js';

// Import view components (web components self-register)
import './assets/js/components/planetary-conditions-view.js';
import './assets/js/components/test-suite-view.js';

// Store renderer reference for status bar updates
let renderer = null;

// Location geocoding cache (major cities)
const CITY_COORDS = {
    'new york': { lat: 40.7128, lon: -74.0060 },
    'new york, ny': { lat: 40.7128, lon: -74.0060 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'los angeles, ca': { lat: 34.0522, lon: -118.2437 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'chicago, il': { lat: 41.8781, lon: -87.6298 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'london, uk': { lat: 51.5074, lon: -0.1278 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'paris, france': { lat: 48.8566, lon: 2.3522 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'berlin': { lat: 52.5200, lon: 13.4050 },
    'rome': { lat: 41.9028, lon: 12.4964 },
    'madrid': { lat: 40.4168, lon: -3.7038 },
    'amsterdam': { lat: 52.3676, lon: 4.9041 },
    'moscow': { lat: 55.7558, lon: 37.6173 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'beijing': { lat: 39.9042, lon: 116.4074 },
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'singapore': { lat: 1.3521, lon: 103.8198 },
    'hong kong': { lat: 22.3193, lon: 114.1694 },
    'toronto': { lat: 43.6532, lon: -79.3832 },
    'san francisco': { lat: 37.7749, lon: -122.4194 },
    'san francisco, ca': { lat: 37.7749, lon: -122.4194 },
    'miami': { lat: 25.7617, lon: -80.1918 },
    'miami, fl': { lat: 25.7617, lon: -80.1918 },
    'seattle': { lat: 47.6062, lon: -122.3321 },
    'seattle, wa': { lat: 47.6062, lon: -122.3321 },
    'boston': { lat: 42.3601, lon: -71.0589 },
    'boston, ma': { lat: 42.3601, lon: -71.0589 },
    'denver': { lat: 39.7392, lon: -104.9903 },
    'denver, co': { lat: 39.7392, lon: -104.9903 },
    'atlanta': { lat: 33.7490, lon: -84.3880 },
    'atlanta, ga': { lat: 33.7490, lon: -84.3880 },
    'phoenix': { lat: 33.4484, lon: -112.0740 },
    'phoenix, az': { lat: 33.4484, lon: -112.0740 },
    'dallas': { lat: 32.7767, lon: -96.7970 },
    'dallas, tx': { lat: 32.7767, lon: -96.7970 },
    'houston': { lat: 29.7604, lon: -95.3698 },
    'houston, tx': { lat: 29.7604, lon: -95.3698 },
    'austin': { lat: 30.2672, lon: -97.7431 },
    'austin, tx': { lat: 30.2672, lon: -97.7431 }
};

/**
 * Get coordinates from location string
 */
function getCoordinates(location) {
    const normalized = location.toLowerCase().trim();
    if (CITY_COORDS[normalized]) {
        return CITY_COORDS[normalized];
    }
    // Default to New York if not found
    console.warn(`Location "${location}" not found in cache, using New York as default`);
    return CITY_COORDS['new york'];
}

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
        calcBtn.addEventListener('click', async function() {
            const chartData = ChartData.getCurrentData();
            ChartData.save(chartData);

            const originalText = calcBtn.textContent;
            calcBtn.textContent = 'Calculating...';
            calcBtn.disabled = true;

            try {
                // Get form values
                const date = document.getElementById('chartDate')?.value;
                const time = document.getElementById('chartTime')?.value;
                const location = document.getElementById('chartLocation')?.value || 'New York, NY';

                if (!date || !time) {
                    throw new Error('Please enter date and time');
                }

                // Check if astronomy library is loaded
                if (typeof Astronomy === 'undefined') {
                    throw new Error('Astronomy library not loaded. Please check your internet connection.');
                }

                // Get coordinates for location
                const coords = getCoordinates(location);

                // Calculate chart
                await chartRenderer.calculateChart(date, time, coords.lat, coords.lon);

                // Render the chart
                const chartContainer = document.getElementById('chartView');
                if (chartContainer) {
                    chartRenderer.renderChart(chartContainer);
                }

                // Update sidebar lists
                chartRenderer.updatePlanetList();
                chartRenderer.updateHouseList();

                // Get chart data for display
                const data = chartRenderer.getChartData();
                const aspectCount = data.aspects?.length || 0;

                calcBtn.textContent = originalText;
                calcBtn.disabled = false;

                if (typeof window.showToast === 'function') {
                    window.showToast(`Chart calculated! ${aspectCount} aspects found.`, 'success');
                }

                // Update status bar if renderer exists
                if (renderer) {
                    renderer.updateStatusBar({
                        ...chartData,
                        sect: data.sect,
                        aspectCount: aspectCount
                    });
                }

            } catch (error) {
                console.error('Chart calculation error:', error);
                calcBtn.textContent = originalText;
                calcBtn.disabled = false;

                if (typeof window.showToast === 'function') {
                    window.showToast(`Error: ${error.message}`, 'error');
                }
            }
        });
    }
}

export default initApp;
