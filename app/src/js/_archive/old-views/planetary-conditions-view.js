/**
 * PlanetaryConditionsView Template-Based Component
 * Displays the planetary conditions worksheet form with tab-based planet selection
 * Auto-calculates conditions from birth data
 *
 * CONVERTED FROM WEB COMPONENT TO TEMPLATE-BASED APPROACH
 * Reason: Web Components with Shadow DOM prevent Tailwind CSS from working
 */

// State management for this view
let viewState = {
    selectedPlanet: 'Sun',
    chartData: null,
    modules: null,
    container: null
};

/**
 * Create and render the planetary conditions view
 * @param {HTMLElement} container - Container element to render into
 * @returns {Object} API for interacting with the view
 */
export function createPlanetaryConditionsView(container) {
    viewState.container = container;
    viewState.selectedPlanet = 'Sun';
    viewState.chartData = null;

    // Render the template
    render();

    // Load modules and initialize
    loadModules().then(() => {
        attachEventListeners();
        // Auto-calculate if chart data exists in sidebar
        autoCalculateFromSidebar();
    });

    // Return API for external interaction
    return {
        destroy: () => {
            viewState.container = null;
            viewState.chartData = null;
            viewState.modules = null;
        }
    };
}

/**
 * Load required modules asynchronously
 */
