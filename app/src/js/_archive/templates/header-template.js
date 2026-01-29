/**
 * Header Template Function
 * Creates the header section with navigation and toolbar
 */

function createHeaderTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
  <div class="bg-gray-800 border-b border-gray-700">
   <div class="flex items-center px-2 py-1">
      <nav class="flex items-center space-x-1">
         <div class="relative" x-on:mouseleave="activeMenu = null">
            <button x-on:mouseenter="activeMenu = 'app'" class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded">
               <div class="flex items-center mr-4">
                  <img class="h-5 mr-2" src="/favicon.ico" alt="Lunar Ice">
                  <span class="text-sm text-gray-300 font-semibold">Lunar Ice</span>
               </div>
            </button>
            <div x-show="activeMenu === 'app'" class="absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Preferences...</a>
            </div>
         </div>
         <div class="relative" x-on:mouseleave="activeMenu = null">
            <button x-on:mouseenter="activeMenu = 'file'" class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded">File</button>
            <div x-show="activeMenu === 'file'" class="absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Chart</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Open...</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Save</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Save As...</a>
               <div class="border-t border-gray-700 my-1"></div>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Export PDF</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Print...</a>
            </div>
         </div>
         <div class="relative" x-on:mouseleave="activeMenu = null">
            <button x-on:mouseenter="activeMenu = 'edit'" class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded">Edit</button>
            <div x-show="activeMenu === 'edit'" class="absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Undo</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Redo</a>
               <div class="border-t border-gray-700 my-1"></div>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Copy Chart</a>
            </div>
         </div>
         <div class="relative" x-on:mouseleave="activeMenu = null">
            <button x-on:mouseenter="activeMenu = 'tools'" class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded">Tools</button>
            <div x-show="activeMenu === 'tools'" class="absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
               <a href="#" onclick="ViewManager.loadView('planetary_conditions'); return false;" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Planetary Conditions</a>
               <a href="#" onclick="ViewManager.loadView('natal_report'); return false;" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Natal Report</a>
               <a href="#" onclick="ViewManager.loadView('chart'); return false;" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Chart View</a>
               <a href="#" onclick="ViewManager.loadView('test'); return false;" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Test Suite</a>
               <div class="border-t border-gray-700 my-1"></div>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Aspect Calculator</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Ephemeris</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">House System</a>
            </div>
         </div>
         <div class="relative" x-on:mouseleave="activeMenu = null">
            <button x-on:mouseenter="activeMenu = 'help'" class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded">Help</button>
            <div x-show="activeMenu === 'help'" class="absolute left-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Documentation</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Keyboard Shortcuts</a>
               <div class="border-t border-gray-700 my-1"></div>
               <a href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">About Lunar Ice</a>
            </div>
         </div>
      </nav>
   </div>
   <div class="flex items-center px-2 py-1 bg-gray-750 border-t border-gray-700" style="background-color: #374151;">
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="New Chart">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
         </svg>
      </button>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Open">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
         </svg>
      </button>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Save">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
         </svg>
      </button>
      <div class="w-px h-5 bg-gray-600 mx-2"></div>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Undo">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
         </svg>
      </button>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Redo">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path>
         </svg>
      </button>
      <div class="w-px h-5 bg-gray-600 mx-2"></div>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Zoom In">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
         </svg>
      </button>
      <button class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded" title="Zoom Out">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
         </svg>
      </button>
      <div class="w-px h-5 bg-gray-600 mx-2"></div>
      <select class="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600">
         <option>Natal Chart</option>
         <option>Transit</option>
         <option>Synastry</option>
         <option>Composite</option>
      </select>
      <select class="ml-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600">
         <option>Placidus</option>
         <option>Koch</option>
         <option>Whole Sign</option>
         <option>Equal</option>
      </select>
   </div>
</div>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createHeaderTemplate };
export default createHeaderTemplate;
