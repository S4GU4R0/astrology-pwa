/**
 * View Manager
 * Handles switching between different views in the main content area
 */

export const ViewManager = {
    currentView: 'chart',

    loadView(viewName) {
        const mainContent = document.getElementById('mainContentArea');
        if (!mainContent) return;

        mainContent.style.alignItems = 'flex-start';
        mainContent.style.justifyContent = 'flex-start';

        switch (viewName) {
            case 'chart':
                mainContent.innerHTML = `
                <div id="chartView" class="chart-container relative w-full max-w-2xl aspect-square mx-auto" style="margin-top: 2rem;">
                    <svg viewbox="0 0 400 400" class="w-full h-full">
                        <circle cx="200" cy="200" r="190" fill="none" stroke="#4B5563" stroke-width="1"></circle>
                        <circle cx="200" cy="200" r="160" fill="none" stroke="#4B5563" stroke-width="1"></circle>
                        <circle cx="200" cy="200" r="120" fill="none" stroke="#374151" stroke-width="1"></circle>
                        <circle cx="200" cy="200" r="60" fill="none" stroke="#374151" stroke-width="1"></circle>
                        <line x1="200" y1="10" x2="200" y2="40" stroke="#6B7280" stroke-width="2"></line>
                        <line x1="200" y1="360" x2="200" y2="390" stroke="#6B7280" stroke-width="2"></line>
                        <line x1="10" y1="200" x2="40" y2="200" stroke="#6B7280" stroke-width="2"></line>
                        <line x1="360" y1="200" x2="390" y2="200" stroke="#6B7280" stroke-width="2"></line>
                        <text x="200" y="25" text-anchor="middle" fill="#9CA3AF" font-size="10">MC</text>
                        <text x="200" y="385" text-anchor="middle" fill="#9CA3AF" font-size="10">IC</text>
                        <text x="20" y="204" text-anchor="middle" fill="#9CA3AF" font-size="10">ASC</text>
                        <text x="380" y="204" text-anchor="middle" fill="#9CA3AF" font-size="10">DSC</text>
                    </svg>
                </div>`;
                mainContent.style.alignItems = 'center';
                mainContent.style.justifyContent = 'center';
                break;

            case 'planetary_conditions':
                mainContent.innerHTML = '<planetary-conditions-view></planetary-conditions-view>';
                break;

            case 'natal_report':
                mainContent.innerHTML = '<natal-report-view></natal-report-view>';
                break;

            case 'test':
                mainContent.innerHTML = '<test-suite-view></test-suite-view>';
                break;

            default:
                console.warn('Unknown view:', viewName);
        }

        this.currentView = viewName;
    }
};

// Also expose on window for legacy components
window.ViewManager = ViewManager;

// Listen for view-change events
document.addEventListener('view-change', (e) => {
    if (e.detail && e.detail.view) {
        ViewManager.loadView(e.detail.view);
    }
});

export default ViewManager;