async function loadModules() {
    try {
        const [geocodingModule, astroModule, dignityModule] = await Promise.all([
            import('../helpers/geocoding-service.js'),
            import('../astro/astro-calculations.js'),
            import('../astro/dignity-tables.js')
        ]);

        viewState.modules = {
            GeocodingService: geocodingModule.GeocodingService,
            calculatePlanetaryPositions: astroModule.calculatePlanetaryPositions,
            calculatePlanetaryMotion: astroModule.calculatePlanetaryMotion,
            calculateSect: astroModule.calculateSect,
            longitudeToSign: astroModule.longitudeToSign,
            checkCombustion: astroModule.checkCombustion,
            calculateAllAspects: astroModule.calculateAllAspects,
            calculateAscendant: astroModule.calculateAscendant,
            SIGNS: dignityModule.SIGNS,
            PLANETS: dignityModule.PLANETS,
            DOMICILE_RULERSHIPS: dignityModule.DOMICILE_RULERSHIPS,
            EXALTATIONS: dignityModule.EXALTATIONS,
            DETRIMENTS: dignityModule.DETRIMENTS,
            FALLS: dignityModule.FALLS,
            TRIPLICITY_RULERS: dignityModule.TRIPLICITY_RULERS,
            getBoundRuler: dignityModule.getBoundRuler
        };

        console.log('Planetary conditions modules loaded');
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

/**
 * Render the main template
 */
function render() {
    if (!viewState.container) return;

    viewState.container.innerHTML = `
        <style>
            .zodiac-tab-btn.active {
                background: #374151;
                border-bottom: 2px solid #3b82f6;
                color: #3b82f6;
            }
            .calculating {
                opacity: 0.7;
                pointer-events: none;
            }
        </style>

        <div class="h-full overflow-auto bg-gray-900 text-gray-200">
            <div class="max-w-6xl mx-auto p-6">

                <!-- Back Link -->
                <span class="inline-block mb-4 text-blue-400 cursor-pointer hover:underline" id="backLink">← Back to Chart</span>

                <!-- Chart Info Header (reads from sidebar) -->
                <div class="bg-gray-800 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-lg font-semibold text-white" id="chartInfoName">Planetary Conditions</h2>
                            <p class="text-sm text-gray-400" id="chartInfoDetails">Enter chart data in the sidebar and click Calculate</p>
                        </div>
                        <button id="recalculateBtn" class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Recalculate
                        </button>
                    </div>
                    <div id="chartStatus" class="text-sm text-gray-400 mt-2"></div>
                </div>

                <!-- Tab Navigation -->
                <div class="flex flex-wrap border-b border-gray-700 mb-6 overflow-x-auto">
                    <button class="zodiac-tab-btn active px-4 py-3 text-sm font-semibold leading-none" data-tab="Sun">Sun</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Moon">Moon</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Mercury">Mercury</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Venus">Venus</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Mars">Mars</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Jupiter">Jupiter</button>
                    <button class="zodiac-tab-btn px-4 py-3 text-sm font-semibold leading-none text-gray-400 hover:text-blue-400 hover:bg-gray-800" data-tab="Saturn">Saturn</button>
                </div>

                <!-- Tab Content - Planet Info Cards -->
                <div class="zodiac-tab-content-container mb-6">
                    ${renderPlanetInfoCards()}
                </div>

                <!-- Planetary Conditions Form -->
                <div class="bg-gray-800 rounded-lg p-6">
                    <div class="mb-6">
                        <p class="text-gray-400 text-sm">Traditional astrology planetary dignities and debilities as per Demetra George's framework</p>
                    </div>

                    <!-- Planet Selection (read-only, synced with tabs) -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Planet</label>
                        <div class="relative">
                            <select id="planetSelect" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-700 text-gray-200 rounded border border-gray-600 outline-none" disabled>
                                <option value="Sun">Sun</option>
                                <option value="Moon">Moon</option>
                                <option value="Mercury">Mercury</option>
                                <option value="Venus">Venus</option>
                                <option value="Mars">Mars</option>
                                <option value="Jupiter">Jupiter</option>
                                <option value="Saturn">Saturn</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Sign Placement -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Sign Placement</label>
                        <div class="relative">
                            <select id="signPlacement" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-700 text-gray-200 rounded border border-gray-600 outline-none">
                                <option value="">--Select Sign--</option>
                                <option>Aries</option>
                                <option>Taurus</option>
                                <option>Gemini</option>
                                <option>Cancer</option>
                                <option>Leo</option>
                                <option>Virgo</option>
                                <option>Libra</option>
                                <option>Scorpio</option>
                                <option>Sagittarius</option>
                                <option>Capricorn</option>
                                <option>Aquarius</option>
                                <option>Pisces</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-2xl mb-4 leading-tight font-semibold text-white">Essential Dignities</h3>

                    <!-- Domicile -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Domicile (Rulership)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="domicile" value="ruler" class="mr-2">
                                <span>Ruler (+5)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="domicile" value="none" class="mr-2" checked>
                                <span>Not in Rulership (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Exaltation -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Exaltation</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="exaltation" value="exalted" class="mr-2">
                                <span>Exalted (+4)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="exaltation" value="none" class="mr-2" checked>
                                <span>Not in Exaltation (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Triplicity -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Triplicity (Element)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="triplicity" value="day-ruler" class="mr-2">
                                <span>Day Ruler (+3)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="triplicity" value="night-ruler" class="mr-2">
                                <span>Night Ruler (+3)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="triplicity" value="participating" class="mr-2">
                                <span>Participating Ruler (+3)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="triplicity" value="none" class="mr-2" checked>
                                <span>Not in Triplicity (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Term -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Term (Bound)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="term" value="term" class="mr-2">
                                <span>In Own Term (+2)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="term" value="none" class="mr-2" checked>
                                <span>Not in Term (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Face/Decan -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Face (Decan)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="face" value="face" class="mr-2">
                                <span>In Own Face (+1)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="face" value="none" class="mr-2" checked>
                                <span>Not in Face (0)</span>
                            </label>
                        </div>
                    </div>

                    <h3 class="text-2xl mb-4 leading-tight font-semibold text-white">Essential Debilities</h3>

                    <!-- Detriment -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Detriment (Exile)</label>
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="detriment" value="detriment" class="mr-2">
                            <span>In Detriment (-5)</span>
                        </label>
                    </div>

                    <!-- Fall -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Fall</label>
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="fall" value="fall" class="mr-2">
                            <span>In Fall (-4)</span>
                        </label>
                    </div>

                    <h3 class="text-2xl mb-4 leading-tight font-semibold text-white">Accidental Conditions</h3>

                    <!-- House Position -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">House Position</label>
                        <div class="relative">
                            <select id="housePosition" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-700 text-gray-200 rounded border border-gray-600 outline-none">
                                <option value="">--Select House--</option>
                                <option>1st House - Angular (+5)</option>
                                <option>2nd House - Succedent (+2)</option>
                                <option>3rd House - Cadent (0)</option>
                                <option>4th House - Angular (+5)</option>
                                <option>5th House - Succedent (+2)</option>
                                <option>6th House - Cadent (0)</option>
                                <option>7th House - Angular (+5)</option>
                                <option>8th House - Succedent (+2)</option>
                                <option>9th House - Cadent (0)</option>
                                <option>10th House - Angular (+5)</option>
                                <option>11th House - Succedent (+2)</option>
                                <option>12th House - Cadent (0)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Motion -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Motion</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="motion" value="direct" class="mr-2" checked>
                                <span>Direct (+4)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="motion" value="stationary" class="mr-2">
                                <span>Stationary (0)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="motion" value="retrograde" class="mr-2">
                                <span>Retrograde (-5)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Sect -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Sect (Chart Type)</label>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="chart-sect" value="day" class="mr-2" checked>
                                <span>Day Chart</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="chart-sect" value="night" class="mr-2">
                                <span>Night Chart</span>
                            </label>
                        </div>
                    </div>

                    <!-- Sect of Planet -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Planetary Sect Condition</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="planet-sect" value="in-sect" class="mr-2">
                                <span>In Sect (+3)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="planet-sect" value="contrary" class="mr-2">
                                <span>Contrary to Sect (-2)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="planet-sect" value="neutral" class="mr-2" checked>
                                <span>Neutral (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Aspect to Benefics -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Aspect to Benefics (Jupiter/Venus)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="benefic-aspect" value="conjunction" class="mr-2">
                                <span>Conjunction (+5)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="benefic-aspect" value="trine" class="mr-2">
                                <span>Trine (+4)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="benefic-aspect" value="sextile" class="mr-2">
                                <span>Sextile (+3)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Aspect to Malefics -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Aspect to Malefics (Mars/Saturn)</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="malefic-aspect" value="conjunction" class="mr-2">
                                <span>Conjunction (-5)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="malefic-aspect" value="opposition" class="mr-2">
                                <span>Opposition (-4)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="checkbox" name="malefic-aspect" value="square" class="mr-2">
                                <span>Square (-3)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Combustion -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Solar Proximity</label>
                        <div class="space-y-1">
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="combustion" value="cazimi" class="mr-2">
                                <span>Cazimi (within 17') (+5)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="combustion" value="combust" class="mr-2">
                                <span>Combust (within 8°) (-5)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="combustion" value="under-beams" class="mr-2">
                                <span>Under the Beams (within 15°) (-4)</span>
                            </label>
                            <label class="flex items-center text-gray-300">
                                <input type="radio" name="combustion" value="none" class="mr-2" checked>
                                <span>Not Affected (0)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Mutual Reception -->
                    <div class="mb-6">
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="mutual-reception" value="mutual" class="mr-2">
                            <span>Mutual Reception (+5)</span>
                        </label>
                    </div>

                    <!-- Hayz -->
                    <div class="mb-6">
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="hayz" value="hayz" class="mr-2">
                            <span>In Hayz (+2)</span>
                        </label>
                    </div>

                    <h3 class="text-2xl mb-4 leading-tight font-semibold text-white">Additional Conditions</h3>

                    <div class="mb-6 space-y-3">
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="oriental" value="oriental" class="mr-2">
                            <span>Oriental (rising before Sun) - for Mercury/Venus</span>
                        </label>
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="occidental" value="occidental" class="mr-2">
                            <span>Occidental (setting after Sun) - for Mars/Saturn</span>
                        </label>
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="feral" value="feral" class="mr-2">
                            <span>Feral (no major aspects)</span>
                        </label>
                        <label class="flex items-center text-gray-300">
                            <input type="checkbox" name="besieged" value="besieged" class="mr-2">
                            <span>Besieged (between malefics)</span>
                        </label>
                    </div>

                    <!-- Notes Section -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Notes & Observations</label>
                        <textarea id="notes" class="appearance-none w-full p-3 text-sm leading-relaxed bg-gray-700 text-gray-200 rounded border border-gray-600 outline-none" rows="4" placeholder="Additional notes on planetary condition..."></textarea>
                    </div>

                    <!-- Score Summary -->
                    <div class="bg-gray-700 p-4 rounded mb-6">
                        <h3 class="text-xl mb-3 leading-tight font-semibold text-white">Dignity Score Summary</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-gray-300 text-sm font-semibold mb-2">Essential Dignities Total</label>
                                <input id="essentialTotal" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-600 text-gray-200 rounded outline-none" type="text" value="0" readonly>
                            </div>
                            <div>
                                <label class="block text-gray-300 text-sm font-semibold mb-2">Accidental Conditions Total</label>
                                <input id="accidentalTotal" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-600 text-gray-200 rounded outline-none" type="text" value="0" readonly>
                            </div>
                            <div>
                                <label class="block text-gray-300 text-sm font-semibold mb-2">Overall Score</label>
                                <input id="overallScore" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-600 text-gray-200 rounded outline-none" type="text" value="0" readonly>
                            </div>
                        </div>
                    </div>

                    <!-- Final Assessment -->
                    <div class="mb-6">
                        <label class="block text-gray-200 text-sm font-semibold mb-2">Overall Assessment</label>
                        <div class="relative">
                            <select id="assessment" class="appearance-none w-full p-3 text-sm font-semibold leading-none bg-gray-700 text-gray-200 rounded border border-gray-600 outline-none">
                                <option>Very Strong (+15 or more)</option>
                                <option>Strong (+10 to +14)</option>
                                <option>Moderately Strong (+5 to +9)</option>
                                <option selected>Neutral (0 to +4)</option>
                                <option>Weak (-1 to -5)</option>
                                <option>Very Weak (-6 or less)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <p class="text-xs text-gray-500 leading-relaxed">This form presents planetary conditions according to traditional astrology principles as outlined by Demetra George.</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render planet info cards
 */
function renderPlanetInfoCards() {
    const planets = {
        Sun: { name: 'The Sun', subtitle: 'Core Essence', description: 'The Sun represents your core identity, ego, and vital life force.', attributes: ['Ruler of Leo', 'Element: Fire', 'Diurnal planet'] },
        Moon: { name: 'The Moon', subtitle: 'Emotional Core', description: 'The Moon governs your emotional nature, instincts, and subconscious patterns.', attributes: ['Ruler of Cancer', 'Element: Water', 'Nocturnal planet'] },
        Mercury: { name: 'Mercury', subtitle: 'Communication', description: 'Mercury rules communication, intellect, and mental processes.', attributes: ['Ruler of Gemini/Virgo', 'Element: Air/Earth', 'Neutral sect'] },
        Venus: { name: 'Venus', subtitle: 'Love & Beauty', description: 'Venus governs love, beauty, harmony, and attraction.', attributes: ['Ruler of Taurus/Libra', 'Element: Earth/Air', 'Nocturnal planet'] },
        Mars: { name: 'Mars', subtitle: 'Action & Drive', description: 'Mars represents your drive, ambition, passion, and assertiveness.', attributes: ['Ruler of Aries/Scorpio', 'Element: Fire', 'Nocturnal planet'] },
        Jupiter: { name: 'Jupiter', subtitle: 'Expansion', description: 'Jupiter is the planet of expansion, growth, wisdom, and good fortune.', attributes: ['Ruler of Sagittarius/Pisces', 'Element: Fire', 'Diurnal planet'] },
        Saturn: { name: 'Saturn', subtitle: 'Structure', description: 'Saturn represents structure, discipline, responsibility, and life lessons.', attributes: ['Ruler of Capricorn/Aquarius', 'Element: Earth', 'Diurnal planet'] }
    };

    return Object.entries(planets).map(([key, planet], index) => `
        <div class="zodiac-tab-content ${index === 0 ? '' : 'hidden'}" data-content="${key}">
            <div class="bg-gray-800 rounded p-6">
                <h3 class="text-2xl mb-4 leading-tight font-semibold text-white">${planet.name}</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-gray-700 rounded h-48 flex items-center justify-center">
                        <span class="text-6xl">${getPlanetSymbol(key)}</span>
                    </div>
                    <div>
                        <h5 class="text-lg mb-2 leading-tight font-semibold text-blue-400">${planet.subtitle}</h5>
                        <p class="text-gray-400 mb-4 text-sm">${planet.description}</p>
                        <h6 class="mb-2 leading-tight font-semibold text-gray-300">Key Attributes</h6>
                        <ul class="text-sm text-gray-400 space-y-1">
                            ${planet.attributes.map(attr => `<li>• ${attr}</li>`).join('')}
                        </ul>
                        <div id="calculated-${key}" class="mt-4 p-3 bg-gray-600 rounded hidden">
                            <p class="text-sm text-green-400">Calculated position will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Get planet symbol
 */
function getPlanetSymbol(planet) {
    const symbols = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄' };
    return symbols[planet] || '?';
}

/**
 * Auto-calculate from sidebar data
 */
function autoCalculateFromSidebar() {
    // Read chart data from the main sidebar form via ChartData
    const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;

    if (chartData && chartData.date && chartData.time && chartData.location) {
        // Update header with chart info
        updateChartInfoHeader(chartData);
        // Auto-calculate
        calculateChart();
    } else {
        showStatus('Enter chart data in the sidebar and click Calculate Chart, then return here.', 'info');
    }
}

/**
 * Update chart info header
 */
function updateChartInfoHeader(data) {
    if (!viewState.container) return;

    const nameEl = viewState.container.querySelector('#chartInfoName');
    const detailsEl = viewState.container.querySelector('#chartInfoDetails');

    if (nameEl && data.name) {
        nameEl.textContent = data.name || 'Planetary Conditions';
    }
    if (detailsEl) {
        const dateStr = data.date ? new Date(data.date + 'T12:00:00').toLocaleDateString() : '';
        const timeStr = data.time || '';
        const locStr = data.location || '';
        detailsEl.textContent = `${dateStr} ${timeStr} - ${locStr}`;
    }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    if (!viewState.container) return;

    // Back link
    const backLink = viewState.container.querySelector('#backLink');
    if (backLink) {
        backLink.addEventListener('click', () => {
            viewState.container.dispatchEvent(new CustomEvent('view-change', { bubbles: true, detail: { view: 'chart' } }));
        });
    }

    // Recalculate button
    const recalculateBtn = viewState.container.querySelector('#recalculateBtn');
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', () => {
            const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;
            if (chartData) updateChartInfoHeader(chartData);
            calculateChart();
        });
    }

    // Tab buttons
    const tabButtons = viewState.container.querySelectorAll('.zodiac-tab-btn');
    const tabContents = viewState.container.querySelectorAll('.zodiac-tab-content');
    const planetSelect = viewState.container.querySelector('#planetSelect');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-400');
            });
            button.classList.add('active');
            button.classList.remove('text-gray-400');

            tabContents.forEach(content => content.classList.add('hidden'));
            const targetContent = viewState.container.querySelector(`[data-content="${targetTab}"]`);
            if (targetContent) targetContent.classList.remove('hidden');

            viewState.selectedPlanet = targetTab;
            if (planetSelect) planetSelect.value = targetTab;

            // Populate form with this planet's calculated data if available
            if (viewState.chartData) {
                populateFormForPlanet(targetTab);
            }
        });
    });

    // Auto-calculate on any input change
    const inputs = viewState.container.querySelectorAll('input[type="radio"], input[type="checkbox"], select:not(#planetSelect)');
    inputs.forEach(input => {
        input.addEventListener('change', () => calculateScore());
    });
}

