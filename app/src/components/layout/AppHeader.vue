<script setup>
/**
 * AppHeader - Main application header with navigation
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const emit = defineEmits(['toggle-menu', 'close-menu']);
const router = useRouter();

// Theme management
const { isDark, toggleTheme } = useTheme();

// Dropdown menu state
const activeDropdown = ref(null);

function toggleDropdown(menu) {
    activeDropdown.value = activeDropdown.value === menu ? null : menu;
}

function closeDropdowns() {
    activeDropdown.value = null;
}

function navigateTo(route) {
    router.push(route);
    closeDropdowns();
    emit('close-menu');
}

// Close dropdowns when clicking outside
function handleClickOutside(event) {
    if (!event.target.closest('.dropdown-container')) {
        closeDropdowns();
    }
}
</script>

<template>
    <header
        class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-14 flex items-center px-4 shrink-0"
        @click="handleClickOutside"
    >
        <!-- Mobile menu button -->
        <button
            class="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-2"
            @click="emit('toggle-menu')"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <!-- Logo -->
        <router-link to="/" class="text-xl font-bold text-gray-900 dark:text-white mr-8">
            Lunar Ice
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
            <!-- File Menu -->
            <div class="dropdown-container relative">
                <button
                    class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    @click.stop="toggleDropdown('file')"
                >
                    File
                </button>
                <div
                    v-if="activeDropdown === 'file'"
                    class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-40 z-50"
                >
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        New Chart
                    </button>
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Open...
                    </button>
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Save
                    </button>
                    <hr class="border-gray-200 dark:border-gray-700 my-1">
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Export...
                    </button>
                </div>
            </div>

            <!-- View Menu -->
            <div class="dropdown-container relative">
                <button
                    class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    @click.stop="toggleDropdown('view')"
                >
                    View
                </button>
                <div
                    v-if="activeDropdown === 'view'"
                    class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-40 z-50"
                >
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="navigateTo('/')"
                    >
                        Chart
                    </button>
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="navigateTo('/planetary-conditions')"
                    >
                        Planetary Conditions
                    </button>
                </div>
            </div>

            <!-- Tools Menu -->
            <div class="dropdown-container relative">
                <button
                    class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    @click.stop="toggleDropdown('tools')"
                >
                    Tools
                </button>
                <div
                    v-if="activeDropdown === 'tools'"
                    class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-40 z-50"
                >
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="navigateTo('/natal-report')"
                    >
                        Natal Report
                    </button>
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="navigateTo('/test')"
                    >
                        Test Suite
                    </button>
                </div>
            </div>

            <!-- Help Menu -->
            <div class="dropdown-container relative">
                <button
                    class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    @click.stop="toggleDropdown('help')"
                >
                    Help
                </button>
                <div
                    v-if="activeDropdown === 'help'"
                    class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-40 z-50"
                >
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Documentation
                    </button>
                    <button class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        About
                    </button>
                </div>
            </div>
        </nav>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Theme toggle -->
        <button
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            @click="toggleTheme"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
            <!-- Moon icon (shown in dark mode) -->
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <!-- Sun icon (shown in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </button>
    </header>
</template>
