/**
 * Chart Data Management
 * Handles saving/loading chart data to localStorage
 */

const STORAGE_KEY = 'astrodex_chart_data';

export const ChartData = {
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving chart data:', error);
        }
    },

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading chart data:', error);
            return null;
        }
    },

    getCurrentData() {
        return {
            name: document.getElementById('chartName')?.value || '',
            date: document.getElementById('chartDate')?.value || '',
            time: document.getElementById('chartTime')?.value || '',
            location: document.getElementById('chartLocation')?.value || ''
        };
    },

    setFormData(data) {
        if (document.getElementById('chartName')) document.getElementById('chartName').value = data.name || '';
        if (document.getElementById('chartDate')) document.getElementById('chartDate').value = data.date || '';
        if (document.getElementById('chartTime')) document.getElementById('chartTime').value = data.time || '';
        if (document.getElementById('chartLocation')) document.getElementById('chartLocation').value = data.location || '';
    }
};

// Also expose on window for legacy components
window.ChartData = ChartData;

export default ChartData;