/**
 * Calculate chart
 */
async function calculateChart() {
    if (!viewState.modules) {
        showStatus('Error: Modules not loaded yet. Please wait and try again.', 'error');
        return;
    }

    if (!viewState.container) return;

    // Read from sidebar's ChartData
    const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;
    if (!chartData) {
        showStatus('ChartData not available. Enter data in the sidebar.', 'error');
        return;
    }

    const { date: birthDate, time: birthTime, location: birthLocation } = chartData;

    if (!birthDate || !birthTime || !birthLocation) {
        showStatus('Please fill in all birth data fields in the sidebar.', 'error');
        return;
    }

    const btn = viewState.container.querySelector('#recalculateBtn');
    if (btn) {
        btn.textContent = 'Calculating...';
        btn.disabled = true;
    }

    try {
        // Step 1: Geocode location
        showStatus('Geocoding location...', 'info');
        const geoResult = await viewState.modules.GeocodingService.geocode(birthLocation);

        // Step 2: Parse date/time
        const dateTime = new Date(`${birthDate}T${birthTime}`);

        // Step 3: Calculate planetary positions
        showStatus('Calculating planetary positions...', 'info');
        const positions = viewState.modules.calculatePlanetaryPositions(dateTime, geoResult.latitude, geoResult.longitude);

        // Step 4: Calculate additional data
        const ascendant = viewState.modules.calculateAscendant(dateTime, geoResult.latitude, geoResult.longitude);
        const sect = viewState.modules.calculateSect(positions, ascendant);
        const aspects = viewState.modules.calculateAllAspects(positions, dateTime);

        // Step 5: Build chart data object
        viewState.chartData = {
            birthDate: dateTime,
            location: geoResult,
            positions: positions,
            ascendant: ascendant,
            sect: sect,
            aspects: aspects,
            planetData: {}
        };

        // Calculate detailed data for each planet
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        for (const planet of planets) {
            const pos = positions[planet];
            const signInfo = viewState.modules.longitudeToSign(pos.longitude);
            const motion = viewState.modules.calculatePlanetaryMotion(planet, dateTime);

            let combustion = null;
            if (planet !== 'Sun') {
                combustion = viewState.modules.checkCombustion(pos.longitude, positions.Sun.longitude);
            }

            // Get planet's aspects
            const planetAspects = aspects.filter(a => a.planet1 === planet || a.planet2 === planet);

            // Calculate dignities
            const dignities = calculateDignities(planet, signInfo.signIndex, signInfo.degree, sect);

            viewState.chartData.planetData[planet] = {
                longitude: pos.longitude,
                sign: signInfo.sign,
                signIndex: signInfo.signIndex,
                degree: signInfo.degree,
                formattedPosition: signInfo.formattedPosition,
                motion: motion,
                combustion: combustion,
                aspects: planetAspects,
                dignities: dignities
            };

            // Update planet info card
            updatePlanetCard(planet);
        }

        showStatus(`Chart calculated for ${geoResult.displayName}. Sect: ${sect}`, 'success');

        // Populate form for currently selected planet
        populateFormForPlanet(viewState.selectedPlanet);

    } catch (error) {
        console.error('Chart calculation error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        if (btn) {
            btn.textContent = 'Recalculate';
            btn.disabled = false;
        }
    }
}

