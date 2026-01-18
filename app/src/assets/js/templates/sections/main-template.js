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
            <p class="text-xs text-gray-400 leading-relaxed">Curious, communicative, and adaptable. You thrive on mental
                stimulation and social interaction.</p>
        </div>
        <div class="p-3 bg-gray-700 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Moon in Scorpio</h4>
            <p class="text-xs text-gray-400 leading-relaxed">Emotionally intense and deeply intuitive. You experience
                feelings with great depth and passion.</p>
        </div>
        <div class="p-3 bg-gray-700 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Libra Rising</h4>
            <p class="text-xs text-gray-400 leading-relaxed">Charming and diplomatic presence. You approach life seeking
                balance, harmony, and partnership.</p>
        </div>
    </div>
</div>
    </main>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createMainTemplate };
export default createMainTemplate;
