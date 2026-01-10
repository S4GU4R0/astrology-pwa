/**
 * TestSuiteView Web Component
 * End-to-end test suite for Astrodex
 */
class TestSuiteView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.testModules = null;
    }

    connectedCallback() {
        this.render();
        this.loadModules();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/tailwind/tailwind.min.css">
            <style>
                :host { display: block; }
                .result-item.pass { border-color: #4ade80; background: rgba(74, 222, 128, 0.1); }
                .result-item.fail { border-color: #f87171; background: rgba(248, 113, 113, 0.1); }
            </style>

            <div class="p-8 max-w-5xl mx-auto h-full overflow-auto bg-gray-900 text-gray-200">
                <span class="inline-block mb-4 text-blue-400 cursor-pointer hover:underline" id="backLink">← Back to Chart</span>

                <h1 class="text-2xl font-bold text-white mb-6">End-to-End Test Suite - Astrodex</h1>

                <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                    <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 1: Chart Data Persistence</h2>
                    <p class="text-gray-400 mb-2">Tests localStorage save/load functionality</p>
                    <button id="test1Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                    <div id="test1-results" class="mt-2"></div>
                </div>

                <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                    <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 2: Calculation Functions</h2>
                    <p class="text-gray-400 mb-1">Tests astronomical calculation functions with known data</p>
                    <p class="text-gray-400 mb-1"><strong class="text-gray-300">Test Data:</strong> 12/28/1989 11:36pm, Orange, CA</p>
                    <p class="text-gray-400 mb-2"><strong class="text-gray-300">Expected:</strong> Sun in Capricorn, Moon in Capricorn, Mercury in Capricorn</p>
                    <button id="test2Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                    <div id="test2-results" class="mt-2"></div>
                </div>

                <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                    <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 3: Module Imports</h2>
                    <p class="text-gray-400 mb-2">Tests that all modules are available</p>
                    <button id="test3Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                    <div id="test3-results" class="mt-2"></div>
                </div>

                <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                    <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 4: View Manager</h2>
                    <p class="text-gray-400 mb-2">Tests view switching functionality</p>
                    <button id="test4Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                    <div id="test4-results" class="mt-2"></div>
                </div>

                <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                    <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 5: UI Helpers</h2>
                    <p class="text-gray-400 mb-2">Tests loading indicators and toast notifications</p>
                    <button id="test5Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                    <div id="test5-results" class="mt-2"></div>
                </div>
            </div>
        `;
    }

    async loadModules() {
        try {
            const [geocodingModule, astroModule] = await Promise.all([
                import('../geocoding-service.js'),
                import('../astro-calculations.js')
            ]);

            this.testModules = {
                GeocodingService: geocodingModule.GeocodingService,
                calculatePlanetaryPositions: astroModule.calculatePlanetaryPositions,
                calculatePlanetaryMotion: astroModule.calculatePlanetaryMotion,
                calculateSect: astroModule.calculateSect,
                longitudeToSign: astroModule.longitudeToSign,
                checkCombustion: astroModule.checkCombustion,
                calculateAllAspects: astroModule.calculateAllAspects,
                calculateOverallTestimony: astroModule.calculateOverallTestimony,
                calculateSectBeneficMalefic: astroModule.calculateSectBeneficMalefic
            };

            console.log('Test modules loaded:', this.testModules);
        } catch (error) {
            console.error('Error loading test modules:', error);
        }
    }

    attachEventListeners() {
        // Back link
        this.shadowRoot.getElementById('backLink').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('view-change', {
                bubbles: true,
                composed: true,
                detail: { view: 'chart' }
            }));
        });

        // Test buttons
        this.shadowRoot.getElementById('test1Btn').addEventListener('click', () => this.testChartDataPersistence());
        this.shadowRoot.getElementById('test2Btn').addEventListener('click', () => this.testCalculationFunctions());
        this.shadowRoot.getElementById('test3Btn').addEventListener('click', () => this.testModuleImports());
        this.shadowRoot.getElementById('test4Btn').addEventListener('click', () => this.testViewManager());
        this.shadowRoot.getElementById('test5Btn').addEventListener('click', () => this.testUIHelpers());
    }

    logResult(testId, message, passed) {
        const resultsDiv = this.shadowRoot.getElementById(`${testId}-results`);
        const resultItem = document.createElement('div');
        resultItem.className = `p-2 my-1 border-l-4 ${passed ? 'border-green-400 bg-green-900/20 text-green-400' : 'border-red-400 bg-red-900/20 text-red-400'} font-semibold`;
        resultItem.textContent = `${passed ? '✓' : '✗'} ${message}`;
        resultsDiv.appendChild(resultItem);
    }

    testChartDataPersistence() {
        const resultsDiv = this.shadowRoot.getElementById('test1-results');
        resultsDiv.innerHTML = '';

        try {
            const testData = {
                name: 'Test User',
                date: '1989-12-28',
                time: '23:36',
                location: 'Orange, CA'
            };

            localStorage.setItem('astrodex_chart_data', JSON.stringify(testData));
            this.logResult('test1', 'Data saved to localStorage', true);

            const loaded = JSON.parse(localStorage.getItem('astrodex_chart_data'));
            const matches = loaded.name === testData.name &&
                           loaded.date === testData.date &&
                           loaded.time === testData.time &&
                           loaded.location === testData.location;

            this.logResult('test1', 'Data loaded from localStorage', matches);
            this.logResult('test1', `Loaded data: ${JSON.stringify(loaded)}`, matches);

            localStorage.removeItem('astrodex_chart_data');
            this.logResult('test1', 'Cleanup completed', true);

        } catch (error) {
            this.logResult('test1', `Error: ${error.message}`, false);
        }
    }

    async testCalculationFunctions() {
        const resultsDiv = this.shadowRoot.getElementById('test2-results');
        resultsDiv.innerHTML = '';

        try {
            if (!this.testModules) {
                this.logResult('test2', 'Modules not loaded yet - please wait and retry', false);
                return;
            }

            const { calculatePlanetaryPositions, longitudeToSign } = this.testModules;

            const testDate = new Date('1989-12-28T23:36:00');
            const latitude = 33.7879;
            const longitude = -117.8531;

            this.logResult('test2', 'Starting calculations...', true);

            const positions = calculatePlanetaryPositions(testDate, latitude, longitude);
            this.logResult('test2', 'Planetary positions calculated', true);

            const sunSign = longitudeToSign(positions.Sun.longitude);
            const sunInCapricorn = sunSign.sign === 'Capricorn';
            this.logResult('test2', `Sun: ${sunSign.formattedPosition}`, sunInCapricorn);

            const moonSign = longitudeToSign(positions.Moon.longitude);
            const moonInCapricorn = moonSign.sign === 'Capricorn';
            this.logResult('test2', `Moon: ${moonSign.formattedPosition}`, moonInCapricorn);

            const mercurySign = longitudeToSign(positions.Mercury.longitude);
            const mercuryInCapricorn = mercurySign.sign === 'Capricorn';
            this.logResult('test2', `Mercury: ${mercurySign.formattedPosition}`, mercuryInCapricorn);

            const allPassed = sunInCapricorn && moonInCapricorn && mercuryInCapricorn;
            this.logResult('test2', `All planets in expected signs: ${allPassed ? 'PASS' : 'FAIL'}`, allPassed);

        } catch (error) {
            this.logResult('test2', `Error: ${error.message}`, false);
            console.error('Test 2 error:', error);
        }
    }

    testModuleImports() {
        const resultsDiv = this.shadowRoot.getElementById('test3-results');
        resultsDiv.innerHTML = '';

        const modules = [
            'GeocodingService',
            'calculatePlanetaryPositions',
            'calculatePlanetaryMotion',
            'calculateSect',
            'longitudeToSign',
            'checkCombustion',
            'calculateAllAspects',
            'calculateOverallTestimony',
            'calculateSectBeneficMalefic'
        ];

        modules.forEach(moduleName => {
            const available = this.testModules && this.testModules[moduleName];
            this.logResult('test3', `${moduleName}: ${available ? 'Available' : 'Missing'}`, available);
        });
    }

    testViewManager() {
        const resultsDiv = this.shadowRoot.getElementById('test4-results');
        resultsDiv.innerHTML = '';

        // ViewManager should be available on window since we're in the same document now
        const vm = window.ViewManager;
        const vmAvailable = typeof vm !== 'undefined';
        this.logResult('test4', 'ViewManager available', vmAvailable);

        if (vmAvailable) {
            this.logResult('test4', 'ViewManager.loadView method exists', typeof vm.loadView === 'function');
            this.logResult('test4', `Current view: ${vm.currentView}`, true);
        } else {
            this.logResult('test4', 'ViewManager not loaded', false);
        }
    }

    testUIHelpers() {
        const resultsDiv = this.shadowRoot.getElementById('test5-results');
        resultsDiv.innerHTML = '';

        const functions = ['showLoadingSpinner', 'hideLoadingSpinner', 'showProgressBar', 'showToast'];

        functions.forEach(funcName => {
            const available = typeof window[funcName] === 'function';
            this.logResult('test5', `${funcName}: ${available ? 'Available' : 'Missing'}`, available);
        });

        if (typeof window.showToast === 'function') {
            window.showToast('Test notification', 'info');
            this.logResult('test5', 'Toast notification triggered', true);
        }
    }
}

customElements.define('test-suite-view', TestSuiteView);
