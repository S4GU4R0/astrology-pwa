<script setup>
/**
 * PlanetaryConditionsView
 * Displays planetary dignity worksheet with tab-based planet selection
 * Auto-calculates conditions from chart data
 */

import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '../stores/chart';
import { useAstroCalculations, TRADITIONAL_PLANETS, PLANET_SYMBOLS, SIGN_NAMES, DIURNAL_PLANETS, NOCTURNAL_PLANETS } from '../composables/useAstroCalculations';

const router = useRouter();
const chartStore = useChartStore();
const astro = useAstroCalculations();

// Selected planet tab
const selectedPlanet = ref('Sun');

// Planet data computed from chart
const planetData = ref({});

// Form state for manual adjustments
const formState = ref({
    domicile: 'none',
    exaltation: 'none',
    triplicity: 'none',
    term: 'none',
    face: 'none',
    detriment: false,
    fall: false,
    motion: 'direct',
    chartSect: 'day',
    planetSect: 'neutral',
    beneficAspects: [],
    maleficAspects: [],
    combustion: 'none',
    mutualReception: false,
    hayz: false,
    oriental: false,
    occidental: false,
    feral: false,
    besieged: false,
    notes: ''
});

// Planet info for cards
const planetInfo = {
    Sun: { name: 'The Sun', subtitle: 'Core Essence', description: 'The Sun represents your core identity, ego, and vital life force.', attributes: ['Ruler of Leo', 'Element: Fire', 'Diurnal planet'] },
    Moon: { name: 'The Moon', subtitle: 'Emotional Core', description: 'The Moon governs your emotional nature, instincts, and subconscious patterns.', attributes: ['Ruler of Cancer', 'Element: Water', 'Nocturnal planet'] },
    Mercury: { name: 'Mercury', subtitle: 'Communication', description: 'Mercury rules communication, intellect, and mental processes.', attributes: ['Ruler of Gemini/Virgo', 'Element: Air/Earth', 'Neutral sect'] },
    Venus: { name: 'Venus', subtitle: 'Love & Beauty', description: 'Venus governs love, beauty, harmony, and attraction.', attributes: ['Ruler of Taurus/Libra', 'Element: Earth/Air', 'Nocturnal planet'] },
    Mars: { name: 'Mars', subtitle: 'Action & Drive', description: 'Mars represents your drive, ambition, passion, and assertiveness.', attributes: ['Ruler of Aries/Scorpio', 'Element: Fire', 'Nocturnal planet'] },
    Jupiter: { name: 'Jupiter', subtitle: 'Expansion', description: 'Jupiter is the planet of expansion, growth, wisdom, and good fortune.', attributes: ['Ruler of Sagittarius/Pisces', 'Element: Fire', 'Diurnal planet'] },
    Saturn: { name: 'Saturn', subtitle: 'Structure', description: 'Saturn represents structure, discipline, responsibility, and life lessons.', attributes: ['Ruler of Capricorn/Aquarius', 'Element: Earth', 'Diurnal planet'] }
};

// Current planet's calculated data
const currentPlanetData = computed(() => {
    return planetData.value[selectedPlanet.value] || null;
});

// Essential dignity score
const essentialScore = computed(() => {
    let score = 0;
    if (formState.value.domicile === 'ruler') score += 5;
    if (formState.value.exaltation === 'exalted') score += 4;
    if (formState.value.triplicity !== 'none') score += 3;
    if (formState.value.term === 'term') score += 2;
    if (formState.value.face === 'face') score += 1;
    if (formState.value.detriment) score -= 5;
    if (formState.value.fall) score -= 4;
    return score;
});

