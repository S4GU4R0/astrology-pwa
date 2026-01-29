<script setup>
/**
 * AppFooter - Application footer with status bar
 */

import { useChartStore } from '../../stores/chart';

const chartStore = useChartStore();
</script>

<template>
    <footer class="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-8 flex items-center px-4 text-xs text-gray-500 dark:text-gray-400 shrink-0">
        <span v-if="chartStore.name">{{ chartStore.name }}</span>
        <span v-if="chartStore.name && chartStore.formattedDateTime" class="mx-2">|</span>
        <span v-if="chartStore.formattedDateTime">{{ chartStore.formattedDateTime }}</span>
        <span v-if="chartStore.formattedDateTime && chartStore.location" class="mx-2">|</span>
        <span v-if="chartStore.location">{{ chartStore.location }}</span>

        <div class="flex-1" />

        <span v-if="chartStore.calculatedData" class="text-green-600 dark:text-green-400">
            Chart Calculated
        </span>
        <span v-else-if="chartStore.canCalculate" class="text-yellow-600 dark:text-yellow-400">
            Ready to Calculate
        </span>
        <span v-else class="text-gray-400 dark:text-gray-500">
            Enter chart data
        </span>
    </footer>
</template>
