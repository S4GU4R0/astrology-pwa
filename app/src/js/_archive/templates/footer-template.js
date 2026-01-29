/**
 * Footer Template Function
 * Creates the footer section with links and copyright
 */

function createFooterTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
    <footer class="bg-gray-800 border-t border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex items-center">
            <img class="h-6 mr-2" src="/favicon.ico" alt="Lunar Ice">
            <span class="text-sm text-gray-400">Lunar Ice</span>
          </div>
          <div class="flex items-center space-x-6">
            <a class="text-xs text-gray-500 hover:text-gray-300" href="#">Documentation</a>
            <a class="text-xs text-gray-500 hover:text-gray-300" href="#">Support</a>
            <a class="text-xs text-gray-500 hover:text-gray-300" href="#">Privacy</a>
            <a class="text-xs text-gray-500 hover:text-gray-300" href="#">Terms</a>
          </div>
          <p class="text-xs text-gray-500">© 2026 Lunar Ice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createFooterTemplate };
export default createFooterTemplate;
