<script setup>
/**
 * TestSuiteView - Testing utilities
 * Placeholder - to be fully implemented
 */

import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="max-w-4xl mx-auto">
        <button
            class="text-blue-400 hover:underline text-sm mb-4"
            @click="router.push('/')"
        >
            ← Back to Chart
        </button>

        <h1 class="text-2xl font-bold text-white mb-6">Test Suite</h1>

        <div class="bg-gray-800 rounded p-6">
            <p class="text-gray-400">
                Test utilities and debugging tools will be available here.
            </p>
        </div>
    </div>
</template>
