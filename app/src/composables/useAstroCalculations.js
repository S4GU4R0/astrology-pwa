/**
 * useAstroCalculations Composable
 * Provides reactive access to astrological calculation functions
 */

import { ref, computed } from 'vue';

// Lazy-loaded modules
let modules = null;

/**
 * Load calculation modules on demand
 */
async function loadModules() {
    if (modules) return modules;

    const [astroModule, dignityModule, geocodingModule] = await Promise.all([
        import('../js/astro/astro-calculations.js'),
        import('../js/astro/dignity-tables.js'),
        import('../js/helpers/geocoding-service.js')
    ]);

    modules = {
        // Astro calculations
        calculatePlanetaryPositions: astroModule.calculatePlanetaryPositions,
        calculatePlanetaryMotion: astroModule.calculatePlanetaryMotion,
        calculateSect: astroModule.calculateSect,
        calculateAscendant: astroModule.calculateAscendant,
        calculateHouseCusps: astroModule.calculateHouseCusps,
        longitudeToSign: astroModule.longitudeToSign,
        checkCombustion: astroModule.checkCombustion,
        calculateAllAspects: astroModule.calculateAllAspects,

        // Dignity tables
        SIGNS: dignityModule.SIGNS,
        PLANETS: dignityModule.PLANETS,
        DOMICILE_RULERSHIPS: dignityModule.DOMICILE_RULERSHIPS,
        EXALTATIONS: dignityModule.EXALTATIONS,
        DETRIMENTS: dignityModule.DETRIMENTS_CORRECTED,
        FALLS: dignityModule.FALLS,
        TRIPLICITY_RULERS: dignityModule.TRIPLICITY_RULERS,
        EGYPTIAN_BOUNDS: dignityModule.EGYPTIAN_BOUNDS,
        getDomicileRuler: dignityModule.getDomicileRuler,
        getBoundRuler: dignityModule.getBoundRuler,

        // Geocoding
        GeocodingService: geocodingModule.GeocodingService
    };

    return modules;
}

// Sign names for display
export const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Planet symbols
export const PLANET_SYMBOLS = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄'
};

// Traditional planets list
export const TRADITIONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

// Sect classifications
export const DIURNAL_PLANETS = ['Sun', 'Jupiter', 'Saturn'];
export const NOCTURNAL_PLANETS = ['Moon', 'Venus', 'Mars'];

/**
 * Main composable function
 */
