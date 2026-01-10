/**
 * AppShell Web Component
 * Main application shell that composes all components
 */
class AppShellElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.initializeChart();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                /* Desktop layout */
                @media (min-width: 768px) {
                    :host {
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }

                    #desktop-wrapper {
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                        flex-direction: column;
                    }

                    #main-content-wrapper {
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                    }

                    #main-content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }

                    #content-area {
                        flex: 1;
                        overflow: auto;
                        padding: 20px;
                    }

                    #chart-container {
                        margin-top: 20px;
                        max-width: 600px;
                    }
                }

                /* Mobile layout */
                @media (max-width: 767px) {
                    #desktop-wrapper,
                    #main-content-wrapper,
                    #main-content {
                        display: contents;
                    }

                    #content-area {
                        display: block;
                    }

                    #chart-container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 10px;
                    }
                }
            </style>

            <!-- Mobile buttons -->
            <mobile-buttons></mobile-buttons>

            <!-- Mobile menu -->
            <mobile-menu></mobile-menu>

            <!-- Desktop menu bar -->
            <menu-bar></menu-bar>

            <!-- Desktop wrapper -->
            <div id="desktop-wrapper">
                <!-- Toolbar -->
                <tool-bar></tool-bar>

                <!-- Content wrapper with sidebar and main area side by side -->
                <div id="main-content-wrapper">
                    <!-- Sidebar -->
                    <side-bar></side-bar>

                    <!-- Main content -->
                    <div id="main-content">
                        <!-- Content area -->
                        <div id="content-area">
                            <chart-form></chart-form>

                            <div id="chart-container">
                                <astro-chart></astro-chart>
                            </div>
                        </div>

                        <!-- Status bar -->
                        <status-bar></status-bar>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Chart form update event
        this.shadowRoot.addEventListener('chart-update', (e) => {
            this.updateChart(e.detail);
        });

        // Menu actions from menu-bar
        this.shadowRoot.addEventListener('menu-action', (e) => {
            this.handleMenuAction(e.detail.action);
        });

        // Navigation changes from menu-bar
        this.shadowRoot.addEventListener('nav-change', (e) => {
            this.handleNavChange(e.detail.view);
        });

        // Icon actions from menu-bar
        this.shadowRoot.addEventListener('icon-action', (e) => {
            this.handleIconAction(e.detail.action);
        });

        // Toolbar actions
        this.shadowRoot.addEventListener('toolbar-action', (e) => {
            this.handleToolbarAction(e.detail.action);
        });

        // Chart type changes
        this.shadowRoot.addEventListener('chart-type-change', (e) => {
            this.handleChartTypeChange(e.detail.chartType);
        });

        // House system changes
        this.shadowRoot.addEventListener('house-system-change', (e) => {
            this.handleHouseSystemChange(e.detail.houseSystem);
        });

        // Mobile menu toggle
        this.shadowRoot.addEventListener('toggle-menu', () => {
            const mobileMenu = this.shadowRoot.querySelector('mobile-menu');
            if (mobileMenu) {
                mobileMenu.toggle();
            }
        });

        // Mobile menu select
        this.shadowRoot.addEventListener('menu-select', (e) => {
            if (e.detail.action === 'manual-chart') {
                const chartForm = this.shadowRoot.querySelector('chart-form');
                if (chartForm) {
                    chartForm.classList.add('active');
                }
            }
        });
    }

    initializeChart() {
        const chartForm = this.shadowRoot.querySelector('chart-form');
        if (chartForm) {
            // On desktop, show the form by default
            if (window.innerWidth >= 768) {
                chartForm.classList.add('active');
            }

            const data = chartForm.getChartData();
            this.updateChart(data);
        }
    }

    updateChart(data) {
        const chart = this.shadowRoot.querySelector('astro-chart');
        if (chart) {
            chart.setPlanets(data.planets);
            chart.setAscendant(data.ascendant);
        }

        const statusBar = this.shadowRoot.querySelector('status-bar');
        if (statusBar) {
            statusBar.setStatus('Chart updated');
            setTimeout(() => statusBar.setStatus('Ready'), 2000);
        }
    }

    exportChart() {
        const chart = this.shadowRoot.querySelector('astro-chart');
        if (!chart) return;

        const svg = chart.shadowRoot.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);

        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match SVG viewBox
        canvas.width = 600;
        canvas.height = 600;

        // Detect if dark mode and set background
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create an image from SVG data
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            // Convert canvas to blob and download
            canvas.toBlob(function(blob) {
                const link = document.createElement('a');
                link.download = 'astro-chart.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            });
        };

        img.src = url;
    }

    contactAuthor() {
        window.location.href = 'mailto:your-email@example.com?subject=Astrodex Feedback';
    }

    handleMenuAction(action) {
        switch (action) {
            case 'export':
                this.exportChart();
                break;
            case 'export-pdf':
                this.exportPDF();
                break;
            case 'print':
                window.print();
                break;
            case 'new-chart':
                this.newChart();
                break;
            case 'open':
                this.openChart();
                break;
            case 'save':
                this.saveChart();
                break;
            case 'save-as':
                this.saveChartAs();
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'copy-chart':
                this.copyChart();
                break;
            case 'preferences':
                this.openPreferences();
                break;
            case 'zoom-in':
                this.zoomIn();
                break;
            case 'zoom-out':
                this.zoomOut();
                break;
            case 'fit-window':
                this.fitToWindow();
                break;
            case 'show-grid':
                this.toggleGrid();
                break;
            case 'show-aspects':
                this.toggleAspects();
                break;
            case 'documentation':
                this.openDocumentation();
                break;
            case 'keyboard-shortcuts':
                this.showKeyboardShortcuts();
                break;
            case 'about':
                this.showAbout();
                break;
            default:
                console.log('Unhandled menu action:', action);
        }
    }

    handleNavChange(view) {
        // Handle view navigation
        console.log('Navigating to view:', view);
        // Implementation would load different views based on the view parameter
    }

    handleIconAction(action) {
        console.log('Icon action:', action);
        // Handle search, settings, etc.
    }

    handleToolbarAction(action) {
        switch (action) {
            case 'new-chart':
                this.newChart();
                break;
            case 'open':
                this.openChart();
                break;
            case 'save':
                this.saveChart();
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'zoom-in':
                this.zoomIn();
                break;
            case 'zoom-out':
                this.zoomOut();
                break;
            default:
                console.log('Unhandled toolbar action:', action);
        }
    }

    handleChartTypeChange(chartType) {
        console.log('Chart type changed to:', chartType);
        // Update chart type and recalculate if needed
    }

    handleHouseSystemChange(houseSystem) {
        console.log('House system changed to:', houseSystem);
        // Update house system and recalculate if needed
    }

    // Placeholder methods for various actions
    newChart() {
        console.log('Creating new chart');
        // Reset form and clear chart
    }

    openChart() {
        console.log('Opening chart');
        // Open file dialog and load chart
    }

    saveChart() {
        console.log('Saving chart');
        // Save current chart
    }

    saveChartAs() {
        console.log('Saving chart as...');
        // Save chart with new name
    }

    undo() {
        console.log('Undo action');
        // Implement undo functionality
    }

    redo() {
        console.log('Redo action');
        // Implement redo functionality
    }

    copyChart() {
        console.log('Copying chart');
        // Copy chart to clipboard
    }

    openPreferences() {
        console.log('Opening preferences');
        // Open preferences dialog
    }

    zoomIn() {
        console.log('Zooming in');
        // Implement zoom in
    }

    zoomOut() {
        console.log('Zooming out');
        // Implement zoom out
    }

    fitToWindow() {
        console.log('Fitting to window');
        // Fit chart to window
    }

    toggleGrid() {
        console.log('Toggling grid');
        // Toggle chart grid
    }

    toggleAspects() {
        console.log('Toggling aspects');
        // Toggle aspect lines
    }

    exportPDF() {
        console.log('Exporting PDF');
        // Export chart as PDF
    }

    openDocumentation() {
        console.log('Opening documentation');
        // Open documentation
    }

    showKeyboardShortcuts() {
        console.log('Showing keyboard shortcuts');
        // Show keyboard shortcuts dialog
    }

    showAbout() {
        console.log('Showing about dialog');
        // Show about dialog
    }
}

customElements.define('app-shell', AppShellElement);
