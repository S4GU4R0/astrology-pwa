<script setup>
/**
 * App.vue - Main Application Component
 * Provides the overall layout structure with header, sidebar, main content, and footer
 */

import { ref } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppFooter from './components/layout/AppFooter.vue';

// Mobile menu state
const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
    isMobileMenuOpen.value = false;
}
</script>

<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
        <!-- Header -->
        <AppHeader
            @toggle-menu="toggleMobileMenu"
            @close-menu="closeMobileMenu"
        />

        <!-- Main Layout -->
        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <AppSidebar
                :is-mobile-open="isMobileMenuOpen"
                @close="closeMobileMenu"
                class="hidden md:block"
            />

            <!-- Mobile Sidebar Overlay -->
            <Transition name="fade">
                <div
                    v-if="isMobileMenuOpen"
                    class="fixed inset-0 bg-black/50 z-40 md:hidden"
                    @click="closeMobileMenu"
                />
            </Transition>

            <!-- Mobile Sidebar -->
            <Transition name="slide">
                <AppSidebar
                    v-if="isMobileMenuOpen"
                    :is-mobile-open="true"
                    @close="closeMobileMenu"
                    class="fixed left-0 top-14 bottom-0 z-50 md:hidden"
                />
            </Transition>

            <!-- Main Content Area -->
            <main class="flex-1 overflow-auto p-4">
                <router-view v-slot="{ Component }">
                    <Transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </router-view>
            </main>
        </div>

        <!-- Footer -->
        <AppFooter />
    </div>
</template>

<style>
/* Transition styles */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}
</style>
