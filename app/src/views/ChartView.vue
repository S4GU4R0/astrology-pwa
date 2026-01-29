<script setup>
/**
 * ChartView - Main chart display
 * Renders the full astrological chart wheel with planets, houses, and aspects
 */

import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useChartStore } from '../stores/chart';
import { ChartRenderer } from '../js/astro/chart-renderer.js';

const chartStore = useChartStore();
const chartContainer = ref(null);

// Create a fresh renderer instance for this component
const renderer = new ChartRenderer();

const hasData = computed(() => !!chartStore.calculatedData);

// Render chart when data changes
async function renderChart() {
    if (!chartStore.calculatedData || !chartContainer.value) return;

    // Wait for DOM to be ready
    await nextTick();

    const { positions, ascendant, houseCusps, sect, aspects, motion } = chartStore.calculatedData;

    console.log('Rendering chart with ascendant:', ascendant);

    // Set up renderer with calculated data
    renderer.ascendant = ascendant;
    renderer.houseCusps = houseCusps;
    renderer.sect = sect;

    // Convert positions to lowercase keys
    renderer.planets = {};
    renderer.retrograde = {};

    for (const [name, data] of Object.entries(positions)) {
        const key = name.toLowerCase();
        renderer.planets[key] = data.longitude;
        // Check retrograde from motion data
        renderer.retrograde[key] = motion?.[name]?.direction === 'Retrograde';
    }

    // Get aspects if available
    renderer.aspects = aspects || [];

    // Render to container
    renderer.renderChart(chartContainer.value);
}

// Watch for chart data changes
watch(() => chartStore.calculatedData, () => {
    renderChart();
}, { immediate: true });

onMounted(() => {
    if (chartStore.calculatedData) {
        renderChart();
    }
});
</script>

<template>
    <div class="h-full flex items-center justify-center">
        <div class="chart-container relative w-full max-w-2xl aspect-square mx-auto">
            <!-- Chart renders here -->
            <div ref="chartContainer" class="w-full h-full">
                <!-- Placeholder when no data -->
                <svg v-if="!hasData" viewBox="0 0 600 600" class="w-full h-full">
                    <circle cx="300" cy="300" r="280" fill="none" stroke="#4B5563" stroke-width="2" />
                    <circle cx="300" cy="300" r="200" fill="none" stroke="#4B5563" stroke-width="2" />
                    <text x="300" y="300" text-anchor="middle" fill="#6B7280" font-size="14">
                        Enter chart data and calculate
                    </text>
                </svg>
            </div>
        </div>
    </div>
</template>
