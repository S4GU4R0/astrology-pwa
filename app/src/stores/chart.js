/**
 * Chart Data Store (Pinia)
 * Central reactive state for chart data - replaces manual ChartData module
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'lunarIce_chartData';

export const useChartStore = defineStore('chart', () => {
    // Form input state
    const name = ref('');
    const date = ref('');
    const time = ref('');
    const location = ref('');

    // Calculated chart data (populated after calculation)
    const calculatedData = ref(null);
    const isCalculating = ref(false);
    const lastError = ref(null);

    // Computed: check if we have enough data to calculate
    const canCalculate = computed(() => {
        return date.value && time.value && location.value;
    });

    // Computed: formatted date/time for display
    const formattedDateTime = computed(() => {
        if (!date.value || !time.value) return '';
        try {
            const dt = new Date(`${date.value}T${time.value}`);
            return dt.toLocaleString();
        } catch {
            return `${date.value} ${time.value}`;
        }
    });

    // Computed: current form data as object
    const formData = computed(() => ({
        name: name.value,
        date: date.value,
        time: time.value,
        location: location.value
    }));

    /**
     * Load saved data from localStorage
     */
    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                name.value = data.name || '';
                date.value = data.date || '';
                time.value = data.time || '';
                location.value = data.location || '';
            }
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    }

    /**
     * Save current data to localStorage
     */
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData.value));
        } catch (error) {
            console.error('Failed to save chart data:', error);
        }
    }

    /**
     * Clear all data
     */
    function clear() {
        name.value = '';
        date.value = '';
        time.value = '';
        location.value = '';
        calculatedData.value = null;
        lastError.value = null;
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Set calculated data after chart computation
     */
    function setCalculatedData(data) {
        calculatedData.value = data;
        lastError.value = null;
    }

    /**
     * Set error state
     */
    function setError(error) {
        lastError.value = error;
        isCalculating.value = false;
    }

    // Auto-save when form data changes
    watch([name, date, time, location], () => {
        save();
    }, { debounce: 500 });

    // Load on store creation
    load();

    return {
        // State
        name,
        date,
        time,
        location,
        calculatedData,
        isCalculating,
        lastError,

        // Computed
        canCalculate,
        formattedDateTime,
        formData,

        // Actions
        load,
        save,
        clear,
        setCalculatedData,
        setError
    };
});