/**
 * Calculate dignities for a planet
 */
function calculateDignities(planet, signIndex, degree, sect) {
    const m = viewState.modules;
    const dignities = {
        domicile: false,
        exaltation: false,
        detriment: false,
        fall: false,
        triplicity: null,
        term: false
    };

    // Check domicile
    if (m.DOMICILE_RULERSHIPS[signIndex] === planet) {
        dignities.domicile = true;
    }

    // Check exaltation
    const exaltation = m.EXALTATIONS[planet];
    if (exaltation && exaltation.sign === signIndex) {
        dignities.exaltation = true;
    }

    // Check detriment
    const detriment = m.DETRIMENTS[planet];
    if (Array.isArray(detriment)) {
        if (detriment.includes(signIndex)) dignities.detriment = true;
    } else if (detriment === signIndex) {
        dignities.detriment = true;
    }

    // Check fall
    if (m.FALLS[planet] === signIndex) {
        dignities.fall = true;
    }

    // Check triplicity
    const isDayChart = sect === 'Diurnal';
    for (const [element, data] of Object.entries(m.TRIPLICITY_RULERS)) {
        if (data.signs.includes(signIndex)) {
            if (isDayChart && data.day === planet) {
                dignities.triplicity = 'day';
            } else if (!isDayChart && data.night === planet) {
                dignities.triplicity = 'night';
            } else if (data.participating === planet) {
                dignities.triplicity = 'participating';
            }
            break;
        }
    }

    // Check term/bound
    const boundRuler = m.getBoundRuler(signIndex, degree);
    if (boundRuler === planet) {
        dignities.term = true;
    }

    return dignities;
}