// Accidental dignity score
const accidentalScore = computed(() => {
    let score = 0;

    // Motion
    if (formState.value.motion === 'direct') score += 4;
    else if (formState.value.motion === 'retrograde') score -= 5;

    // Sect
    if (formState.value.planetSect === 'in-sect') score += 3;
    else if (formState.value.planetSect === 'contrary') score -= 2;

    // Benefic aspects
    formState.value.beneficAspects.forEach(aspect => {
        if (aspect === 'conjunction') score += 5;
        else if (aspect === 'trine') score += 4;
        else if (aspect === 'sextile') score += 3;
    });

    // Malefic aspects
    formState.value.maleficAspects.forEach(aspect => {
        if (aspect === 'conjunction') score -= 5;
        else if (aspect === 'opposition') score -= 4;
        else if (aspect === 'square') score -= 3;
    });

    // Combustion
    if (formState.value.combustion === 'cazimi') score += 5;
    else if (formState.value.combustion === 'combust') score -= 5;
    else if (formState.value.combustion === 'under-beams') score -= 4;

    // Other conditions
    if (formState.value.mutualReception) score += 5;
    if (formState.value.hayz) score += 2;
    if (formState.value.besieged) score -= 5;

    return score;
});

// Overall score
const overallScore = computed(() => essentialScore.value + accidentalScore.value);

// Assessment text
const assessment = computed(() => {
    const score = overallScore.value;
    if (score >= 15) return 'Very Strong';
    if (score >= 10) return 'Strong';
    if (score >= 5) return 'Moderately Strong';
    if (score >= 0) return 'Neutral';
    if (score >= -5) return 'Weak';
    return 'Very Weak';
});

// Select a planet tab
function selectPlanet(planet) {
    selectedPlanet.value = planet;
    populateFormForPlanet(planet);
}

// Populate form from calculated data
function populateFormForPlanet(planet) {
    const data = planetData.value[planet];
    if (!data) return;

    // Reset form
    formState.value.domicile = data.dignities?.domicile ? 'ruler' : 'none';
    formState.value.exaltation = data.dignities?.exaltation ? 'exalted' : 'none';
    formState.value.detriment = data.dignities?.detriment || false;
    formState.value.fall = data.dignities?.fall || false;

    // Triplicity
    if (data.dignities?.triplicity === 'day') formState.value.triplicity = 'day-ruler';
    else if (data.dignities?.triplicity === 'night') formState.value.triplicity = 'night-ruler';
    else if (data.dignities?.triplicity === 'participating') formState.value.triplicity = 'participating';
    else formState.value.triplicity = 'none';

    // Term/Bound
    formState.value.term = data.dignities?.bound ? 'term' : 'none';

    // Motion
    if (data.motion?.direction === 'Retrograde') formState.value.motion = 'retrograde';
    else if (data.motion?.direction?.includes('Station')) formState.value.motion = 'stationary';
    else formState.value.motion = 'direct';

    // Sect
    const isDayChart = chartStore.calculatedData?.sect === 'Diurnal';
    formState.value.chartSect = isDayChart ? 'day' : 'night';

    if (planet === 'Mercury') {
        formState.value.planetSect = 'neutral';
    } else if ((isDayChart && DIURNAL_PLANETS.includes(planet)) || (!isDayChart && NOCTURNAL_PLANETS.includes(planet))) {
        formState.value.planetSect = 'in-sect';
    } else {
        formState.value.planetSect = 'contrary';
    }

    // Combustion
    if (data.combustion) {
        if (data.combustion.isCazimi) formState.value.combustion = 'cazimi';
        else if (data.combustion.isCombust) formState.value.combustion = 'combust';
        else if (data.combustion.isUnderBeams) formState.value.combustion = 'under-beams';
        else formState.value.combustion = 'none';
    } else {
        formState.value.combustion = 'none';
    }
}

// Calculate all planet data from chart
async function calculatePlanets() {
    if (!chartStore.calculatedData) return;

    const { positions, ascendant, sect, houseCusps } = chartStore.calculatedData;
    const isDayChart = sect === 'Diurnal';

    for (const planet of TRADITIONAL_PLANETS) {
        const pos = positions[planet];
        if (!pos) continue;

        const signInfo = await astro.getSignInfo(pos.longitude);
        const motion = await astro.getPlanetaryMotion(planet, chartStore.calculatedData.dateTime);
        const house = astro.getHouseForLongitude(pos.longitude, houseCusps);
        const dignities = await astro.getDignityStatus(planet, signInfo.signIndex, signInfo.degree);

        let combustion = null;
        if (planet !== 'Sun') {
            combustion = await astro.checkCombustion(pos.longitude, positions.Sun.longitude);
        }

        planetData.value[planet] = {
            longitude: pos.longitude,
            sign: signInfo.sign,
            signIndex: signInfo.signIndex,
            degree: signInfo.degree,
            formattedPosition: signInfo.formattedPosition,
            house,
            motion,
            combustion,
            dignities
        };
    }

    // Populate form for current planet
    populateFormForPlanet(selectedPlanet.value);
}

