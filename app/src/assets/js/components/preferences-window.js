/**
 * Preferences Window Component
 * Desktop-style draggable preferences window using templates and Alpine.js
 */

/**
 * Create and mount the preferences window
 * @returns {HTMLElement} The created window element
 */
export function createPreferencesWindow() {
  const windowEl = document.createElement('div');
  windowEl.innerHTML = generatePreferencesWindowTemplate();
  windowEl.setAttribute('id', 'preferences-window');
  document.body.appendChild(windowEl);
  return windowEl;
}

/**
 * Generate the main preferences window template
 * @returns {string} HTML template string
 */
function generatePreferencesWindowTemplate() {
  return `
    <div
      x-data="preferencesWindow()"
      x-show="isOpen"
      x-cloak
      class="fixed z-50"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <!-- Floating Window (no backdrop) -->
      <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col border border-gray-300 dark:border-gray-700"
        x-show="!isMinimized"
        x-transition:enter="transition ease-out duration-200"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
      >
        <!-- Draggable Title Bar -->
        <div
          @mousedown="startDrag($event)"
          class="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 rounded-t-lg cursor-move select-none"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
              Preferences
            </h2>
          </div>

          <div class="flex items-center gap-1">
            <!-- Minimize Button -->
            <button
              @click="isMinimized = true"
              class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Minimize"
              title="Minimize"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>

            <!-- Close Button -->
            <button
              @click="close()"
              class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close"
              title="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <nav class="flex px-4" role="tablist">
            <template x-for="tab in tabs" :key="tab.id">
              <button
                @click="activeTab = tab.id"
                :class="{
                  'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === tab.id,
                  'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== tab.id
                }"
                class="py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
                x-text="tab.label"
                role="tab"
              ></button>
            </template>
          </nav>
        </div>

        <!-- Content Area (scrollable) -->
        <div class="flex-1 overflow-y-auto p-6">
          ${generateGeneralTab()}
          ${generateDisplayTab()}
          ${generateChartTab()}
          ${generateAdvancedTab()}
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <button
            @click="reset()"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
          <div class="flex gap-2">
            <button
              @click="close()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              @click="save()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Minimized State (floating tab at bottom-right) -->
      <div
        x-show="isMinimized"
        @click="isMinimized = false"
        class="fixed bottom-4 right-4 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          </svg>
          <span class="text-sm font-medium">Preferences</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate General tab content
 * @returns {string} HTML template string
 */
function generateGeneralTab() {
  return `
    <div x-show="activeTab === 'general'" class="space-y-6">
      <section>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h3>

        <!-- Theme Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme
          </label>
          <div class="grid grid-cols-3 gap-3">
            <label class="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="preferences.general.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
              <input type="radio" x-model="preferences.general.theme" value="light" class="sr-only">
              <span class="text-sm font-medium">☀️ Light</span>
            </label>
            <label class="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="preferences.general.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
              <input type="radio" x-model="preferences.general.theme" value="dark" class="sr-only">
              <span class="text-sm font-medium">🌙 Dark</span>
            </label>
            <label class="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="preferences.general.theme === 'auto' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
              <input type="radio" x-model="preferences.general.theme" value="auto" class="sr-only">
              <span class="text-sm font-medium">⚙️ Auto</span>
            </label>
          </div>
        </div>

        <!-- Accent Color -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Accent Color
          </label>
          <div class="flex gap-3">
            <template x-for="(color, index) in accentColors" :key="index">
              <button
                @click="preferences.general.accentColor = index"
                :class="{
                  'ring-2 ring-offset-2 ring-blue-500 scale-110': preferences.general.accentColor === index
                }"
                class="w-12 h-12 rounded-full transition-all shadow-md hover:scale-105"
                :style="{ backgroundColor: color }"
                :aria-label="'Accent color ' + (index + 1)"
              ></button>
            </template>
          </div>
        </div>

        <!-- Font Size -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Font Size
          </label>
          <select
            x-model="preferences.general.fontSize"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <!-- Compact Mode -->
        <div class="mb-6">
          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Use a denser UI layout</div>
            </div>
            <input
              type="checkbox"
              x-model="preferences.general.compactMode"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
          </label>
        </div>
      </section>
    </div>
  `;
}

/**
 * Generate Display tab content
 * @returns {string} HTML template string
 */
function generateDisplayTab() {
  return `
    <div x-show="activeTab === 'display'" class="space-y-6">
      <section>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Chart Appearance
        </h3>

        <!-- Chart Style -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Chart Style
          </label>
          <select
            x-model="preferences.display.chartStyle"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="modern">Modern</option>
            <option value="classical">Classical</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>

        <!-- Visibility Options -->
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Visibility Options</h4>
        <div class="space-y-2">
          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Show Aspects</span>
            <input type="checkbox" x-model="preferences.display.showAspects" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          </label>

          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Show Aspect Grid</span>
            <input type="checkbox" x-model="preferences.display.showAspectGrid" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          </label>

          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Show Minor Planets</span>
            <input type="checkbox" x-model="preferences.display.showMinorPlanets" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          </label>

          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Show Fixed Stars</span>
            <input type="checkbox" x-model="preferences.display.showFixedStars" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          </label>

          <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Show House Cusps</span>
            <input type="checkbox" x-model="preferences.display.showHouseCusps" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          </label>
        </div>
      </section>
    </div>
  `;
}

/**
 * Generate Chart tab content
 * @returns {string} HTML template string
 */
function generateChartTab() {
  return `
    <div x-show="activeTab === 'chart'" class="space-y-6">
      <section>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Chart Defaults
        </h3>

        <!-- House System -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            House System
          </label>
          <select
            x-model="preferences.chart.houseSystem"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="placidus">Placidus</option>
            <option value="koch">Koch</option>
            <option value="whole-sign">Whole Sign</option>
            <option value="equal">Equal</option>
            <option value="campanus">Campanus</option>
          </select>
        </div>

        <!-- Zodiac -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Zodiac
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="preferences.chart.zodiac === 'tropical' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
              <input type="radio" x-model="preferences.chart.zodiac" value="tropical" class="sr-only">
              <span class="text-sm font-medium">Tropical</span>
            </label>
            <label class="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="preferences.chart.zodiac === 'sidereal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
              <input type="radio" x-model="preferences.chart.zodiac" value="sidereal" class="sr-only">
              <span class="text-sm font-medium">Sidereal</span>
            </label>
          </div>
        </div>

        <!-- Default Chart Type -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Default Chart Type
          </label>
          <select
            x-model="preferences.chart.defaultChartType"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="natal">Natal</option>
            <option value="transit">Transit</option>
            <option value="synastry">Synastry</option>
            <option value="composite">Composite</option>
          </select>
        </div>
      </section>
    </div>
  `;
}

/**
 * Generate Advanced tab content
 * @returns {string} HTML template string
 */
function generateAdvancedTab() {
  return `
    <div x-show="activeTab === 'advanced'" class="space-y-6">
      <section>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Developer Options
        </h3>

        <label class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">Debug Mode</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Show calculation details in console</div>
          </div>
          <input type="checkbox" x-model="preferences.advanced.debugMode" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
        </label>
      </section>

      <section class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>

        <div class="space-y-3">
          <button
            @click="exportPreferences()"
            class="w-full px-4 py-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="text-sm font-medium text-gray-900 dark:text-white">Export Preferences</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Download your settings as JSON</div>
          </button>

          <button
            @click="importPreferences()"
            class="w-full px-4 py-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="text-sm font-medium text-gray-900 dark:text-white">Import Preferences</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Load settings from a file</div>
          </button>
        </div>
      </section>
    </div>
  `;
}
