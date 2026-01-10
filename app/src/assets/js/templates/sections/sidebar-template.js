/**
 * Sidebar Template Function
 * Creates the sidebar section with chart data input and planet/house lists
 */

function createSidebarTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
    <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
      <div class="p-3 border-b border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Chart Data</h3>
        <div class="space-y-2">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Name</label>
            <input type="text" id="chartName" class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600" value="Sample Chart">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Birth Date</label>
            <input type="date" id="chartDate" class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600" value="1990-06-15">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Birth Time</label>
            <input type="time" id="chartTime" class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600" value="14:30">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Location</label>
            <input type="text" id="chartLocation" class="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600" value="New York, NY">
          </div>
          <div>
            <button type="button" id="calculateChartBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 py-1.5 rounded mt-2">Calculate Chart</button>
          </div>
        </div>
      </div>
      <div class="p-3 border-b border-gray-700">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Planets</h3>
        <div class="space-y-1 text-sm">
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-yellow-400">☉</span>
            <span class="text-gray-300">Sun</span>
            <span class="text-gray-400 text-xs">24° ♊ 15'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-gray-300">☽</span>
            <span class="text-gray-300">Moon</span>
            <span class="text-gray-400 text-xs">12° ♏ 42'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-orange-400">☿</span>
            <span class="text-gray-300">Mercury</span>
            <span class="text-gray-400 text-xs">08° ♋ 33'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-pink-400">♀</span>
            <span class="text-gray-300">Venus</span>
            <span class="text-gray-400 text-xs">19° ♉ 07'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-red-400">♂</span>
            <span class="text-gray-300">Mars</span>
            <span class="text-gray-400 text-xs">02° ♈ 51'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-purple-400">♃</span>
            <span class="text-gray-300">Jupiter</span>
            <span class="text-gray-400 text-xs">27° ♋ 19'</span>
          </div>
          <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
            <span class="text-amber-600">♄</span>
            <span class="text-gray-300">Saturn</span>
            <span class="text-gray-400 text-xs">22° ♑ 45'</span>
          </div>
        </div>
      </div>
      <div class="p-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Houses</h3>
        <div class="grid grid-cols-3 gap-1 text-xs">
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">1st</span>
            <div class="text-gray-300">15° ♎</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">2nd</span>
            <div class="text-gray-300">12° ♏</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">3rd</span>
            <div class="text-gray-300">14° ♐</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">4th</span>
            <div class="text-gray-300">18° ♑</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">5th</span>
            <div class="text-gray-300">21° ♒</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">6th</span>
            <div class="text-gray-300">19° ♓</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">7th</span>
            <div class="text-gray-300">15° ♈</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">8th</span>
            <div class="text-gray-300">12° ♉</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">9th</span>
            <div class="text-gray-300">14° ♊</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">10th</span>
            <div class="text-gray-300">18° ♋</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">11th</span>
            <div class="text-gray-300">21° ♌</div>
          </div>
          <div class="bg-gray-700 p-1.5 rounded text-center">
            <span class="text-gray-500">12th</span>
            <div class="text-gray-300">19° ♍</div>
          </div>
        </div>
      </div>
    </aside>
  `;
  return template.content.cloneNode(true);
}

// ES module export
export { createSidebarTemplate };
export default createSidebarTemplate;