export function useAstroCalculations() {
    const isLoading = ref(false);
    const error = ref(null);
    const isModulesLoaded = ref(false);

    /**
     * Ensure modules are loaded
     */
    async function ensureModules() {
        if (isModulesLoaded.value) return modules;

        isLoading.value = true;
        error.value = null;

        try {
            await loadModules();
            isModulesLoaded.value = true;
            return modules;
        } catch (e) {
            error.value = e.message;
            throw e;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Geocode a location string to coordinates
     */
    async function geocodeLocation(locationString) {
        const m = await ensureModules();
        return m.GeocodingService.geocode(locationString);
    }

    /**
     * Calculate full chart data
     */
    async function calculateChart(date, time, latitude, longitude) {
        const m = await ensureModules();

        const dateTime = new Date(`${date}T${time}`);
        const positions = m.calculatePlanetaryPositions(dateTime, latitude, longitude);
        const ascendant = m.calculateAscendant(dateTime, latitude, longitude);
        const sect = m.calculateSect(positions, ascendant);
        const houseCusps = m.calculateHouseCusps(ascendant);
        const aspects = m.calculateAllAspects ? m.calculateAllAspects(positions, dateTime) : [];

        return {
            dateTime,
            positions,
            ascendant,
            sect,
            houseCusps,
            aspects
        };
    }

    /**
     * Get sign info from longitude
     */
    async function getSignInfo(longitude) {
        const m = await ensureModules();
        return m.longitudeToSign(longitude);
    }

    /**
     * Get the domicile ruler for a sign
     */
    async function getDomicileRuler(signIndex) {
        const m = await ensureModules();
        return m.getDomicileRuler(signIndex);
    }

    /**
     * Get planetary motion (direct/retrograde)
     */
    async function getPlanetaryMotion(planet, dateTime) {
        const m = await ensureModules();
        return m.calculatePlanetaryMotion(planet, dateTime);
    }

    /**
     * Check combustion status for a planet
     */
    async function checkCombustion(planetLongitude, sunLongitude) {
        const m = await ensureModules();
        return m.checkCombustion(planetLongitude, sunLongitude);
    }

    /**
     * Get dignity status for a planet in a sign
     */
    async function getDignityStatus(planet, signIndex, degree = 15) {
        const m = await ensureModules();

        const status = {
            domicile: false,
            exaltation: false,
            detriment: false,
            fall: false,
            triplicity: null,
            bound: null,
            peregrine: true
        };

        // Check domicile
        if (m.DOMICILE_RULERSHIPS[signIndex] === planet) {
            status.domicile = true;
            status.peregrine = false;
        }

        // Check exaltation
        const exalt = m.EXALTATIONS[planet];
        if (exalt && exalt.sign === signIndex) {
            status.exaltation = true;
            status.peregrine = false;
        }

        // Check detriment
        const detriment = m.DETRIMENTS[planet];
        if (Array.isArray(detriment)) {
            if (detriment.includes(signIndex)) {
                status.detriment = true;
            }
        } else if (detriment === signIndex) {
            status.detriment = true;
        }

        // Check fall
        if (m.FALLS[planet] === signIndex) {
            status.fall = true;
        }

        // Check triplicity
        for (const [element, data] of Object.entries(m.TRIPLICITY_RULERS)) {
            if (data.signs.includes(signIndex)) {
                if (data.day === planet) status.triplicity = 'day';
                else if (data.night === planet) status.triplicity = 'night';
                else if (data.participating === planet) status.triplicity = 'participating';
                if (status.triplicity) status.peregrine = false;
                break;
            }
        }

        // Check bound/term
        const boundRuler = m.getBoundRuler(signIndex, degree);
        if (boundRuler === planet) {
            status.bound = true;
            status.peregrine = false;
        }

        return status;
    }

    /**
     * Get triplicity rulers for a sign
     */
    async function getTriplicityRulers(signIndex) {
        const m = await ensureModules();

        for (const data of Object.values(m.TRIPLICITY_RULERS)) {
            if (data.signs.includes(signIndex)) {
                return data;
            }
        }
        return null;
    }

    /**
     * Calculate Lot of Fortune
     */
    function calculateLotOfFortune(positions, ascendant, isDayChart) {
        const sunLong = positions.Sun.longitude;
        const moonLong = positions.Moon.longitude;

        let lot = isDayChart
            ? ascendant + moonLong - sunLong
            : ascendant + sunLong - moonLong;

        return ((lot % 360) + 360) % 360;
    }

    /**
     * Calculate Lot of Spirit
     */
    function calculateLotOfSpirit(positions, ascendant, isDayChart) {
        const sunLong = positions.Sun.longitude;
        const moonLong = positions.Moon.longitude;

        let lot = isDayChart
            ? ascendant + sunLong - moonLong
            : ascendant + moonLong - sunLong;

        return ((lot % 360) + 360) % 360;
    }

    /**
     * Get house number for a longitude
     */
    function getHouseForLongitude(longitude, houseCusps) {
        for (let i = 0; i < 12; i++) {
            const cusp = houseCusps[i];
            const nextCusp = houseCusps[(i + 1) % 12];

            if (nextCusp > cusp) {
                if (longitude >= cusp && longitude < nextCusp) return i + 1;
            } else {
                if (longitude >= cusp || longitude < nextCusp) return i + 1;
            }
        }
        return 1;
    }

    /**
     * Format degree as string with sign
     */
    function formatDegree(longitude) {
        const signIndex = Math.floor(longitude / 30);
        const degree = Math.floor(longitude % 30);
        const minutes = Math.floor((longitude % 1) * 60);
        return `${degree}°${minutes}' ${SIGN_NAMES[signIndex]}`;
    }

    /**
     * Get ordinal suffix
     */
    function ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    return {
        // State
        isLoading,
        error,
        isModulesLoaded,

        // Methods
        ensureModules,
        geocodeLocation,
        calculateChart,
        getSignInfo,
        getDomicileRuler,
        getPlanetaryMotion,
        checkCombustion,
        getDignityStatus,
        getTriplicityRulers,
        calculateLotOfFortune,
        calculateLotOfSpirit,
        getHouseForLongitude,
        formatDegree,
        ordinal,

        // Constants
        SIGN_NAMES,
        PLANET_SYMBOLS,
        TRADITIONAL_PLANETS,
        DIURNAL_PLANETS,
        NOCTURNAL_PLANETS
    };
}

export default useAstroCalculations;
