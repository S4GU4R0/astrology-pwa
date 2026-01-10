/**
 * AppLayout Template Function
 * Creates the main layout structure using <template> tags
 * Preserves Alpine.js functionality on rendered content
 */

function createAppLayout() {
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="min-h-screen flex flex-col bg-gray-900">
      <!-- Header will be populated by existing header content -->
      <slot name="header"></slot>
      
      <!-- Main content area -->
      <main class="flex flex-1 overflow-hidden">
        <!-- Sidebar slot -->
        <slot name="sidebar" class="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0"></slot>
        
        <!-- Main content slot -->
        <slot name="main" class="flex-1 bg-gray-900 overflow-auto"></slot>
        
        <!-- Properties panel slot -->
        <slot name="properties" class="w-72 bg-gray-800 border-l border-gray-700 flex-shrink-0"></slot>
      </main>
      
      <!-- Status bar -->
      <div class="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <div class="flex items-center space-x-4">
            <span id="chartInfo">Chart: Sample Chart</span>
            <span>|</span>
            <span id="dateTimeInfo">June 15, 1990 14:30</span>
            <span>|</span>
            <span id="locationInfo">New York, NY</span>
          </div>
          <div class="flex items-center space-x-4">
            <span id="houseSystem">Placidus</span>
            <span>|</span>
            <span id="zodiacType">Tropical</span>
            <span>|</span>
            <span id="zoomLevel">Zoom: 100%</span>
          </div>
        </div>
      </div>
      
      <!-- Footer will be populated by existing footer content -->
      <slot name="footer"></slot>
    </div>
  `;
  return template.content.cloneNode(true);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createAppLayout };
} else {
  window.AppLayoutTemplate = { createAppLayout };
}
