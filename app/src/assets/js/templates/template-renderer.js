/**
 * Template Renderer
 * Composes the app layout from template functions
 * Preserves Alpine.js functionality on rendered content
 */

class TemplateRenderer {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize the renderer with a container element
   * @param {string} containerId - ID of the container element
   */
  init(containerId = 'app-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with ID '${containerId}' not found`);
    }
  }

  /**
   * Render the complete app layout from template functions
   * @param {Object} templates - Object containing template functions
   * @param {Function} templates.layout - Layout template function
   * @param {Function} templates.header - Header template function
   * @param {Function} templates.sidebar - Sidebar template function
   * @param {Function} templates.main - Main content template function
   * @param {Function} templates.properties - Properties panel template function
   * @param {Function} templates.footer - Footer template function
   */
  render(templates) {
    if (!this.container) {
      throw new Error('TemplateRenderer not initialized. Call init() first.');
    }

    // Clear container
    this.container.innerHTML = '';

    // Create the main layout structure
    const layoutWrapper = document.createElement('div');
    layoutWrapper.className = 'min-h-screen flex flex-col bg-gray-900';

    // Add header
    if (templates.header) {
      const headerFragment = templates.header();
      layoutWrapper.appendChild(headerFragment);
    }

    // Create the main content wrapper (sidebar + main + properties)
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex flex-1 overflow-hidden';

    // Add sidebar
    if (templates.sidebar) {
      const sidebarFragment = templates.sidebar();
      contentWrapper.appendChild(sidebarFragment);
    }

    // Add main content area
    if (templates.main) {
      const mainFragment = templates.main();
      contentWrapper.appendChild(mainFragment);
    }

    // Add properties panel
    if (templates.properties) {
      const propertiesFragment = templates.properties();
      contentWrapper.appendChild(propertiesFragment);
    }

    layoutWrapper.appendChild(contentWrapper);

    // Add status bar
    const statusBar = this.createStatusBar();
    layoutWrapper.appendChild(statusBar);

    // Wrap in section with Alpine.js data
    const section = document.createElement('section');
    section.setAttribute('x-data', "{ mobileNavOpen: false, activeMenu: null, activeTab: 'chart', selectedPlanet: null, chartType: 'natal' }");
    section.className = 'min-h-screen flex flex-col bg-gray-900';

    // Move all children from layoutWrapper to section
    while (layoutWrapper.firstChild) {
      section.appendChild(layoutWrapper.firstChild);
    }

    this.container.appendChild(section);

    // Add footer outside the section
    if (templates.footer) {
      const footerFragment = templates.footer();
      this.container.appendChild(footerFragment);
    }

    // Re-initialize Alpine.js for the new content
    this.initAlpine();
  }

  /**
   * Create the status bar element
   * @returns {HTMLElement}
   */
  createStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.className = 'bg-gray-800 border-t border-gray-700 px-3 py-1 flex items-center justify-between text-xs text-gray-500';
    statusBar.innerHTML = `
      <div class="flex items-center space-x-4">
        <span id="statusChartName">Chart: Sample Chart</span>
        <span>|</span>
        <span id="statusDateTime">June 15, 1990 14:30</span>
        <span>|</span>
        <span id="statusLocation">New York, NY</span>
      </div>
      <div class="flex items-center space-x-4">
        <span id="statusHouseSystem">Placidus</span>
        <span>|</span>
        <span id="statusZodiac">Tropical</span>
        <span>|</span>
        <span id="statusZoom">Zoom: 100%</span>
      </div>
    `;
    return statusBar;
  }

  /**
   * Initialize Alpine.js on the container
   */
  initAlpine() {
    if (window.Alpine) {
      // For Alpine.js v3
      if (window.Alpine.initTree) {
        window.Alpine.initTree(this.container);
      }
      // For older versions
      else if (window.Alpine.init) {
        window.Alpine.init(this.container);
      }
    }
  }

  /**
   * Update status bar with chart data
   * @param {Object} data - Chart data
   */
  updateStatusBar(data) {
    if (data.name) {
      const el = document.getElementById('statusChartName');
      if (el) el.textContent = `Chart: ${data.name}`;
    }
    if (data.date && data.time) {
      const el = document.getElementById('statusDateTime');
      if (el) {
        const date = new Date(data.date + 'T' + data.time);
        el.textContent = date.toLocaleDateString() + ' ' + data.time;
      }
    }
    if (data.location) {
      const el = document.getElementById('statusLocation');
      if (el) el.textContent = data.location;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateRenderer };
} else {
  window.TemplateRenderer = TemplateRenderer;
}