/**
 * Update planet card with calculated data
 */
function updatePlanetCard(planet) {
    if (!viewState.container || !viewState.chartData) return;

    const data = viewState.chartData.planetData[planet];
    const cardEl = viewState.container.querySelector(`#calculated-${planet}`);
    if (cardEl && data) {
        cardEl.classList.remove('hidden');
        cardEl.innerHTML = `
            <p class="text-sm font-semibold text-green-400">${data.formattedPosition}</p>
            <p class="text-xs text-gray-300">${data.motion.direction} • ${data.motion.speedCategory}</p>
            ${data.combustion ? `<p class="text-xs text-yellow-400">${data.combustion.visibility}</p>` : ''}
        `;
    }
}

/**
 * Populate form for a specific planet
 */
function populateFormForPlanet(planet) {
    if (!viewState.container || !viewState.chartData || !viewState.chartData.planetData[planet]) return;

    const data = viewState.chartData.planetData[planet];
    const dignities = data.dignities;

    // Sign Placement
    const signPlacement = viewState.container.querySelector('#signPlacement');
    if (signPlacement) signPlacement.value = data.sign;

    // Domicile
    setRadio('domicile', dignities.domicile ? 'ruler' : 'none');

    // Exaltation
    setRadio('exaltation', dignities.exaltation ? 'exalted' : 'none');

    // Triplicity
    if (dignities.triplicity === 'day') {
        setRadio('triplicity', 'day-ruler');
    } else if (dignities.triplicity === 'night') {
        setRadio('triplicity', 'night-ruler');
    } else if (dignities.triplicity === 'participating') {
        setRadio('triplicity', 'participating');
    } else {
        setRadio('triplicity', 'none');
    }

    // Term
    setRadio('term', dignities.term ? 'term' : 'none');

    // Detriment & Fall
    setCheckbox('detriment', dignities.detriment);
    setCheckbox('fall', dignities.fall);

    // Motion
    const motion = data.motion.direction.toLowerCase();
    if (motion === 'retrograde') {
        setRadio('motion', 'retrograde');
    } else if (motion.includes('station')) {
        setRadio('motion', 'stationary');
    } else {
        setRadio('motion', 'direct');
    }

    // Sect
    setRadio('chart-sect', viewState.chartData.sect === 'Diurnal' ? 'day' : 'night');

    // Planet sect condition
    const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
    const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];
    const isDayChart = viewState.chartData.sect === 'Diurnal';

    if (planet === 'Mercury') {
        setRadio('planet-sect', 'neutral');
    } else if ((isDayChart && diurnalPlanets.includes(planet)) || (!isDayChart && nocturnalPlanets.includes(planet))) {
        setRadio('planet-sect', 'in-sect');
    } else if ((isDayChart && nocturnalPlanets.includes(planet)) || (!isDayChart && diurnalPlanets.includes(planet))) {
        setRadio('planet-sect', 'contrary');
    } else {
        setRadio('planet-sect', 'neutral');
    }

    // Combustion (for non-Sun planets)
    if (planet !== 'Sun' && data.combustion) {
        if (data.combustion.isCazimi) {
            setRadio('combustion', 'cazimi');
        } else if (data.combustion.isCombust) {
            setRadio('combustion', 'combust');
        } else if (data.combustion.isUnderBeams) {
            setRadio('combustion', 'under-beams');
        } else {
            setRadio('combustion', 'none');
        }
    } else {
        setRadio('combustion', 'none');
    }

    // Clear aspect checkboxes first
    viewState.container.querySelectorAll('input[name="benefic-aspect"]').forEach(cb => cb.checked = false);
    viewState.container.querySelectorAll('input[name="malefic-aspect"]').forEach(cb => cb.checked = false);

    // Set aspect checkboxes based on calculated aspects
    const benefics = ['Venus', 'Jupiter'];
    const malefics = ['Mars', 'Saturn'];

    for (const aspect of data.aspects) {
        const otherPlanet = aspect.planet1 === planet ? aspect.planet2 : aspect.planet1;
        const aspectType = aspect.aspectType.toLowerCase();

        if (benefics.includes(otherPlanet)) {
            if (aspectType === 'conjunction') setCheckbox('benefic-aspect', true, 'conjunction');
            if (aspectType === 'trine') setCheckbox('benefic-aspect', true, 'trine');
            if (aspectType === 'sextile') setCheckbox('benefic-aspect', true, 'sextile');
        }

        if (malefics.includes(otherPlanet) && otherPlanet !== planet) {
            if (aspectType === 'conjunction') setCheckbox('malefic-aspect', true, 'conjunction');
            if (aspectType === 'opposition') setCheckbox('malefic-aspect', true, 'opposition');
            if (aspectType === 'square') setCheckbox('malefic-aspect', true, 'square');
        }
    }

    // Recalculate score
    calculateScore();
}

