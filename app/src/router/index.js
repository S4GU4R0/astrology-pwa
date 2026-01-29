/**
 * Vue Router Configuration
 * Replaces the manual ViewManager
 */

import { createRouter, createWebHistory } from 'vue-router';

// Lazy-load views for code splitting
const ChartView = () => import('../views/ChartView.vue');
const NatalReportView = () => import('../views/NatalReportView.vue');
const PlanetaryConditionsView = () => import('../views/PlanetaryConditionsView.vue');
const TestSuiteView = () => import('../views/TestSuiteView.vue');

const routes = [
    {
        path: '/',
        name: 'chart',
        component: ChartView,
        meta: { title: 'Chart' }
    },
    {
        path: '/natal-report',
        name: 'natal-report',
        component: NatalReportView,
        meta: { title: 'Natal Report' }
    },
    {
        path: '/planetary-conditions',
        name: 'planetary-conditions',
        component: PlanetaryConditionsView,
        meta: { title: 'Planetary Conditions' }
    },
    {
        path: '/test',
        name: 'test',
        component: TestSuiteView,
        meta: { title: 'Test Suite' }
    },
    // Catch-all redirect to chart
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Update document title on navigation
router.beforeEach((to, from, next) => {
    document.title = to.meta.title
        ? `${to.meta.title} | Lunar Ice`
        : 'Lunar Ice';
    next();
});

export default router;
