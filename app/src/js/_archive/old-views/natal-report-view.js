/**
 * Natal Report View
 * Template-based view for generating Hellenistic natal astrology reports.
 * Provides a structured form for chart analysis using traditional techniques.
 *
 * Features:
 * - Client data entry
 * - Foundational chart analysis (sect, ascendant, lots, triplicity lords)
 * - Multiple delineation approaches (Ptolemy, house-by-house, Dorotheus)
 * - Planetary conditions assessment
 * - Auto-calculation from chart data
 * - Report generation with print/export support
 */

// View state management
let viewState = {
    container: null,
    mode: 'form', // 'form' or 'report'
    formData: {},
    calculatedData: null,
    modules: null,
    isCalculating: false
};

// Sign names for display
const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Create and render the natal report view
 * @param {HTMLElement} container - Container element to render into
 * @returns {Object} API for interacting with the view
 */
export function createNatalReportView(container) {
    viewState.container = container;
    viewState.mode = 'form';
    viewState.formData = {};

    render();
    attachEventListeners();

    return {
        destroy: () => {
            viewState.container = null;
            viewState.formData = {};
            viewState.calculatedData = null;
            viewState.isCalculating = false;
        }
    };
}

/**
 * Load calculation modules asynchronously
 */
async function loadModules() {
    if (viewState.modules) return viewState.modules;

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
            calculateAscendant: astroModule.calculateAscendant,
            calculateHouseCusps: astroModule.calculateHouseCusps,
            longitudeToSign: astroModule.longitudeToSign,
            checkCombustion: astroModule.checkCombustion,
            SIGNS: dignityModule.SIGNS,
            PLANETS: dignityModule.PLANETS,
            DOMICILE_RULERSHIPS: dignityModule.DOMICILE_RULERSHIPS,
            EXALTATIONS: dignityModule.EXALTATIONS,
            DETRIMENTS: dignityModule.DETRIMENTS_CORRECTED,
            FALLS: dignityModule.FALLS,
            TRIPLICITY_RULERS: dignityModule.TRIPLICITY_RULERS,
            getDomicileRuler: dignityModule.getDomicileRuler,
            getBoundRuler: dignityModule.getBoundRuler
        };

        return viewState.modules;
    } catch (error) {
        console.error('Failed to load calculation modules:', error);
        throw error;
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusEl = viewState.container?.querySelector('#calcStatus');
    if (!statusEl) return;

    statusEl.classList.remove('hidden', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-yellow-400');

    const colorClass = {
        info: 'text-blue-400',
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400'
    }[type] || 'text-blue-400';

    statusEl.className = `text-center text-sm mb-4 ${colorClass}`;
    statusEl.textContent = message;
}

/**
 * Hide status message
 */
function hideStatus() {
    const statusEl = viewState.container?.querySelector('#calcStatus');
    if (statusEl) {
        statusEl.classList.add('hidden');
    }
}

/**
 * Calculate chart and populate form fields
 */
async function calculateAndPopulate() {
    if (viewState.isCalculating) return;

    const chartData = window.ChartData?.getCurrentData();
    if (!chartData?.date || !chartData?.time || !chartData?.location) {
        showStatus('Please enter date, time, and location in the sidebar first.', 'error');
        return;
    }

    const calcBtn = viewState.container?.querySelector('#calculateBtn');
    if (calcBtn) {
        calcBtn.textContent = 'Calculating...';
        calcBtn.disabled = true;
    }
    viewState.isCalculating = true;

    try {
        showStatus('Loading modules...', 'info');
        const m = await loadModules();

        showStatus('Geocoding location...', 'info');
        const geoResult = await m.GeocodingService.geocode(chartData.location);

        showStatus('Calculating planetary positions...', 'info');
        const dateTime = new Date(`${chartData.date}T${chartData.time}`);
        const positions = m.calculatePlanetaryPositions(dateTime, geoResult.latitude, geoResult.longitude);
        const ascendant = m.calculateAscendant(dateTime, geoResult.latitude, geoResult.longitude);
        const sect = m.calculateSect(positions, ascendant);
        const houseCusps = m.calculateHouseCusps(ascendant);

        // Store calculated data
        viewState.calculatedData = {
            positions,
            ascendant,
            sect,
            houseCusps,
            dateTime,
            location: geoResult
        };

        showStatus('Populating form...', 'info');
        populateFormFromCalculations(m, positions, ascendant, sect, houseCusps, dateTime);

        showStatus(`Chart calculated for ${geoResult.displayName || chartData.location}`, 'success');

    } catch (error) {
        console.error('Calculation error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        viewState.isCalculating = false;
        if (calcBtn) {
            calcBtn.textContent = 'Calculate from Chart';
            calcBtn.disabled = false;
        }
    }
}

/**
 * Populate form fields from calculated data
 */
function populateFormFromCalculations(m, positions, ascendant, sect, houseCusps, dateTime) {
    if (!viewState.container) return;

    const setField = (id, value) => {
        const el = viewState.container.querySelector(`#${id}`);
        if (el) el.value = value || '';
    };

    const setRadio = (name, value) => {
        const radio = viewState.container.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    };

    // Sect determination
    const isDayChart = sect === 'Diurnal';
    setRadio('chartSect', isDayChart ? 'Day' : 'Night');
    setField('sectLight', isDayChart ? 'Sun' : 'Moon');

    // Planets in/contrary to sect
    const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
    const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];
    const inSect = isDayChart ? diurnalPlanets : nocturnalPlanets;
    const contrarySect = isDayChart ? nocturnalPlanets : diurnalPlanets;
    setField('planetsInSect', inSect.join(', '));
    setField('planetsContraryToSect', contrarySect.join(', '));

    // Ascendant and chart ruler
    const ascSign = m.longitudeToSign(ascendant);
    setField('ascendingSign', ascSign.sign);

    const chartRuler = m.getDomicileRuler(ascSign.signIndex);
    setField('chartRuler', chartRuler);

    if (chartRuler && positions[chartRuler]) {
        const rulerPos = m.longitudeToSign(positions[chartRuler].longitude);
        setField('chartRulerSign', rulerPos.sign);
        const rulerHouse = getHouseForLongitude(positions[chartRuler].longitude, houseCusps);
        setField('chartRulerPlace', `${rulerHouse}${getOrdinalSuffix(rulerHouse)} House`);
        setField('chartRulerCondition', getDignityDescription(chartRuler, rulerPos.signIndex, m));
    }

    // Triplicity lords of sect light
    const sectLight = isDayChart ? 'Sun' : 'Moon';
    const sectLightPos = m.longitudeToSign(positions[sectLight].longitude);
    const triplicityRulers = getTriplicityRulersForSign(sectLightPos.signIndex, m);

    if (triplicityRulers) {
        // First lord (day ruler for day charts, night for night)
        const firstLord = isDayChart ? triplicityRulers.day : triplicityRulers.night;
        setField('tripFirst', firstLord);
        if (positions[firstLord]) {
            const firstPos = m.longitudeToSign(positions[firstLord].longitude);
            const firstHouse = getHouseForLongitude(positions[firstLord].longitude, houseCusps);
            setField('tripFirstPlace', `${firstPos.sign}, ${firstHouse}${getOrdinalSuffix(firstHouse)} House`);
            setField('tripFirstCond', getDignityDescription(firstLord, firstPos.signIndex, m));
        }

        // Second lord
        const secondLord = isDayChart ? triplicityRulers.night : triplicityRulers.day;
        setField('tripSecond', secondLord);
        if (positions[secondLord]) {
            const secondPos = m.longitudeToSign(positions[secondLord].longitude);
            const secondHouse = getHouseForLongitude(positions[secondLord].longitude, houseCusps);
            setField('tripSecondPlace', `${secondPos.sign}, ${secondHouse}${getOrdinalSuffix(secondHouse)} House`);
            setField('tripSecondCond', getDignityDescription(secondLord, secondPos.signIndex, m));
        }

        // Participating lord
        setField('tripPart', triplicityRulers.participating);
        if (positions[triplicityRulers.participating]) {
            const partPos = m.longitudeToSign(positions[triplicityRulers.participating].longitude);
            const partHouse = getHouseForLongitude(positions[triplicityRulers.participating].longitude, houseCusps);
            setField('tripPartPlace', `${partPos.sign}, ${partHouse}${getOrdinalSuffix(partHouse)} House`);
            setField('tripPartCond', getDignityDescription(triplicityRulers.participating, partPos.signIndex, m));
        }
    }

    // Calculate and populate Lots
    const lotFortune = calculateLotOfFortune(positions, ascendant, isDayChart);
    const lotSpirit = calculateLotOfSpirit(positions, ascendant, isDayChart);

    const fortuneSign = m.longitudeToSign(lotFortune);
    const fortuneHouse = getHouseForLongitude(lotFortune, houseCusps);
    setField('lotFortune', `${fortuneSign.sign}, ${fortuneHouse}${getOrdinalSuffix(fortuneHouse)} House`);
    setField('lotFortuneLord', m.getDomicileRuler(fortuneSign.signIndex));

    const spiritSign = m.longitudeToSign(lotSpirit);
    const spiritHouse = getHouseForLongitude(lotSpirit, houseCusps);
    setField('lotSpirit', `${spiritSign.sign}, ${spiritHouse}${getOrdinalSuffix(spiritHouse)} House`);
    setField('lotSpiritLord', m.getDomicileRuler(spiritSign.signIndex));

    // Planetary conditions table
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    for (const planet of planets) {
        const pos = positions[planet];
        if (!pos) continue;

        const signInfo = m.longitudeToSign(pos.longitude);
        const house = getHouseForLongitude(pos.longitude, houseCusps);
        const motion = m.calculatePlanetaryMotion(planet, dateTime);

        const planetLower = planet.toLowerCase();
        setField(`${planetLower}Sign`, `${signInfo.sign} ${Math.floor(signInfo.degree)}°`);
        setField(`${planetLower}Place`, `${house}${getOrdinalSuffix(house)} House`);
        setField(`${planetLower}Dignity`, getDignityDescription(planet, signInfo.signIndex, m));

        // Sect condition
        const isInSect = inSect.includes(planet);
        const sectCondition = planet === 'Mercury' ? 'Neutral' : (isInSect ? 'In Sect' : 'Contrary');
        setField(`${planetLower}Sect`, sectCondition);

        // Motion/aspects summary
        const motionStr = motion.direction === 'Retrograde' ? 'Rx' : 'D';
        setField(`${planetLower}Aspects`, motionStr);
    }
}

/**
 * Get house number for a given longitude
 */
function getHouseForLongitude(longitude, houseCusps) {
    for (let i = 0; i < 12; i++) {
        const cusp = houseCusps[i];
        const nextCusp = houseCusps[(i + 1) % 12];

        if (nextCusp > cusp) {
            if (longitude >= cusp && longitude < nextCusp) return i + 1;
        } else {
            // Handles wrap-around at 0/360
            if (longitude >= cusp || longitude < nextCusp) return i + 1;
        }
    }
    return 1;
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Get dignity description for a planet in a sign
 */
function getDignityDescription(planet, signIndex, m) {
    const dignities = [];

    // Check domicile
    if (m.DOMICILE_RULERSHIPS[signIndex] === planet) {
        dignities.push('Domicile');
    }

    // Check exaltation
    const exalt = m.EXALTATIONS[planet];
    if (exalt && exalt.sign === signIndex) {
        dignities.push('Exalted');
    }

    // Check detriment
    const detriment = m.DETRIMENTS[planet];
    if (Array.isArray(detriment)) {
        if (detriment.includes(signIndex)) dignities.push('Detriment');
    } else if (detriment === signIndex) {
        dignities.push('Detriment');
    }

    // Check fall
    if (m.FALLS[planet] === signIndex) {
        dignities.push('Fall');
    }

    return dignities.length > 0 ? dignities.join(', ') : 'Peregrine';
}

/**
 * Get triplicity rulers for a sign
 */
function getTriplicityRulersForSign(signIndex, m) {
    for (const data of Object.values(m.TRIPLICITY_RULERS)) {
        if (data.signs.includes(signIndex)) {
            return data;
        }
    }
    return null;
}

/**
 * Calculate Lot of Fortune
 * Day: Asc + Moon - Sun
 * Night: Asc + Sun - Moon
 */
function calculateLotOfFortune(positions, ascendant, isDayChart) {
    const sunLong = positions.Sun.longitude;
    const moonLong = positions.Moon.longitude;

    let lot;
    if (isDayChart) {
        lot = ascendant + moonLong - sunLong;
    } else {
        lot = ascendant + sunLong - moonLong;
    }

    // Normalize to 0-360
    lot = ((lot % 360) + 360) % 360;
    return lot;
}

/**
 * Calculate Lot of Spirit
 * Day: Asc + Sun - Moon
 * Night: Asc + Moon - Sun
 */
function calculateLotOfSpirit(positions, ascendant, isDayChart) {
    const sunLong = positions.Sun.longitude;
    const moonLong = positions.Moon.longitude;

    let lot;
    if (isDayChart) {
        lot = ascendant + sunLong - moonLong;
    } else {
        lot = ascendant + moonLong - sunLong;
    }

    lot = ((lot % 360) + 360) % 360;
    return lot;
}

/**
 * Main render function
 */
function render() {
    if (!viewState.container) return;

    const isReportMode = viewState.mode === 'report';
    // TODO: figure out why the view is not filling the container
    viewState.container.innerHTML = `
        <div class="h-full overflow-auto bg-gray-900 text-gray-200">
            <div class="max-w-4xl mx-auto p-6">

                <!-- Header -->
                <div class="mb-6">
                    <span class="inline-block mb-4 text-blue-400 cursor-pointer hover:underline" id="backLink">
                        ← Back to Chart
                    </span>
                    <h1 class="text-3xl font-bold text-white text-center border-b-2 border-gray-600 pb-4">
                        NATAL CHART REPORT
                    </h1>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap justify-center gap-3 py-4 border-y-2 border-gray-600 mb-4 ${isReportMode ? 'report-buttons' : 'form-buttons'}">
                    ${isReportMode ? `
                        <button id="backToFormBtn" class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm">
                            Back to Form
                        </button>
                        <button id="printBtn" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm">
                            Print Report
                        </button>
                        <button id="downloadBtn" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm">
                            Download HTML
                        </button>
                    ` : `
                        <button id="calculateBtn" class="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold text-sm">
                            Calculate from Chart
                        </button>
                        <button id="generateBtn" class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm">
                            Generate Report
                        </button>
                        <button id="saveFormBtn" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm">
                            Save Data
                        </button>
                        <button id="loadFormBtn" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm">
                            Load Data
                        </button>
                    `}
                </div>

                <!-- Status Message -->
                <div id="calcStatus" class="text-center text-sm mb-4 hidden"></div>

                <!-- Form Content -->
                <form id="natalReportForm">
                    ${renderClientInfoSection(isReportMode)}
                    ${renderFoundationalAnalysisSection(isReportMode)}
                    ${renderDelineationSection(isReportMode)}
                    ${renderPlanetaryConditionsSection(isReportMode)}
                    ${renderSynthesisSection(isReportMode)}
                    ${renderTimeLordSection(isReportMode)}
                </form>

                <!-- Footer -->
                <div class="text-center text-gray-500 italic mt-8 pb-8">
                    — End of Report —
                </div>
            </div>
        </div>
    `;
}

/**
 * Render client information section
 * Pulls data directly from the sidebar's ChartData
 */
function renderClientInfoSection(isReportMode) {
    // Get data from sidebar
    const chartData = window.ChartData?.getCurrentData() || {};
    const { name, date, time, location } = chartData;

    // Format date/time for display
    let dateTimeDisplay = '';
    if (date && time) {
        try {
            const dateObj = new Date(`${date}T${time}`);
            dateTimeDisplay = dateObj.toLocaleString();
        } catch {
            dateTimeDisplay = `${date} ${time}`;
        }
    }

    return `
        <table class="w-full mb-6">
            <tbody>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 w-1/3 border border-gray-600">Client Name:</td>
                    <td class="p-3 border border-gray-600">
                        <span id="clientName" class="text-gray-200">${name || '—'}</span>
                        <input type="hidden" name="clientName" value="${name || ''}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Birth Date & Time:</td>
                    <td class="p-3 border border-gray-600">
                        <span id="birthDateTime" class="text-gray-200">${dateTimeDisplay || '—'}</span>
                        <input type="hidden" name="birthDateTime" value="${dateTimeDisplay || ''}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Birth Location:</td>
                    <td class="p-3 border border-gray-600">
                        <span id="birthLocation" class="text-gray-200">${location || '—'}</span>
                        <input type="hidden" name="birthLocation" value="${location || ''}">
                    </td>
                </tr>
            </tbody>
        </table>
        <p class="text-xs text-gray-500 mb-4">Chart data is read from the sidebar. Edit it there to update.</p>
    `;
}

/**
 * Render foundational chart analysis section
 */
function renderFoundationalAnalysisSection(isReportMode) {
    const inputClass = isReportMode
        ? 'bg-transparent border-none p-0'
        : 'bg-gray-700 border border-gray-600 rounded p-2';

    return `
        <div class="border-t-2 border-gray-500 my-8"></div>

        <h2 class="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">
            I. FOUNDATIONAL CHART ANALYSIS
        </h2>
        <p class="text-gray-400 italic mb-4">Complete these core calculations before proceeding to interpretation</p>

        <!-- Sect Determination -->
        <h3 class="text-xl font-semibold text-gray-200 mt-6 mb-3">A. Sect Determination</h3>
        <table class="w-full mb-6">
            <tbody>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 w-1/3 border border-gray-600">Chart Sect:</td>
                    <td class="p-3 border border-gray-600">
                        <label class="inline-flex items-center mr-6 text-gray-300">
                            <input type="radio" name="chartSect" value="Day" class="mr-2">
                            Day (Sun above horizon)
                        </label>
                        <label class="inline-flex items-center text-gray-300">
                            <input type="radio" name="chartSect" value="Night" class="mr-2">
                            Night (Sun below horizon)
                        </label>
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Sect Light:</td>
                    <td class="p-3 border border-gray-600">
                        <input type="text" id="sectLight" name="sectLight"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Planets in Sect:</td>
                    <td class="p-3 border border-gray-600">
                        <input type="text" id="planetsInSect" name="planetsInSect"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Planets Contrary to Sect:</td>
                    <td class="p-3 border border-gray-600">
                        <input type="text" id="planetsContraryToSect" name="planetsContraryToSect"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Chart Ruler & Rising Sign -->
        <h3 class="text-xl font-semibold text-gray-200 mt-6 mb-3">B. Chart Ruler & Rising Sign</h3>
        <table class="w-full mb-6">
            <tbody>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 w-1/3 border border-gray-600">Ascending Sign:</td>
                    <td class="p-3 border border-gray-600">
                        <input type="text" id="ascendingSign" name="ascendingSign"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Chart Ruler (Domicile Lord):</td>
                    <td class="p-3 border border-gray-600">
                        <input type="text" id="chartRuler" name="chartRuler"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-700 font-semibold p-3 border border-gray-600">Chart Ruler Placement:</td>
                    <td class="p-3 border border-gray-600">
                        <div class="flex gap-2">
                            <div class="flex-1">
                                <label class="text-xs text-gray-400">Sign</label>
                                <input type="text" id="chartRulerSign" name="chartRulerSign"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div class="flex-1">
                                <label class="text-xs text-gray-400">Place</label>
                                <input type="text" id="chartRulerPlace" name="chartRulerPlace"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div class="flex-1">
                                <label class="text-xs text-gray-400">Condition</label>
                                <input type="text" id="chartRulerCondition" name="chartRulerCondition"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Triplicity Lords -->
        <h3 class="text-xl font-semibold text-gray-200 mt-6 mb-3">C. Triplicity Lords of Sect Light</h3>
        <p class="text-gray-400 italic mb-3">These rulers divide and govern the life span according to Dorotheus</p>
        <table class="w-full mb-6">
            <thead>
                <tr>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">First Lord (Early Life)</th>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Second Lord (Middle Life)</th>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Participating Lord</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><strong class="text-gray-300">Planet:</strong>
                                <input type="text" id="tripFirst" name="tripFirst" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Placement:</strong>
                                <input type="text" id="tripFirstPlace" name="tripFirstPlace" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Condition:</strong>
                                <input type="text" id="tripFirstCond" name="tripFirstCond" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><strong class="text-gray-300">Planet:</strong>
                                <input type="text" id="tripSecond" name="tripSecond" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Placement:</strong>
                                <input type="text" id="tripSecondPlace" name="tripSecondPlace" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Condition:</strong>
                                <input type="text" id="tripSecondCond" name="tripSecondCond" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><strong class="text-gray-300">Planet:</strong>
                                <input type="text" id="tripPart" name="tripPart" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Placement:</strong>
                                <input type="text" id="tripPartPlace" name="tripPartPlace" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><strong class="text-gray-300">Condition:</strong>
                                <input type="text" id="tripPartCond" name="tripPartCond" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Four Principal Lots -->
        <h3 class="text-xl font-semibold text-gray-200 mt-6 mb-3">D. Four Principal Lots</h3>
        <table class="w-full mb-6">
            <thead>
                <tr>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Lot of Fortune</th>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Lot of Spirit</th>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Lot of Eros</th>
                    <th class="bg-gray-700 p-3 text-left border border-gray-600">Lot of Necessity</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><span class="text-gray-400 text-sm">Sign/Place:</span>
                                <input type="text" id="lotFortune" name="lotFortune" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><span class="text-gray-400 text-sm">Lord:</span>
                                <input type="text" id="lotFortuneLord" name="lotFortuneLord" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><span class="text-gray-400 text-sm">Sign/Place:</span>
                                <input type="text" id="lotSpirit" name="lotSpirit" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><span class="text-gray-400 text-sm">Lord:</span>
                                <input type="text" id="lotSpiritLord" name="lotSpiritLord" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><span class="text-gray-400 text-sm">Sign/Place:</span>
                                <input type="text" id="lotEros" name="lotEros" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><span class="text-gray-400 text-sm">Lord:</span>
                                <input type="text" id="lotErosLord" name="lotErosLord" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                    <td class="p-3 border border-gray-600 align-top">
                        <div class="space-y-2">
                            <div><span class="text-gray-400 text-sm">Sign/Place:</span>
                                <input type="text" id="lotNecessity" name="lotNecessity" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                            <div><span class="text-gray-400 text-sm">Lord:</span>
                                <input type="text" id="lotNecessityLord" name="lotNecessityLord" class="w-full text-gray-200 outline-none ${inputClass}">
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

/**
 * Render delineation methods section
 */
function renderDelineationSection(isReportMode) {
    const inputClass = isReportMode
        ? 'bg-transparent border-none p-0'
        : 'bg-gray-700 border border-gray-600 rounded p-2';

    return `
        <div class="border-t-2 border-gray-500 my-8"></div>

        <h2 class="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">
            II. CHART DELINEATION
        </h2>
        <p class="font-semibold text-gray-200 mb-3">Choose your organizational approach:</p>
        <div class="mb-6 space-y-2">
            <label class="flex items-center text-gray-300">
                <input type="checkbox" id="optionA" name="optionA" class="mr-2">
                OPTION A: Topic-by-Topic (Ptolemy's Method)
            </label>
            <label class="flex items-center text-gray-300">
                <input type="checkbox" id="optionB" name="optionB" class="mr-2">
                OPTION B: House-by-House Systematic
            </label>
            <label class="flex items-center text-gray-300">
                <input type="checkbox" id="optionC" name="optionC" class="mr-2">
                OPTION C: Triplicity-Based (Dorotheus' Method)
            </label>
        </div>

        <!-- Option A: Ptolemy's Method -->
        <div class="border-l-4 border-blue-500 pl-5 my-6">
            <h3 class="text-xl font-semibold text-gray-200 mb-2">OPTION A: Topic-by-Topic Analysis (Ptolemy)</h3>
            <p class="text-gray-400 italic mb-4">Organized by when topics become relevant in life</p>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">1. Prenatal Matters</h4>
            <p class="font-semibold text-gray-300 mb-1">Parents:</p>
            <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-32">Sun (father):</span>
                    <input type="text" id="ptolemyFather" name="ptolemyFather" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-32">Moon (mother):</span>
                    <input type="text" id="ptolemyMother" name="ptolemyMother" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-32">Saturn (general):</span>
                    <input type="text" id="ptolemySaturn" name="ptolemySaturn" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <p class="font-semibold text-gray-300 mb-1">Siblings:</p>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Mercury & 3rd place:</span>
                <input type="text" id="ptolemySiblings" name="ptolemySiblings" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">2. Matters at Birth</h4>
            <p class="font-semibold text-gray-300 mb-1">Physical Constitution:</p>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Ascendant & its ruler:</span>
                <input type="text" id="ptolemyConstitution" name="ptolemyConstitution" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">3. Length of Life</h4>
            <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 font-semibold">Hyleg (Life-Giver):</span>
                    <input type="text" id="ptolemyHyleg" name="ptolemyHyleg" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 font-semibold">Alchocoden (Life Span Ruler):</span>
                    <input type="text" id="ptolemyAlchocoden" name="ptolemyAlchocoden" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">4. Qualities of Mind</h4>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Mercury & Moon analysis:</span>
                <input type="text" id="ptolemyMind" name="ptolemyMind" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">5. Material Fortune</h4>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Lot of Fortune & 2nd place:</span>
                <input type="text" id="ptolemyFortune" name="ptolemyFortune" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">6. Career & Rank</h4>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">10th place, Lot of Spirit, Sun & Saturn:</span>
                <input type="text" id="ptolemyCareer" name="ptolemyCareer" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">7. Marriage</h4>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Venus (men) or Sun/Mars (women), 7th place:</span>
                <input type="text" id="ptolemyMarriage" name="ptolemyMarriage" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-2">8. Children</h4>
            <div class="flex items-center gap-2 mb-4">
                <span class="text-gray-400">Jupiter, Moon, 5th place:</span>
                <input type="text" id="ptolemyChildren" name="ptolemyChildren" class="flex-1 text-gray-200 outline-none ${inputClass}">
            </div>
        </div>

        <!-- Option B: House-by-House -->
        <div class="border-l-4 border-blue-500 pl-5 my-6">
            <h3 class="text-xl font-semibold text-gray-200 mb-2">OPTION B: House-by-House Systematic Analysis</h3>
            <p class="text-gray-400 italic mb-4">Examine each place in order of strength: angles → succedent → cadent</p>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Angular Places (Most Powerful)</h4>
            ${renderHouseInput('1st Place (Hour-Marker) - Life, Body, Self', 'house1', inputClass)}
            ${renderHouseInput('10th Place (Midheaven) - Career, Reputation, Actions', 'house10', inputClass)}
            ${renderHouseInput('7th Place (Setting) - Marriage, Partnerships', 'house7', inputClass)}
            ${renderHouseInput('4th Place (Subterranean) - Parents, Foundations, Home', 'house4', inputClass)}

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Succedent Places</h4>
            ${renderHouseInput('11th Place (Good Spirit) - Friends, Hopes, Acquisition', 'house11', inputClass)}
            ${renderHouseInput('5th Place (Good Fortune) - Children, Pleasure', 'house5', inputClass)}
            ${renderHouseInput('2nd Place (Gate of Hades) - Resources, Livelihood', 'house2', inputClass)}
            ${renderHouseInput('8th Place (Idle) - Death, Others\' Resources', 'house8', inputClass)}

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Cadent Places (Weakest)</h4>
            ${renderHouseInput('9th Place (God) - Travel, Religion, Higher Learning', 'house9', inputClass)}
            ${renderHouseInput('3rd Place (Goddess) - Siblings, Short Journeys', 'house3', inputClass)}
            ${renderHouseInput('6th Place (Bad Fortune) - Illness, Enemies, Servants', 'house6', inputClass)}
            ${renderHouseInput('12th Place (Bad Spirit) - Hidden Enemies, Confinement', 'house12', inputClass)}
        </div>

        <!-- Option C: Dorotheus' Method -->
        <div class="border-l-4 border-blue-500 pl-5 my-6">
            <h3 class="text-xl font-semibold text-gray-200 mb-2">OPTION C: Triplicity-Based Analysis (Dorotheus)</h3>
            <p class="text-gray-400 italic mb-4">For each topic, identify significator → examine its three triplicity rulers → assess placement and condition</p>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Parents</h4>
            <p class="font-semibold text-gray-300 mb-2">Father (Sun's triplicity lords):</p>
            <div class="space-y-2 mb-4 ml-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">First lord (early relationship):</span>
                    <input type="text" id="dorFatherFirst" name="dorFatherFirst" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Second lord (later relationship):</span>
                    <input type="text" id="dorFatherSecond" name="dorFatherSecond" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Participating lord:</span>
                    <input type="text" id="dorFatherPart" name="dorFatherPart" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <p class="font-semibold text-gray-300 mb-2">Mother (Moon's triplicity lords):</p>
            <div class="space-y-2 mb-4 ml-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">First lord (early relationship):</span>
                    <input type="text" id="dorMotherFirst" name="dorMotherFirst" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Second lord (later relationship):</span>
                    <input type="text" id="dorMotherSecond" name="dorMotherSecond" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Participating lord:</span>
                    <input type="text" id="dorMotherPart" name="dorMotherPart" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Marriage</h4>
            <p class="text-gray-400 mb-2">Significator (Venus/Sun/Mars as appropriate):</p>
            <div class="space-y-2 mb-4 ml-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">First lord:</span>
                    <input type="text" id="dorMarriageFirst" name="dorMarriageFirst" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Second lord:</span>
                    <input type="text" id="dorMarriageSecond" name="dorMarriageSecond" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Participating lord:</span>
                    <input type="text" id="dorMarriagePart" name="dorMarriagePart" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">7th place condition:</span>
                    <input type="text" id="dorMarriage7th" name="dorMarriage7th" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Children</h4>
            <p class="text-gray-400 mb-2">Significator (Jupiter's triplicity lords):</p>
            <div class="space-y-2 mb-4 ml-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">First lord:</span>
                    <input type="text" id="dorChildrenFirst" name="dorChildrenFirst" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Second lord:</span>
                    <input type="text" id="dorChildrenSecond" name="dorChildrenSecond" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Participating lord:</span>
                    <input type="text" id="dorChildrenPart" name="dorChildrenPart" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">5th place condition:</span>
                    <input type="text" id="dorChildren5th" name="dorChildren5th" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>

            <h4 class="text-lg font-semibold text-gray-300 mt-4 mb-3">Livelihood & Fortune</h4>
            <p class="text-gray-400 mb-2">Lot of Fortune's triplicity lords:</p>
            <div class="space-y-2 mb-4 ml-4">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">First lord:</span>
                    <input type="text" id="dorFortuneFirst" name="dorFortuneFirst" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Second lord:</span>
                    <input type="text" id="dorFortuneSecond" name="dorFortuneSecond" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">Participating lord:</span>
                    <input type="text" id="dorFortunePart" name="dorFortunePart" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 w-48">11th from Fortune (Acquisition):</span>
                    <input type="text" id="dorFortune11th" name="dorFortune11th" class="flex-1 text-gray-200 outline-none ${inputClass}">
                </div>
            </div>
        </div>
    `;
}

/**
 * Helper to render house input fields
 */
function renderHouseInput(label, id, inputClass) {
    return `
        <div class="mb-3">
            <p class="font-semibold text-gray-300 mb-1">${label}:</p>
            <input type="text" id="${id}" name="${id}"
                placeholder="Sign, Planets, Ruler condition"
                class="w-full text-gray-200 outline-none ${inputClass}">
        </div>
    `;
}

/**
 * Render planetary conditions section
 */
function renderPlanetaryConditionsSection(isReportMode) {
    const inputClass = isReportMode
        ? 'bg-transparent border-none p-0 text-center'
        : 'bg-gray-700 border border-gray-600 rounded p-1 text-center';

    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    return `
        <div class="border-t-2 border-gray-500 my-8"></div>

        <h2 class="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">
            III. PLANETARY CONDITIONS
        </h2>
        <p class="text-gray-400 italic mb-4">Assess each planet through multiple factors</p>

        <div class="overflow-x-auto">
            <table class="w-full mb-6">
                <thead>
                    <tr>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Planet</th>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Sign</th>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Place</th>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Dignity</th>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Sect</th>
                        <th class="bg-gray-700 p-2 text-left border border-gray-600 font-semibold">Aspects</th>
                    </tr>
                </thead>
                <tbody>
                    ${planets.map(planet => `
                        <tr>
                            <td class="p-2 border border-gray-600 font-semibold text-gray-200">${planet}</td>
                            <td class="p-2 border border-gray-600">
                                <input type="text" id="${planet.toLowerCase()}Sign" name="${planet.toLowerCase()}Sign"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </td>
                            <td class="p-2 border border-gray-600">
                                <input type="text" id="${planet.toLowerCase()}Place" name="${planet.toLowerCase()}Place"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </td>
                            <td class="p-2 border border-gray-600">
                                <input type="text" id="${planet.toLowerCase()}Dignity" name="${planet.toLowerCase()}Dignity"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </td>
                            <td class="p-2 border border-gray-600">
                                <input type="text" id="${planet.toLowerCase()}Sect" name="${planet.toLowerCase()}Sect"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </td>
                            <td class="p-2 border border-gray-600">
                                <input type="text" id="${planet.toLowerCase()}Aspects" name="${planet.toLowerCase()}Aspects"
                                    class="w-full text-gray-200 outline-none ${inputClass}">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Render synthesis section
 */
function renderSynthesisSection(isReportMode) {
    const textareaClass = isReportMode
        ? 'bg-transparent border-none p-0'
        : 'bg-gray-700 border border-gray-600 rounded p-3';

    return `
        <div class="border-t-2 border-gray-500 my-8"></div>

        <h2 class="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">
            IV. SYNTHESIS & INTERPRETATION
        </h2>
        <p class="text-gray-400 italic mb-4">Integrate findings from the selected organizational method with planetary conditions</p>

        <textarea id="synthesis" name="synthesis" rows="12"
            class="w-full text-gray-200 outline-none resize-y ${textareaClass}"></textarea>
    `;
}

/**
 * Render time-lord techniques section
 */
function renderTimeLordSection(isReportMode) {
    const inputClass = isReportMode
        ? 'bg-transparent border-none p-0'
        : 'bg-gray-700 border border-gray-600 rounded p-2';

    return `
        <div class="border-t-2 border-gray-500 my-8"></div>

        <h2 class="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">
            V. TIME-LORD TECHNIQUES (OPTIONAL)
        </h2>
        <p class="text-gray-400 italic mb-4">For predictive work, note current periods</p>

        <div class="space-y-4">
            <div>
                <p class="font-semibold text-gray-300 mb-2">Zodiacal Releasing from Fortune:</p>
                <div class="flex gap-4">
                    <div class="flex-1">
                        <label class="text-sm text-gray-400">Current period:</label>
                        <input type="text" id="zrPeriod" name="zrPeriod"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </div>
                    <div class="flex-1">
                        <label class="text-sm text-gray-400">Dates:</label>
                        <input type="text" id="zrDates" name="zrDates"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </div>
                </div>
            </div>

            <div>
                <p class="font-semibold text-gray-300 mb-2">Annual Profections:</p>
                <div class="flex gap-4">
                    <div class="flex-1">
                        <label class="text-sm text-gray-400">Current year ruler:</label>
                        <input type="text" id="profRuler" name="profRuler"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </div>
                    <div class="flex-1">
                        <label class="text-sm text-gray-400">Age:</label>
                        <input type="number" id="profAge" name="profAge"
                            class="w-full text-gray-200 outline-none ${inputClass}">
                    </div>
                </div>
            </div>

            <div>
                <p class="font-semibold text-gray-300 mb-2">Primary Directions:</p>
                <input type="text" id="primDirect" name="primDirect"
                    class="w-full text-gray-200 outline-none ${inputClass}">
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for all interactive elements
 */
function attachEventListeners() {
    if (!viewState.container) return;

    // Back to chart link
    const backLink = viewState.container.querySelector('#backLink');
    if (backLink) {
        backLink.addEventListener('click', () => {
            viewState.container.dispatchEvent(
                new CustomEvent('view-change', { bubbles: true, detail: { view: 'chart' } })
            );
        });
    }

    // Form mode buttons
    const calculateBtn = viewState.container.querySelector('#calculateBtn');
    const generateBtn = viewState.container.querySelector('#generateBtn');
    const saveFormBtn = viewState.container.querySelector('#saveFormBtn');
    const loadFormBtn = viewState.container.querySelector('#loadFormBtn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateAndPopulate);
    }
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateReport);
    }
    if (saveFormBtn) {
        saveFormBtn.addEventListener('click', handleSaveForm);
    }
    if (loadFormBtn) {
        loadFormBtn.addEventListener('click', handleLoadForm);
    }

    // Report mode buttons
    const backToFormBtn = viewState.container.querySelector('#backToFormBtn');
    const printBtn = viewState.container.querySelector('#printBtn');
    const downloadBtn = viewState.container.querySelector('#downloadBtn');

    if (backToFormBtn) {
        backToFormBtn.addEventListener('click', handleBackToForm);
    }
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadReport);
    }
}

/**
 * Collect all form data into an object
 */
function collectFormData() {
    if (!viewState.container) return {};

    const form = viewState.container.querySelector('#natalReportForm');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Handle radio buttons
    const chartSectRadio = viewState.container.querySelector('input[name="chartSect"]:checked');
    data.chartSect = chartSectRadio?.value || '';

    // Handle checkboxes
    data.optionA = viewState.container.querySelector('#optionA')?.checked || false;
    data.optionB = viewState.container.querySelector('#optionB')?.checked || false;
    data.optionC = viewState.container.querySelector('#optionC')?.checked || false;

    return data;
}

/**
 * Restore form data from an object
 */
function restoreFormData(data) {
    if (!viewState.container || !data) return;

    for (const [key, value] of Object.entries(data)) {
        const element = viewState.container.querySelector(`#${key}`)
            || viewState.container.querySelector(`[name="${key}"]`);

        if (!element) continue;

        if (element.type === 'checkbox') {
            element.checked = value;
        } else if (element.type === 'radio') {
            if (element.value === value) {
                element.checked = true;
            }
        } else {
            element.value = value;
        }
    }
}

/**
 * Switch to report mode
 */
function handleGenerateReport() {
    viewState.formData = collectFormData();
    viewState.mode = 'report';
    render();
    restoreFormData(viewState.formData);
    viewState.container?.scrollTo(0, 0);
}

/**
 * Switch back to form mode
 */
function handleBackToForm() {
    viewState.formData = collectFormData();
    viewState.mode = 'form';
    render();
    attachEventListeners();
    restoreFormData(viewState.formData);
}

/**
 * Save form data to a JSON file
 */
function handleSaveForm() {
    const data = collectFormData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `natal-report-${data.clientName?.replace(/\s+/g, '-') || 'data'}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Load form data from a JSON file
 */
function handleLoadForm() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                restoreFormData(data);
            } catch (error) {
                console.error('Error loading form data:', error);
                alert('Error loading file: Invalid JSON format');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Download the report as a standalone HTML file
 */
function handleDownloadReport() {
    const data = collectFormData();
    const clientName = data.clientName || 'Client';

    // Generate a self-contained HTML report
    const htmlContent = generateStandaloneHTML(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `natal-report-${clientName.replace(/\s+/g, '-')}.html`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Generate a standalone HTML document for the report
 */
function generateStandaloneHTML(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Natal Chart Report - ${data.clientName || 'Client'}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 0.5in; background: #fff; color: #333; }
        h1 { text-align: center; font-size: 24pt; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #666; padding-bottom: 5px; }
        h3 { font-size: 13pt; margin-top: 16px; color: #444; }
        h4 { font-size: 11pt; margin-top: 12px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background-color: #e7e6e6; font-weight: bold; }
        .info-table td:first-child { background-color: #e7e6e6; font-weight: bold; width: 35%; }
        .section-divider { border-top: 2px solid #999; margin: 24px 0; }
        .option-section { border-left: 3px solid #2196F3; padding-left: 16px; margin: 16px 0; }
        .field-label { color: #666; font-size: 10pt; }
        .field-value { font-weight: normal; }
        .footer { text-align: center; font-style: italic; margin-top: 32px; color: #666; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <h1>NATAL CHART REPORT</h1>

    <table class="info-table">
        <tr><td>Client Name:</td><td>${data.clientName || ''}</td></tr>
        <tr><td>Birth Date & Time:</td><td>${data.birthDateTime || ''}</td></tr>
        <tr><td>Birth Location:</td><td>${data.birthLocation || ''}</td></tr>
    </table>

    <div class="section-divider"></div>
    <h2>I. FOUNDATIONAL CHART ANALYSIS</h2>

    <h3>A. Sect Determination</h3>
    <table class="info-table">
        <tr><td>Chart Sect:</td><td>${data.chartSect || ''}</td></tr>
        <tr><td>Sect Light:</td><td>${data.sectLight || ''}</td></tr>
        <tr><td>Planets in Sect:</td><td>${data.planetsInSect || ''}</td></tr>
        <tr><td>Planets Contrary to Sect:</td><td>${data.planetsContraryToSect || ''}</td></tr>
    </table>

    <h3>B. Chart Ruler & Rising Sign</h3>
    <table class="info-table">
        <tr><td>Ascending Sign:</td><td>${data.ascendingSign || ''}</td></tr>
        <tr><td>Chart Ruler:</td><td>${data.chartRuler || ''}</td></tr>
        <tr><td>Chart Ruler Placement:</td><td>Sign: ${data.chartRulerSign || ''} | Place: ${data.chartRulerPlace || ''} | Condition: ${data.chartRulerCondition || ''}</td></tr>
    </table>

    <h3>C. Triplicity Lords of Sect Light</h3>
    <table>
        <tr>
            <th>First Lord (Early Life)</th>
            <th>Second Lord (Middle Life)</th>
            <th>Participating Lord</th>
        </tr>
        <tr>
            <td>Planet: ${data.tripFirst || ''}<br>Placement: ${data.tripFirstPlace || ''}<br>Condition: ${data.tripFirstCond || ''}</td>
            <td>Planet: ${data.tripSecond || ''}<br>Placement: ${data.tripSecondPlace || ''}<br>Condition: ${data.tripSecondCond || ''}</td>
            <td>Planet: ${data.tripPart || ''}<br>Placement: ${data.tripPartPlace || ''}<br>Condition: ${data.tripPartCond || ''}</td>
        </tr>
    </table>

    <h3>D. Four Principal Lots</h3>
    <table>
        <tr>
            <th>Lot of Fortune</th>
            <th>Lot of Spirit</th>
            <th>Lot of Eros</th>
            <th>Lot of Necessity</th>
        </tr>
        <tr>
            <td>${data.lotFortune || ''}<br>Lord: ${data.lotFortuneLord || ''}</td>
            <td>${data.lotSpirit || ''}<br>Lord: ${data.lotSpiritLord || ''}</td>
            <td>${data.lotEros || ''}<br>Lord: ${data.lotErosLord || ''}</td>
            <td>${data.lotNecessity || ''}<br>Lord: ${data.lotNecessityLord || ''}</td>
        </tr>
    </table>

    <div class="section-divider"></div>
    <h2>III. PLANETARY CONDITIONS</h2>
    <table>
        <tr>
            <th>Planet</th><th>Sign</th><th>Place</th><th>Dignity</th><th>Sect</th><th>Aspects</th>
        </tr>
        <tr><td>Sun</td><td>${data.sunSign || ''}</td><td>${data.sunPlace || ''}</td><td>${data.sunDignity || ''}</td><td>${data.sunSect || ''}</td><td>${data.sunAspects || ''}</td></tr>
        <tr><td>Moon</td><td>${data.moonSign || ''}</td><td>${data.moonPlace || ''}</td><td>${data.moonDignity || ''}</td><td>${data.moonSect || ''}</td><td>${data.moonAspects || ''}</td></tr>
        <tr><td>Mercury</td><td>${data.mercurySign || ''}</td><td>${data.mercuryPlace || ''}</td><td>${data.mercuryDignity || ''}</td><td>${data.mercurySect || ''}</td><td>${data.mercuryAspects || ''}</td></tr>
        <tr><td>Venus</td><td>${data.venusSign || ''}</td><td>${data.venusPlace || ''}</td><td>${data.venusDignity || ''}</td><td>${data.venusSect || ''}</td><td>${data.venusAspects || ''}</td></tr>
        <tr><td>Mars</td><td>${data.marsSign || ''}</td><td>${data.marsPlace || ''}</td><td>${data.marsDignity || ''}</td><td>${data.marsSect || ''}</td><td>${data.marsAspects || ''}</td></tr>
        <tr><td>Jupiter</td><td>${data.jupiterSign || ''}</td><td>${data.jupiterPlace || ''}</td><td>${data.jupiterDignity || ''}</td><td>${data.jupiterSect || ''}</td><td>${data.jupiterAspects || ''}</td></tr>
        <tr><td>Saturn</td><td>${data.saturnSign || ''}</td><td>${data.saturnPlace || ''}</td><td>${data.saturnDignity || ''}</td><td>${data.saturnSect || ''}</td><td>${data.saturnAspects || ''}</td></tr>
    </table>

    <div class="section-divider"></div>
    <h2>IV. SYNTHESIS & INTERPRETATION</h2>
    <p>${(data.synthesis || '').replace(/\n/g, '<br>')}</p>

    <div class="section-divider"></div>
    <h2>V. TIME-LORD TECHNIQUES</h2>
    <p><strong>Zodiacal Releasing:</strong> ${data.zrPeriod || ''} (${data.zrDates || ''})</p>
    <p><strong>Annual Profections:</strong> Year ruler: ${data.profRuler || ''}, Age: ${data.profAge || ''}</p>
    <p><strong>Primary Directions:</strong> ${data.primDirect || ''}</p>

    <div class="footer">— End of Report —</div>
</body>
</html>`;
}

export default createNatalReportView;
