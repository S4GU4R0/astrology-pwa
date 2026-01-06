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

        // Toolbar update event
        this.shadowRoot.addEventListener('toolbar-update', () => {
            const chartForm = this.shadowRoot.querySelector('chart-form');
            if (chartForm) {
                const data = chartForm.getChartData();
                this.updateChart(data);
            }
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

        // Navigation change
        this.shadowRoot.addEventListener('nav-change', (e) => {
            if (e.detail.view === 'manual-chart') {
                const chartForm = this.shadowRoot.querySelector('chart-form');
                if (chartForm) {
                    chartForm.classList.add('active');
                }
            }
        });

        // Menu actions
        this.shadowRoot.addEventListener('menu-action', (e) => {
            if (e.detail.action === 'export') {
                this.exportChart();
            } else if (e.detail.action === 'contact') {
                this.contactAuthor();
            }
        });

        // Export chart
        this.shadowRoot.addEventListener('export-chart', () => {
            this.exportChart();
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
}

customElements.define('app-shell', AppShellElement);
