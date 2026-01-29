<script setup>
/**
 * NatalReportView - Hellenistic natal astrology report generator
 *
 * This demonstrates the Vue conversion pattern:
 * - Chart data comes from Pinia store (reactive, auto-synced)
 * - Form sections are child components
 * - Calculated data is computed from store
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '../stores/chart';

const router = useRouter();
const chartStore = useChartStore();

// Local form state (report-specific fields not in chart store)
const reportMode = ref(false);
const synthesis = ref('');

// Computed values from calculated chart data
const sectInfo = computed(() => {
    if (!chartStore.calculatedData) return null;

    const { sect, positions, ascendant } = chartStore.calculatedData;
    const isDayChart = sect === 'Diurnal';

    return {
        sect,
        isDayChart,
        sectLight: isDayChart ? 'Sun' : 'Moon',
        inSect: isDayChart ? ['Sun', 'Jupiter', 'Saturn'] : ['Moon', 'Venus', 'Mars'],
        contrarySect: isDayChart ? ['Moon', 'Venus', 'Mars'] : ['Sun', 'Jupiter', 'Saturn']
    };
});

const ascendantInfo = computed(() => {
    if (!chartStore.calculatedData) return null;

    const { ascendant } = chartStore.calculatedData;
    const signIndex = Math.floor(ascendant / 30);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const rulers = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
                    'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

    return {
        sign: signs[signIndex],
        degree: Math.floor(ascendant % 30),
        ruler: rulers[signIndex]
    };
});

const planetaryConditions = computed(() => {
    if (!chartStore.calculatedData) return [];

    const { positions, houseCusps } = chartStore.calculatedData;
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    return planets.map(planet => {
        const pos = positions[planet];
        if (!pos) return null;

        const signIndex = Math.floor(pos.longitude / 30);
        const degree = Math.floor(pos.longitude % 30);
        const house = getHouseForLongitude(pos.longitude, houseCusps);

        return {
            planet,
            sign: signs[signIndex],
            degree,
            house,
            signIndex
        };
    }).filter(Boolean);
});

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

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function generateReport() {
    reportMode.value = true;
}

function backToForm() {
    reportMode.value = false;
}

function printReport() {
    window.print();
}
</script>

<template>
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
            <button
                class="text-blue-500 dark:text-blue-400 hover:underline text-sm mb-4"
                @click="router.push('/')"
            >
                ← Back to Chart
            </button>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white text-center border-b-2 border-gray-300 dark:border-gray-600 pb-4">
                NATAL CHART REPORT
            </h1>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap justify-center gap-3 py-4 border-y-2 border-gray-300 dark:border-gray-600 mb-4">
            <template v-if="reportMode">
                <button
                    class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm"
                    @click="backToForm"
                >
                    Back to Form
                </button>
                <button
                    class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm"
                    @click="printReport"
                >
                    Print Report
                </button>
            </template>
            <template v-else>
                <button
                    class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm"
                    @click="generateReport"
                >
                    Generate Report
                </button>
            </template>
        </div>

        <!-- Client Info - Automatically synced from store! -->
        <table class="w-full mb-6">
            <tbody>
                <tr>
                    <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 w-1/3 border border-gray-300 dark:border-gray-600">Client Name:</td>
                    <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                        {{ chartStore.name || '—' }}
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Birth Date & Time:</td>
                    <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                        {{ chartStore.formattedDateTime || '—' }}
                    </td>
                </tr>
                <tr>
                    <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Birth Location:</td>
                    <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                        {{ chartStore.location || '—' }}
                    </td>
                </tr>
            </tbody>
        </table>
        <p class="text-xs text-gray-500 mb-6">
            Chart data syncs automatically from the sidebar.
        </p>

        <!-- No calculated data message -->
        <div
            v-if="!chartStore.calculatedData"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-8 text-center"
        >
            <p class="text-gray-500 dark:text-gray-400 mb-4">
                No chart data calculated yet.
            </p>
            <p class="text-sm text-gray-500">
                Enter birth data in the sidebar and click "Calculate Chart" to populate this report.
            </p>
        </div>

        <!-- Calculated sections -->
        <template v-else>
            <!-- I. Foundational Analysis -->
            <section class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
                    I. FOUNDATIONAL CHART ANALYSIS
                </h2>

                <!-- Sect -->
                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-6 mb-3">A. Sect Determination</h3>
                <table class="w-full mb-6">
                    <tbody>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 w-1/3 border border-gray-300 dark:border-gray-600">Chart Sect:</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ sectInfo?.isDayChart ? 'Day (Sun above horizon)' : 'Night (Sun below horizon)' }}
                            </td>
                        </tr>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Sect Light:</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ sectInfo?.sectLight }}
                            </td>
                        </tr>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Planets in Sect:</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ sectInfo?.inSect.join(', ') }}
                            </td>
                        </tr>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Planets Contrary to Sect:</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ sectInfo?.contrarySect.join(', ') }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Ascendant -->
                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-6 mb-3">B. Chart Ruler & Rising Sign</h3>
                <table class="w-full mb-6">
                    <tbody>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 w-1/3 border border-gray-300 dark:border-gray-600">Ascending Sign:</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ ascendantInfo?.sign }} {{ ascendantInfo?.degree }}°
                            </td>
                        </tr>
                        <tr>
                            <td class="bg-gray-200 dark:bg-gray-700 font-semibold p-3 border border-gray-300 dark:border-gray-600">Chart Ruler (Domicile Lord):</td>
                            <td class="p-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                                {{ ascendantInfo?.ruler }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- III. Planetary Conditions -->
            <section class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
                    III. PLANETARY CONDITIONS
                </h2>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr>
                                <th class="bg-gray-200 dark:bg-gray-700 p-2 text-left border border-gray-300 dark:border-gray-600">Planet</th>
                                <th class="bg-gray-200 dark:bg-gray-700 p-2 text-left border border-gray-300 dark:border-gray-600">Sign</th>
                                <th class="bg-gray-200 dark:bg-gray-700 p-2 text-left border border-gray-300 dark:border-gray-600">Degree</th>
                                <th class="bg-gray-200 dark:bg-gray-700 p-2 text-left border border-gray-300 dark:border-gray-600">House</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="planet in planetaryConditions" :key="planet.planet">
                                <td class="p-2 border border-gray-300 dark:border-gray-600 font-semibold">{{ planet.planet }}</td>
                                <td class="p-2 border border-gray-300 dark:border-gray-600">{{ planet.sign }}</td>
                                <td class="p-2 border border-gray-300 dark:border-gray-600">{{ planet.degree }}°</td>
                                <td class="p-2 border border-gray-300 dark:border-gray-600">{{ ordinal(planet.house) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- IV. Synthesis -->
            <section class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
                    IV. SYNTHESIS & INTERPRETATION
                </h2>

                <textarea
                    v-model="synthesis"
                    rows="8"
                    class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                    :class="{ 'bg-transparent dark:bg-transparent border-none': reportMode }"
                    placeholder="Enter your synthesis and interpretation..."
                />
            </section>
        </template>

        <!-- Footer -->
        <div class="text-center text-gray-500 italic py-8">
            — End of Report —
        </div>
    </div>
</template>
