<script setup>
/**
 * AppSidebar - Chart data input form
 * Uses Pinia store for reactive state management
 */

import { ref } from 'vue';
import { useChartStore } from '../../stores/chart';

defineProps({
    isMobileOpen: Boolean
});

const emit = defineEmits(['close']);
const chartStore = useChartStore();

// Calculation state
const isCalculating = ref(false);
const statusMessage = ref('');

async function calculateChart() {
    if (!chartStore.canCalculate) {
        statusMessage.value = 'Please fill in date, time, and location';
        return;
    }

    isCalculating.value = true;
    chartStore.isCalculating = true;
    statusMessage.value = 'Calculating...';

    try {
        // Dynamic import of calculation modules
        const [geocodingModule, astroModule] = await Promise.all([
            import('../../js/helpers/geocoding-service.js'),
            import('../../js/astro/astro-calculations.js')
        ]);

        const { GeocodingService } = geocodingModule;

        // Geocode location
        statusMessage.value = 'Geocoding location...';
        const geoResult = await GeocodingService.geocode(chartStore.location);

        // Calculate positions
        statusMessage.value = 'Calculating positions...';
        const dateTime = new Date(`${chartStore.date}T${chartStore.time}`);
        const positions = astroModule.calculatePlanetaryPositions(
            dateTime,
            geoResult.latitude,
            geoResult.longitude
        );
        const ascendant = astroModule.calculateAscendant(
            dateTime,
            geoResult.latitude,
            geoResult.longitude
        );
        const sect = astroModule.calculateSect(positions, ascendant);
        const houseCusps = astroModule.calculateHouseCusps(ascendant);

        // Calculate aspects
        const aspects = astroModule.calculateAllAspects
            ? astroModule.calculateAllAspects(positions, dateTime)
            : [];

        // Calculate motion/retrograde for each planet
        const motion = {};
        for (const planet of Object.keys(positions)) {
            try {
                motion[planet] = astroModule.calculatePlanetaryMotion(planet, dateTime);
            } catch (e) {
                motion[planet] = { direction: 'Direct' };
            }
        }

        // Store calculated data
        chartStore.setCalculatedData({
            positions,
            ascendant,
            sect,
            houseCusps,
            aspects,
            motion,
            dateTime,
            location: geoResult
        });

        statusMessage.value = `Calculated for ${geoResult.displayName || chartStore.location}`;

    } catch (error) {
        console.error('Calculation error:', error);
        statusMessage.value = `Error: ${error.message}`;
        chartStore.setError(error.message);
    } finally {
        isCalculating.value = false;
        chartStore.isCalculating = false;
    }
}
</script>

<template>
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chart Data
            </h2>
            <!-- Mobile close button -->
            <button
                v-if="isMobileOpen"
                class="md:hidden p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                @click="emit('close')"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Name -->
            <div>
                <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <input
                    v-model="chartStore.name"
                    type="text"
                    placeholder="Chart name"
                    class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                >
            </div>

            <!-- Date -->
            <div>
                <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Birth Date</label>
                <input
                    v-model="chartStore.date"
                    type="date"
                    class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                >
            </div>

            <!-- Time -->
            <div>
                <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Birth Time</label>
                <input
                    v-model="chartStore.time"
                    type="time"
                    class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                >
            </div>

            <!-- Location -->
            <div>
                <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                    v-model="chartStore.location"
                    type="text"
                    placeholder="City, Country"
                    class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                >
            </div>

            <!-- Calculate Button -->
            <button
                :disabled="!chartStore.canCalculate || isCalculating"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
                @click="calculateChart"
            >
                {{ isCalculating ? 'Calculating...' : 'Calculate Chart' }}
            </button>

            <!-- Status Message -->
            <p
                v-if="statusMessage"
                class="text-xs text-center"
                :class="{
                    'text-blue-500 dark:text-blue-400': !statusMessage.includes('Error'),
                    'text-red-500 dark:text-red-400': statusMessage.includes('Error')
                }"
            >
                {{ statusMessage }}
            </p>

            <!-- Calculated Data Summary -->
            <div
                v-if="chartStore.calculatedData"
                class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs space-y-1"
            >
                <p class="text-gray-500 dark:text-gray-400">
                    <span class="text-gray-700 dark:text-gray-300">Sect:</span>
                    {{ chartStore.calculatedData.sect }}
                </p>
                <p class="text-gray-500 dark:text-gray-400">
                    <span class="text-gray-700 dark:text-gray-300">Ascendant:</span>
                    {{ Math.floor(chartStore.calculatedData.ascendant) }}°
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
                class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                @click="chartStore.clear()"
            >
                Clear Data
            </button>
        </div>
    </aside>
</template>
