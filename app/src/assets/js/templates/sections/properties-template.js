/**
 * Properties Panel Template Function
 * Creates the properties panel with tabs for chart settings, aspects, and interpretations
 */

function createPropertiesTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
    <aside class="w-72 bg-gray-800 border-l border-gray-700 flex flex-col overflow-y-auto">
      <div class="p-3 border-b border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h3>
        <div class="flex space-x-1 mb-3">
          <button x-on:click="activeTab = 'chart'" :class="activeTab === 'chart' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'" class="px-3 py-1 text-xs rounded">Chart</button>
          <button x-on:click="activeTab = 'aspects'" :class="activeTab === 'aspects' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'" class="px-3 py-1 text-xs rounded">Aspects</button>
          <button x-on:click="activeTab = 'interp'" :class="activeTab === 'interp' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'" class="px-3 py-1 text-xs rounded">Interpret</button>
        </div>
      </div>
      <div x-show="activeTab === 'chart'" class="p-3 space-y-3">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Chart Style</label>
          <select class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600">
            <option>Modern</option>
            <option>Classical</option>
            <option>Minimalist</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">House System</label>
          <select class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600">
            <option>Placidus</option>
            <option>Koch</option>
            <option>Whole Sign</option>
            <option>Equal</option>
            <option>Campanus</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Zodiac</label>
          <select class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600">
            <option>Tropical</option>
            <option>Sidereal</option>
          </select>
        </div>
        <div>
          <label class="flex items-center text-sm text-gray-300">
            <input type="checkbox" class="mr-2" checked>
            <span>Show Aspects</span>
          </label>
        </div>
        <div>
          <label class="flex items-center text-sm text-gray-300">
            <input type="checkbox" class="mr-2" checked>
            <span>Show Minor Planets</span>
          </label>
        </div>
        <div>
          <label class="flex items-center text-sm text-gray-300">
            <input type="checkbox" class="mr-2">
            <span>Show Fixed Stars</span>
          </label>
        </div>
      </div>
      <div x-show="activeTab === 'aspects'" class="p-3">
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div class="flex items-center">
              <span class="text-yellow-400 mr-2">☉</span>
              <span class="text-red-400 mx-1">□</span>
              <span class="text-gray-300 ml-2">☽</span>
            </div>
            <span class="text-gray-400 text-xs">Square 2°15'</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div class="flex items-center">
              <span class="text-yellow-400 mr-2">☉</span>
              <span class="text-green-400 mx-1">△</span>
              <span class="text-pink-400 ml-2">♀</span>
            </div>
            <span class="text-gray-400 text-xs">Trine 1°08'</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div class="flex items-center">
              <span class="text-red-400 mr-2">♂</span>
              <span class="text-blue-400 mx-1">⚹</span>
              <span class="text-purple-400 ml-2">♃</span>
            </div>
            <span class="text-gray-400 text-xs">Sextile 0°42'</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div class="flex items-center">
              <span class="text-gray-300 mr-2">☽</span>
              <span class="text-yellow-400 mx-1">☌</span>
              <span class="text-amber-600 ml-2">♄</span>
            </div>
            <span class="text-gray-400 text-xs">Conjunction 3°21'</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div class="flex items-center">
              <span class="text-orange-400 mr-2">☿</span>
              <span class="text-red-400 mx-1">☍</span>
              <span class="text-amber-600 ml-2">♄</span>
            </div>
            <span class="text-gray-400 text-xs">Opposition 1°52'</span>
          </div>
        </div>
      </div>
      <div x-show="activeTab === 'interp'" class="p-3">
        <div class="space-y-3">
          <div class="p-3 bg-gray-700 rounded">
            <h4 class="text-sm font-semibold text-yellow-400 mb-1">Sun in Gemini</h4>
            <p class="text-xs text-gray-400 leading-relaxed">Curious, communicative, and adaptable. You thrive on mental stimulation and social interaction.</p>
          </div>
          <div class="p-3 bg-gray-700 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Moon in Scorpio</h4>
            <p class="text-xs text-gray-400 leading-relaxed">Emotionally intense and deeply intuitive. You experience feelings with great depth and passion.</p>
          </div>
          <div class="p-3 bg-gray-700 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Libra Rising</h4>
            <p class="text-xs text-gray-400 leading-relaxed">Charming and diplomatic presence. You approach life seeking balance, harmony, and partnership.</p>
          </div>
        </div>
      </div>
    </aside>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createPropertiesTemplate };
export default createPropertiesTemplate;
