/**
 * useTheme Composable
 * Provides reactive theme management with dark/light mode toggle
 */

import { ref, computed, onMounted } from 'vue';

// Available themes
const THEMES = ['dark', 'light'];

// Reactive theme state (shared across all component instances)
const currentTheme = ref('dark');

// System preference
const systemPreference = typeof window !== 'undefined'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : 'dark';

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const stored = localStorage.getItem('usertheme');
    if (stored && THEMES.includes(stored)) {
        currentTheme.value = stored;
    } else {
        currentTheme.value = systemPreference;
    }
    applyTheme(currentTheme.value);
}

/**
 * Apply theme class to document
 */
function applyTheme(theme) {
    // Remove all theme classes
    document.documentElement.classList.remove(...THEMES);
    // Add current theme class
    document.documentElement.classList.add(theme);
}

/**
 * Main composable function
 */
export function useTheme() {
    // Computed properties
    const isDark = computed(() => currentTheme.value === 'dark');
    const isLight = computed(() => currentTheme.value === 'light');

    /**
     * Set theme by name
     */
    function setTheme(name) {
        if (!THEMES.includes(name)) return;

        currentTheme.value = name;
        localStorage.setItem('usertheme', name);
        applyTheme(name);
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    /**
     * Reset to system preference
     */
    function useSystemTheme() {
        localStorage.removeItem('usertheme');
        currentTheme.value = systemPreference;
        applyTheme(currentTheme.value);
    }

    // Initialize on first use
    onMounted(() => {
        // Only init if not already done
        if (!document.documentElement.classList.contains('dark') &&
            !document.documentElement.classList.contains('light')) {
            initTheme();
        }
    });

    return {
        // State
        currentTheme,
        isDark,
        isLight,
        systemPreference,

        // Methods
        setTheme,
        toggleTheme,
        useSystemTheme,
        initTheme
    };
}

// Export init function for use in main.js
export { initTheme };

export default useTheme;