/**
 * Set radio button value
 */
function setRadio(name, value) {
    if (!viewState.container) return;
    const radio = viewState.container.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
}

/**
 * Set checkbox value
 */
function setCheckbox(name, checked, value = null) {
    if (!viewState.container) return;
    if (value) {
        const cb = viewState.container.querySelector(`input[name="${name}"][value="${value}"]`);
        if (cb) cb.checked = checked;
    } else {
        const cb = viewState.container.querySelector(`input[name="${name}"]`);
        if (cb) cb.checked = checked;
    }
}

/**
 * Show status message
 */
function showStatus(message, type) {
    if (!viewState.container) return;
    const statusEl = viewState.container.querySelector('#chartStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = 'text-sm mt-2 ' + (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-blue-400');
    }
}

/**
 * Calculate dignity score
 */
function calculateScore() {
    if (!viewState.container) return;

    let essential = 0;
    let accidental = 0;

    // Essential Dignities
    const domicile = viewState.container.querySelector('input[name="domicile"]:checked')?.value;
    if (domicile === 'ruler') essential += 5;

    const exaltation = viewState.container.querySelector('input[name="exaltation"]:checked')?.value;
    if (exaltation === 'exalted') essential += 4;

    const triplicity = viewState.container.querySelector('input[name="triplicity"]:checked')?.value;
    if (triplicity && triplicity !== 'none') essential += 3;

    const term = viewState.container.querySelector('input[name="term"]:checked')?.value;
    if (term === 'term') essential += 2;

    const face = viewState.container.querySelector('input[name="face"]:checked')?.value;
    if (face === 'face') essential += 1;

    // Essential Debilities
    if (viewState.container.querySelector('input[name="detriment"]:checked')) essential -= 5;
    if (viewState.container.querySelector('input[name="fall"]:checked')) essential -= 4;

    // Accidental Conditions
    const motion = viewState.container.querySelector('input[name="motion"]:checked')?.value;
    if (motion === 'direct') accidental += 4;
    else if (motion === 'retrograde') accidental -= 5;

    const planetSect = viewState.container.querySelector('input[name="planet-sect"]:checked')?.value;
    if (planetSect === 'in-sect') accidental += 3;
    else if (planetSect === 'contrary') accidental -= 2;

    viewState.container.querySelectorAll('input[name="benefic-aspect"]:checked').forEach(cb => {
        if (cb.value === 'conjunction') accidental += 5;
        else if (cb.value === 'trine') accidental += 4;
        else if (cb.value === 'sextile') accidental += 3;
    });

    viewState.container.querySelectorAll('input[name="malefic-aspect"]:checked').forEach(cb => {
        if (cb.value === 'conjunction') accidental -= 5;
        else if (cb.value === 'opposition') accidental -= 4;
        else if (cb.value === 'square') accidental -= 3;
    });

    const combustion = viewState.container.querySelector('input[name="combustion"]:checked')?.value;
    if (combustion === 'cazimi') accidental += 5;
    else if (combustion === 'combust') accidental -= 5;
    else if (combustion === 'under-beams') accidental -= 4;

    if (viewState.container.querySelector('input[name="mutual-reception"]:checked')) accidental += 5;
    if (viewState.container.querySelector('input[name="hayz"]:checked')) accidental += 2;
    if (viewState.container.querySelector('input[name="besieged"]:checked')) accidental -= 5;

    const overall = essential + accidental;

    const essentialTotal = viewState.container.querySelector('#essentialTotal');
    const accidentalTotal = viewState.container.querySelector('#accidentalTotal');
    const overallScore = viewState.container.querySelector('#overallScore');

    if (essentialTotal) essentialTotal.value = (essential >= 0 ? '+' : '') + essential;
    if (accidentalTotal) accidentalTotal.value = (accidental >= 0 ? '+' : '') + accidental;
    if (overallScore) overallScore.value = (overall >= 0 ? '+' : '') + overall;

    const assessmentSelect = viewState.container.querySelector('#assessment');
    if (assessmentSelect) {
        if (overall >= 15) assessmentSelect.value = 'Very Strong (+15 or more)';
        else if (overall >= 10) assessmentSelect.value = 'Strong (+10 to +14)';
        else if (overall >= 5) assessmentSelect.value = 'Moderately Strong (+5 to +9)';
        else if (overall >= 0) assessmentSelect.value = 'Neutral (0 to +4)';
        else if (overall >= -5) assessmentSelect.value = 'Weak (-1 to -5)';
        else assessmentSelect.value = 'Very Weak (-6 or less)';
    }
}
