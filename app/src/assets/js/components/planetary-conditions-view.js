/**
 * PlanetaryConditionsView Web Component
 * Displays the planetary conditions worksheet form with tab-based planet selection
 * Auto-calculates conditions from birth data
 */
class PlanetaryConditionsView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.selectedPlanet = 'Sun';
        this.chartData = null; // Will hold calculated chart data
        this.modules = null;   // Will hold imported modules
    }

    connectedCallback() {
        this.render();
        this.loadModules().then(() => {
            this.attachEventListeners();
            // Auto-calculate if chart data exists in sidebar
            this.autoCalculateFromSidebar();
        });
    }

    async loadModules() {
        try {
            const [geocodingModule, astroModule, dignityModule] = await Promise.all([
                import('../geocoding-service.js'),
                import('../astro-calculations.js'),
                import('../dignity-tables.js')
            ]);

            this.modules = {
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

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/tailwind/tailwind.min.css">
            <style>
                :host { display: block; }
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
                        ${this.renderPlanetInfoCards()}
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

    renderPlanetInfoCards() {
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
                            <span class="text-6xl">${this.getPlanetSymbol(key)}</span>
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

    getPlanetSymbol(planet) {
        const symbols = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄' };
        return symbols[planet] || '?';
    }

    autoCalculateFromSidebar() {
        // Read chart data from the main sidebar form via ChartData
        const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;

        if (chartData && chartData.date && chartData.time && chartData.location) {
            // Update header with chart info
            this.updateChartInfoHeader(chartData);
            // Auto-calculate
            this.calculateChart();
        } else {
            this.showStatus('Enter chart data in the sidebar and click Calculate Chart, then return here.', 'info');
        }
    }

    updateChartInfoHeader(data) {
        const nameEl = this.shadowRoot.getElementById('chartInfoName');
        const detailsEl = this.shadowRoot.getElementById('chartInfoDetails');

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

    attachEventListeners() {
        // Back link
        this.shadowRoot.getElementById('backLink').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('view-change', { bubbles: true, composed: true, detail: { view: 'chart' } }));
        });

        // Recalculate button
        this.shadowRoot.getElementById('recalculateBtn').addEventListener('click', () => {
            const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;
            if (chartData) this.updateChartInfoHeader(chartData);
            this.calculateChart();
        });

        // Tab buttons
        const tabButtons = this.shadowRoot.querySelectorAll('.zodiac-tab-btn');
        const tabContents = this.shadowRoot.querySelectorAll('.zodiac-tab-content');
        const planetSelect = this.shadowRoot.getElementById('planetSelect');

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
                const targetContent = this.shadowRoot.querySelector(`[data-content="${targetTab}"]`);
                if (targetContent) targetContent.classList.remove('hidden');

                this.selectedPlanet = targetTab;
                planetSelect.value = targetTab;

                // Populate form with this planet's calculated data if available
                if (this.chartData) {
                    this.populateFormForPlanet(targetTab);
                }
            });
        });

        // Auto-calculate on any input change
        const inputs = this.shadowRoot.querySelectorAll('input[type="radio"], input[type="checkbox"], select:not(#planetSelect)');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.calculateScore());
        });
    }

    async calculateChart() {
        if (!this.modules) {
            this.showStatus('Error: Modules not loaded yet. Please wait and try again.', 'error');
            return;
        }

        // Read from sidebar's ChartData
        const chartData = window.ChartData ? window.ChartData.getCurrentData() : null;
        if (!chartData) {
            this.showStatus('ChartData not available. Enter data in the sidebar.', 'error');
            return;
        }

        const { date: birthDate, time: birthTime, location: birthLocation } = chartData;

        if (!birthDate || !birthTime || !birthLocation) {
            this.showStatus('Please fill in all birth data fields in the sidebar.', 'error');
            return;
        }

        const btn = this.shadowRoot.getElementById('recalculateBtn');
        btn.textContent = 'Calculating...';
        btn.disabled = true;

        try {
            // Step 1: Geocode location
            this.showStatus('Geocoding location...', 'info');
            const geoResult = await this.modules.GeocodingService.geocode(birthLocation);

            // Step 2: Parse date/time
            const dateTime = new Date(`${birthDate}T${birthTime}`);

            // Step 3: Calculate planetary positions
            this.showStatus('Calculating planetary positions...', 'info');
            const positions = this.modules.calculatePlanetaryPositions(dateTime, geoResult.latitude, geoResult.longitude);

            // Step 4: Calculate additional data
            const ascendant = this.modules.calculateAscendant(dateTime, geoResult.latitude, geoResult.longitude);
            const sect = this.modules.calculateSect(positions, ascendant);
            const aspects = this.modules.calculateAllAspects(positions, dateTime);

            // Step 5: Build chart data object
            this.chartData = {
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
                const signInfo = this.modules.longitudeToSign(pos.longitude);
                const motion = this.modules.calculatePlanetaryMotion(planet, dateTime);

                let combustion = null;
                if (planet !== 'Sun') {
                    combustion = this.modules.checkCombustion(pos.longitude, positions.Sun.longitude);
                }

                // Get planet's aspects
                const planetAspects = aspects.filter(a => a.planet1 === planet || a.planet2 === planet);

                // Calculate dignities
                const dignities = this.calculateDignities(planet, signInfo.signIndex, signInfo.degree, sect);

                this.chartData.planetData[planet] = {
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
                this.updatePlanetCard(planet);
            }

            this.showStatus(`Chart calculated for ${geoResult.displayName}. Sect: ${sect}`, 'success');

            // Populate form for currently selected planet
            this.populateFormForPlanet(this.selectedPlanet);

        } catch (error) {
            console.error('Chart calculation error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            btn.textContent = 'Recalculate';
            btn.disabled = false;
        }
    }

    calculateDignities(planet, signIndex, degree, sect) {
        const m = this.modules;
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

    updatePlanetCard(planet) {
        const data = this.chartData.planetData[planet];
        const cardEl = this.shadowRoot.getElementById(`calculated-${planet}`);
        if (cardEl && data) {
            cardEl.classList.remove('hidden');
            cardEl.innerHTML = `
                <p class="text-sm font-semibold text-green-400">${data.formattedPosition}</p>
                <p class="text-xs text-gray-300">${data.motion.direction} • ${data.motion.speedCategory}</p>
                ${data.combustion ? `<p class="text-xs text-yellow-400">${data.combustion.visibility}</p>` : ''}
            `;
        }
    }

    populateFormForPlanet(planet) {
        if (!this.chartData || !this.chartData.planetData[planet]) return;

        const data = this.chartData.planetData[planet];
        const dignities = data.dignities;

        // Sign Placement
        this.shadowRoot.getElementById('signPlacement').value = data.sign;

        // Domicile
        this.setRadio('domicile', dignities.domicile ? 'ruler' : 'none');

        // Exaltation
        this.setRadio('exaltation', dignities.exaltation ? 'exalted' : 'none');

        // Triplicity
        if (dignities.triplicity === 'day') {
            this.setRadio('triplicity', 'day-ruler');
        } else if (dignities.triplicity === 'night') {
            this.setRadio('triplicity', 'night-ruler');
        } else if (dignities.triplicity === 'participating') {
            this.setRadio('triplicity', 'participating');
        } else {
            this.setRadio('triplicity', 'none');
        }

        // Term
        this.setRadio('term', dignities.term ? 'term' : 'none');

        // Detriment & Fall
        this.setCheckbox('detriment', dignities.detriment);
        this.setCheckbox('fall', dignities.fall);

        // Motion
        const motion = data.motion.direction.toLowerCase();
        if (motion === 'retrograde') {
            this.setRadio('motion', 'retrograde');
        } else if (motion.includes('station')) {
            this.setRadio('motion', 'stationary');
        } else {
            this.setRadio('motion', 'direct');
        }

        // Sect
        this.setRadio('chart-sect', this.chartData.sect === 'Diurnal' ? 'day' : 'night');

        // Planet sect condition
        const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
        const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];
        const isDayChart = this.chartData.sect === 'Diurnal';

        if (planet === 'Mercury') {
            this.setRadio('planet-sect', 'neutral');
        } else if ((isDayChart && diurnalPlanets.includes(planet)) || (!isDayChart && nocturnalPlanets.includes(planet))) {
            this.setRadio('planet-sect', 'in-sect');
        } else if ((isDayChart && nocturnalPlanets.includes(planet)) || (!isDayChart && diurnalPlanets.includes(planet))) {
            this.setRadio('planet-sect', 'contrary');
        } else {
            this.setRadio('planet-sect', 'neutral');
        }

        // Combustion (for non-Sun planets)
        if (planet !== 'Sun' && data.combustion) {
            if (data.combustion.isCazimi) {
                this.setRadio('combustion', 'cazimi');
            } else if (data.combustion.isCombust) {
                this.setRadio('combustion', 'combust');
            } else if (data.combustion.isUnderBeams) {
                this.setRadio('combustion', 'under-beams');
            } else {
                this.setRadio('combustion', 'none');
            }
        } else {
            this.setRadio('combustion', 'none');
        }

        // Clear aspect checkboxes first
        this.shadowRoot.querySelectorAll('input[name="benefic-aspect"]').forEach(cb => cb.checked = false);
        this.shadowRoot.querySelectorAll('input[name="malefic-aspect"]').forEach(cb => cb.checked = false);

        // Set aspect checkboxes based on calculated aspects
        const benefics = ['Venus', 'Jupiter'];
        const malefics = ['Mars', 'Saturn'];

        for (const aspect of data.aspects) {
            const otherPlanet = aspect.planet1 === planet ? aspect.planet2 : aspect.planet1;
            const aspectType = aspect.aspectType.toLowerCase();

            if (benefics.includes(otherPlanet)) {
                if (aspectType === 'conjunction') this.setCheckbox('benefic-aspect', true, 'conjunction');
                if (aspectType === 'trine') this.setCheckbox('benefic-aspect', true, 'trine');
                if (aspectType === 'sextile') this.setCheckbox('benefic-aspect', true, 'sextile');
            }

            if (malefics.includes(otherPlanet) && otherPlanet !== planet) {
                if (aspectType === 'conjunction') this.setCheckbox('malefic-aspect', true, 'conjunction');
                if (aspectType === 'opposition') this.setCheckbox('malefic-aspect', true, 'opposition');
                if (aspectType === 'square') this.setCheckbox('malefic-aspect', true, 'square');
            }
        }

        // Recalculate score
        this.calculateScore();
    }

    setRadio(name, value) {
        const radio = this.shadowRoot.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    }

    setCheckbox(name, checked, value = null) {
        if (value) {
            const cb = this.shadowRoot.querySelector(`input[name="${name}"][value="${value}"]`);
            if (cb) cb.checked = checked;
        } else {
            const cb = this.shadowRoot.querySelector(`input[name="${name}"]`);
            if (cb) cb.checked = checked;
        }
    }

    showStatus(message, type) {
        const statusEl = this.shadowRoot.getElementById('chartStatus');
        statusEl.textContent = message;
        statusEl.className = 'text-sm ' + (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-blue-400');
    }

    calculateScore() {
        let essential = 0;
        let accidental = 0;

        // Essential Dignities
        const domicile = this.shadowRoot.querySelector('input[name="domicile"]:checked')?.value;
        if (domicile === 'ruler') essential += 5;

        const exaltation = this.shadowRoot.querySelector('input[name="exaltation"]:checked')?.value;
        if (exaltation === 'exalted') essential += 4;

        const triplicity = this.shadowRoot.querySelector('input[name="triplicity"]:checked')?.value;
        if (triplicity && triplicity !== 'none') essential += 3;

        const term = this.shadowRoot.querySelector('input[name="term"]:checked')?.value;
        if (term === 'term') essential += 2;

        const face = this.shadowRoot.querySelector('input[name="face"]:checked')?.value;
        if (face === 'face') essential += 1;

        // Essential Debilities
        if (this.shadowRoot.querySelector('input[name="detriment"]:checked')) essential -= 5;
        if (this.shadowRoot.querySelector('input[name="fall"]:checked')) essential -= 4;

        // Accidental Conditions
        const motion = this.shadowRoot.querySelector('input[name="motion"]:checked')?.value;
        if (motion === 'direct') accidental += 4;
        else if (motion === 'retrograde') accidental -= 5;

        const planetSect = this.shadowRoot.querySelector('input[name="planet-sect"]:checked')?.value;
        if (planetSect === 'in-sect') accidental += 3;
        else if (planetSect === 'contrary') accidental -= 2;

        this.shadowRoot.querySelectorAll('input[name="benefic-aspect"]:checked').forEach(cb => {
            if (cb.value === 'conjunction') accidental += 5;
            else if (cb.value === 'trine') accidental += 4;
            else if (cb.value === 'sextile') accidental += 3;
        });

        this.shadowRoot.querySelectorAll('input[name="malefic-aspect"]:checked').forEach(cb => {
            if (cb.value === 'conjunction') accidental -= 5;
            else if (cb.value === 'opposition') accidental -= 4;
            else if (cb.value === 'square') accidental -= 3;
        });

        const combustion = this.shadowRoot.querySelector('input[name="combustion"]:checked')?.value;
        if (combustion === 'cazimi') accidental += 5;
        else if (combustion === 'combust') accidental -= 5;
        else if (combustion === 'under-beams') accidental -= 4;

        if (this.shadowRoot.querySelector('input[name="mutual-reception"]:checked')) accidental += 5;
        if (this.shadowRoot.querySelector('input[name="hayz"]:checked')) accidental += 2;
        if (this.shadowRoot.querySelector('input[name="besieged"]:checked')) accidental -= 5;

        const overall = essential + accidental;

        this.shadowRoot.getElementById('essentialTotal').value = (essential >= 0 ? '+' : '') + essential;
        this.shadowRoot.getElementById('accidentalTotal').value = (accidental >= 0 ? '+' : '') + accidental;
        this.shadowRoot.getElementById('overallScore').value = (overall >= 0 ? '+' : '') + overall;

        const assessmentSelect = this.shadowRoot.getElementById('assessment');
        if (overall >= 15) assessmentSelect.value = 'Very Strong (+15 or more)';
        else if (overall >= 10) assessmentSelect.value = 'Strong (+10 to +14)';
        else if (overall >= 5) assessmentSelect.value = 'Moderately Strong (+5 to +9)';
        else if (overall >= 0) assessmentSelect.value = 'Neutral (0 to +4)';
        else if (overall >= -5) assessmentSelect.value = 'Weak (-1 to -5)';
        else assessmentSelect.value = 'Very Weak (-6 or less)';
    }
}

customElements.define('planetary-conditions-view', PlanetaryConditionsView);