// Watch for chart data changes
watch(() => chartStore.calculatedData, (newData) => {
    if (newData) {
        calculatePlanets();
    }
}, { immediate: true });

onMounted(() => {
    if (chartStore.calculatedData) {
        calculatePlanets();
    }
});
</script>

<template>
    <div class="max-w-6xl mx-auto">
        <!-- Back Link -->
        <button
            class="text-blue-500 dark:text-blue-400 hover:underline text-sm mb-4"
            @click="router.push('/')"
        >
            ← Back to Chart
        </button>

        <!-- Chart Info Header -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ chartStore.name || 'Planetary Conditions' }}
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        <template v-if="chartStore.calculatedData">
                            {{ chartStore.formattedDateTime }} - {{ chartStore.location }}
                        </template>
                        <template v-else>
                            Enter chart data in the sidebar and click Calculate
                        </template>
                    </p>
                </div>
            </div>
        </div>

        <!-- No data message -->
        <div v-if="!chartStore.calculatedData" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <p class="text-gray-500 dark:text-gray-400">Calculate a chart first to analyze planetary conditions.</p>
        </div>

        <template v-else>
            <!-- Planet Tabs -->
            <div class="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    v-for="planet in TRADITIONAL_PLANETS"
                    :key="planet"
                    class="px-4 py-3 text-sm font-semibold transition-colors"
                    :class="selectedPlanet === planet
                        ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
                    @click="selectPlanet(planet)"
                >
                    <span class="mr-1">{{ PLANET_SYMBOLS[planet] }}</span>
                    {{ planet }}
                </button>
            </div>

            <!-- Planet Info Card -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Symbol -->
                    <div class="bg-gray-100 dark:bg-gray-700 rounded h-48 flex items-center justify-center">
                        <span class="text-7xl">{{ PLANET_SYMBOLS[selectedPlanet] }}</span>
                    </div>

                    <!-- Info -->
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            {{ planetInfo[selectedPlanet].name }}
                        </h3>
                        <h5 class="text-lg text-blue-500 dark:text-blue-400 mb-2">
                            {{ planetInfo[selectedPlanet].subtitle }}
                        </h5>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            {{ planetInfo[selectedPlanet].description }}
                        </p>

                        <!-- Calculated position -->
                        <div v-if="currentPlanetData" class="bg-gray-100 dark:bg-gray-600 rounded p-3 mt-4">
                            <p class="text-green-600 dark:text-green-400 font-semibold">
                                {{ currentPlanetData.sign }} {{ Math.floor(currentPlanetData.degree) }}°
                            </p>
                            <p class="text-gray-600 dark:text-gray-300 text-sm">
                                {{ astro.ordinal(currentPlanetData.house) }} House •
                                {{ currentPlanetData.motion?.direction || 'Direct' }}
                            </p>
                            <p v-if="currentPlanetData.combustion?.visibility && currentPlanetData.combustion.visibility !== 'Visible'" class="text-yellow-600 dark:text-yellow-400 text-sm">
                                {{ currentPlanetData.combustion.visibility }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Conditions Form -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Traditional planetary dignities and debilities (Demetra George's framework)
                </p>

                <div class="grid md:grid-cols-2 gap-8">
                    <!-- Essential Dignities -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Essential Dignities</h3>

                        <!-- Domicile -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Domicile (Rulership)</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.domicile" value="ruler" class="mr-2">
                                    Ruler (+5)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.domicile" value="none" class="mr-2">
                                    Not in Rulership (0)
                                </label>
                            </div>
                        </div>

                        <!-- Exaltation -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Exaltation</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.exaltation" value="exalted" class="mr-2">
                                    Exalted (+4)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.exaltation" value="none" class="mr-2">
                                    Not in Exaltation (0)
                                </label>
                            </div>
                        </div>

                        <!-- Triplicity -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Triplicity</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.triplicity" value="day-ruler" class="mr-2">
                                    Day Ruler (+3)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.triplicity" value="night-ruler" class="mr-2">
                                    Night Ruler (+3)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.triplicity" value="participating" class="mr-2">
                                    Participating (+3)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.triplicity" value="none" class="mr-2">
                                    None (0)
                                </label>
                            </div>
                        </div>

                        <!-- Term -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Term (Bound)</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.term" value="term" class="mr-2">
                                    In Own Term (+2)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.term" value="none" class="mr-2">
                                    Not in Term (0)
                                </label>
                            </div>
                        </div>

                        <!-- Debilities -->
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">Essential Debilities</h3>

                        <div class="mb-4">
                            <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                <input type="checkbox" v-model="formState.detriment" class="mr-2">
                                In Detriment (-5)
                            </label>
                        </div>

                        <div class="mb-4">
                            <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                <input type="checkbox" v-model="formState.fall" class="mr-2">
                                In Fall (-4)
                            </label>
                        </div>
                    </div>

                    <!-- Accidental Dignities -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Accidental Conditions</h3>

                        <!-- Motion -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Motion</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.motion" value="direct" class="mr-2">
                                    Direct (+4)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.motion" value="stationary" class="mr-2">
                                    Stationary (0)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.motion" value="retrograde" class="mr-2">
                                    Retrograde (-5)
                                </label>
                            </div>
                        </div>

                        <!-- Sect -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Sect Condition</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.planetSect" value="in-sect" class="mr-2">
                                    In Sect (+3)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.planetSect" value="contrary" class="mr-2">
                                    Contrary to Sect (-2)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.planetSect" value="neutral" class="mr-2">
                                    Neutral (0)
                                </label>
                            </div>
                        </div>

                        <!-- Combustion -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Solar Proximity</label>
                            <div class="space-y-1">
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.combustion" value="cazimi" class="mr-2">
                                    Cazimi (+5)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.combustion" value="combust" class="mr-2">
                                    Combust (-5)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.combustion" value="under-beams" class="mr-2">
                                    Under Beams (-4)
                                </label>
                                <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <input type="radio" v-model="formState.combustion" value="none" class="mr-2">
                                    Not Affected (0)
                                </label>
                            </div>
                        </div>

                        <!-- Additional -->
                        <div class="mb-4 space-y-2">
                            <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                <input type="checkbox" v-model="formState.mutualReception" class="mr-2">
                                Mutual Reception (+5)
                            </label>
                            <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                <input type="checkbox" v-model="formState.hayz" class="mr-2">
                                In Hayz (+2)
                            </label>
                            <label class="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                <input type="checkbox" v-model="formState.besieged" class="mr-2">
                                Besieged (-5)
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Score Summary -->
                <div class="bg-gray-100 dark:bg-gray-700 rounded p-4 mt-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dignity Score Summary</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-500 dark:text-gray-400 text-sm mb-1">Essential</label>
                            <div class="text-xl font-bold" :class="essentialScore >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                {{ essentialScore >= 0 ? '+' : '' }}{{ essentialScore }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-500 dark:text-gray-400 text-sm mb-1">Accidental</label>
                            <div class="text-xl font-bold" :class="accidentalScore >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                {{ accidentalScore >= 0 ? '+' : '' }}{{ accidentalScore }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-500 dark:text-gray-400 text-sm mb-1">Overall</label>
                            <div class="text-xl font-bold" :class="overallScore >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                {{ overallScore >= 0 ? '+' : '' }}{{ overallScore }}
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <span class="text-gray-500 dark:text-gray-400">Assessment:</span>
                        <span class="ml-2 font-semibold" :class="{
                            'text-green-600 dark:text-green-400': overallScore >= 10,
                            'text-blue-600 dark:text-blue-400': overallScore >= 0 && overallScore < 10,
                            'text-yellow-600 dark:text-yellow-400': overallScore < 0 && overallScore >= -5,
                            'text-red-600 dark:text-red-400': overallScore < -5
                        }">
                            {{ assessment }}
                        </span>
                    </div>
                </div>

                <!-- Notes -->
                <div class="mt-6">
                    <label class="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">Notes</label>
                    <textarea
                        v-model="formState.notes"
                        rows="3"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Additional observations..."
                    />
                </div>
            </div>
        </template>
    </div>
</template>
