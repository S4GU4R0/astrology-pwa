/**
 * Main Content Template Function
 * Creates the main content area with chart display
 */

function createMainTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
    <main class="flex-1 bg-gray-900 flex items-center justify-center p-8 overflow-auto" id="mainContentArea">
      <div id="chartView" class="chart-container relative w-full max-w-2xl aspect-square flex items-center justify-center">
        <p class="text-gray-500">Click "Calculate Chart" to generate your chart</p>
      </div>
    </main>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createMainTemplate };
export default createMainTemplate;
