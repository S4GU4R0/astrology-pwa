/**
 * Chart Renderer Module
 * Dynamically renders the astrological chart SVG
 * Based on the working astro-chart.js component
 */

import {
    calculatePlanetaryPositions,
    calculateAscendant,
    calculateHouseCusps,
    calculatePlanetaryMotion,
    calculateAllAspects,
    calculateSect,
    longitudeToSign
} from './astro-calculations.js';

class ChartRenderer {
    constructor() {
        // Chart data
        this.planets = {};
        this.ascendant = 0;
        this.retrograde = {};
        this.aspects = [];
        this.showAspects = true;
        this.houseCusps = [];
        this.sect = null;

        // Chart dimensions (matching astro-chart.js)
        this.centerX = 300;
        this.centerY = 300;
        this.outerRadius = 280;
        this.innerRadius = 200;
        this.planetRadius = 160;
    }

    /**
     * Convert polar (degree) to cartesian (x, y)
     * Ascendant is placed at left (9 o'clock), zodiac goes counter-clockwise
     */
    polarToCartesian(degree, radius) {
        const degreesFromAsc = degree - this.ascendant;
        const svgAngle = 180 + degreesFromAsc;
        const angleRad = svgAngle * Math.PI / 180;

        return {
            x: this.centerX + radius * Math.cos(angleRad),
            y: this.centerY - radius * Math.sin(angleRad)
        };
    }

    /**
     * Calculate chart from birth data
     */
    async calculateChart(date, time, latitude, longitude) {
        if (typeof Astronomy === 'undefined') {
            throw new Error('Astronomy library not loaded');
        }

        const birthDate = new Date(`${date}T${time}`);
        console.log('Calculating chart for:', birthDate, 'at', latitude, longitude);

        // Calculate planetary positions (returns { Sun: {longitude, ...}, Moon: {...}, ... })
        const positions = calculatePlanetaryPositions(birthDate, latitude, longitude);
        console.log('Planetary positions:', positions);

        // Calculate ascendant
        this.ascendant = calculateAscendant(birthDate, latitude, longitude);
        console.log('Ascendant:', this.ascendant, '(' + Math.floor(this.ascendant / 30) + ' sign, ' + (this.ascendant % 30).toFixed(1) + '°)');

        // Calculate house cusps
        this.houseCusps = calculateHouseCusps(this.ascendant);
        console.log('House cusps:', this.houseCusps);

        // Calculate sect
        this.sect = calculateSect(positions, this.ascendant);

        // Convert positions to lowercase keys for consistency
        this.planets = {};
        this.retrograde = {};

        for (const [name, data] of Object.entries(positions)) {
            const key = name.toLowerCase();
            this.planets[key] = data.longitude;

            // Check retrograde
            try {
                const motion = calculatePlanetaryMotion(name, birthDate);
                this.retrograde[key] = motion.direction === 'Retrograde';
            } catch (e) {
                this.retrograde[key] = false;
            }
        }

        // Calculate aspects
        this.aspects = calculateAllAspects(positions, birthDate);

        return {
            planets: this.planets,
            ascendant: this.ascendant,
            retrograde: this.retrograde,
            aspects: this.aspects,
            houseCusps: this.houseCusps,
            sect: this.sect
        };
    }

    /**
     * Render the chart as an SVG string
     */
    renderChart(container) {
        console.log('Rendering chart with ascendant:', this.ascendant);
        console.log('Planets to render:', this.planets);

        // Zodiac signs in order
        const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

        // Planet glyphs (lowercase keys)
        const planetGlyphs = {
            sun: '☉',
            moon: '☽',
            mercury: '☿',
            venus: '♀',
            mars: '♂',
            jupiter: '♃',
            saturn: '♄',
            uranus: '♅',
            neptune: '♆',
            pluto: '♇'
        };

        // Planet colors
        const planetColors = {
            sun: '#FBBF24',
            moon: '#9CA3AF',
            mercury: '#F97316',
            venus: '#EC4899',
            mars: '#EF4444',
            jupiter: '#A855F7',
            saturn: '#D97706',
            uranus: '#22D3EE',
            neptune: '#6366F1',
            pluto: '#78716C'
        };

        // Aspect colors
        const aspectColors = {
            'Conjunction': '#FBBF24',
            'Opposition': '#EF4444',
            'Trine': '#22C55E',
            'Square': '#EF4444',
            'Sextile': '#3B82F6'
        };

        // Start building SVG
        let svg = `<svg viewBox="0 0 600 600" class="w-full h-full">`;

        // Draw zodiac wheel circles
        svg += `<circle cx="${this.centerX}" cy="${this.centerY}" r="${this.outerRadius}" fill="none" stroke="#4B5563" stroke-width="2"/>`;
        svg += `<circle cx="${this.centerX}" cy="${this.centerY}" r="${this.innerRadius}" fill="none" stroke="#4B5563" stroke-width="2"/>`;

        // Draw zodiac sign divisions and glyphs
        const signColors = ['#F87171', '#34D399', '#FBBF24', '#60A5FA'];
        for (let i = 0; i < 12; i++) {
            const signDegree = i * 30;

            // Division line
            const lineStart = this.polarToCartesian(signDegree, this.innerRadius);
            const lineEnd = this.polarToCartesian(signDegree, this.outerRadius);
            svg += `<line x1="${lineStart.x}" y1="${lineStart.y}" x2="${lineEnd.x}" y2="${lineEnd.y}" stroke="#4B5563" stroke-width="1"/>`;

            // Sign glyph (at center of 30° arc)
            const signPos = this.polarToCartesian(signDegree + 15, (this.outerRadius + this.innerRadius) / 2);
            const color = signColors[i % 4];
            svg += `<text x="${signPos.x}" y="${signPos.y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="20">${signs[i]}</text>`;
        }

        // Draw house cusps and numbers
        for (let i = 0; i < 12; i++) {
            const cuspDegree = this.houseCusps[i] || (this.ascendant + i * 30) % 360;

            // House cusp line (from center to inner circle)
            const cuspStart = this.polarToCartesian(cuspDegree, 0);
            const cuspEnd = this.polarToCartesian(cuspDegree, this.innerRadius);
            const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
            svg += `<line x1="${cuspStart.x}" y1="${cuspStart.y}" x2="${cuspEnd.x}" y2="${cuspEnd.y}" stroke="${isAngular ? '#6B7280' : '#374151'}" stroke-width="${isAngular ? 2 : 1}"/>`;

            // House number (in middle of house)
            const nextCusp = this.houseCusps[(i + 1) % 12] || (this.ascendant + (i + 1) * 30) % 360;
            let midDegree = (cuspDegree + nextCusp) / 2;
            if (nextCusp < cuspDegree) {
                midDegree = ((cuspDegree + nextCusp + 360) / 2) % 360;
            }
            const housePos = this.polarToCartesian(midDegree, this.innerRadius - 35);
            svg += `<text x="${housePos.x}" y="${housePos.y}" text-anchor="middle" dominant-baseline="middle" fill="#6B7280" font-size="14">${i + 1}</text>`;
        }

        // Draw ASC marker and label
        const ascPos = this.polarToCartesian(this.ascendant, this.outerRadius + 20);
        svg += `<text x="${ascPos.x}" y="${ascPos.y}" text-anchor="middle" dominant-baseline="middle" fill="#9CA3AF" font-size="12" font-weight="bold">ASC</text>`;

        // Draw ascendant line (bold)
        const ascStart = this.polarToCartesian(this.ascendant, 0);
        const ascEnd = this.polarToCartesian(this.ascendant, this.outerRadius);
        svg += `<line x1="${ascStart.x}" y1="${ascStart.y}" x2="${ascEnd.x}" y2="${ascEnd.y}" stroke="#9CA3AF" stroke-width="3"/>`;

        // Draw aspect lines (behind planets)
        if (this.showAspects && this.aspects.length > 0) {
            const aspectRadius = this.planetRadius - 30;

            for (const aspect of this.aspects) {
                const planet1Key = aspect.planet1.toLowerCase();
                const planet2Key = aspect.planet2.toLowerCase();
                const lon1 = this.planets[planet1Key];
                const lon2 = this.planets[planet2Key];

                if (lon1 !== undefined && lon2 !== undefined) {
                    const pos1 = this.polarToCartesian(lon1, aspectRadius);
                    const pos2 = this.polarToCartesian(lon2, aspectRadius);
                    const color = aspectColors[aspect.aspectType] || '#6B7280';
                    const dashArray = aspect.aspectType === 'Sextile' ? '4,4' : '';
                    const opacity = aspect.isExact ? 0.9 : 0.5;

                    svg += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dashArray}" opacity="${opacity}"/>`;
                }
            }
        }

        // Draw planets
        for (const [planet, longitude] of Object.entries(this.planets)) {
            if (longitude === undefined) continue;

            const pos = this.polarToCartesian(longitude, this.planetRadius);
            const glyph = planetGlyphs[planet];
            const color = planetColors[planet] || '#9CA3AF';

            if (glyph) {
                // Planet circle
                svg += `<circle cx="${pos.x}" cy="${pos.y}" r="14" fill="${color}"/>`;
                // Planet glyph
                svg += `<text x="${pos.x}" y="${pos.y + 1}" text-anchor="middle" dominant-baseline="middle" fill="#1F2937" font-size="16" font-weight="bold">${glyph}</text>`;

                // Retrograde indicator
                if (this.retrograde[planet]) {
                    const rPos = this.polarToCartesian(longitude, this.planetRadius + 20);
                    svg += `<text x="${rPos.x}" y="${rPos.y}" text-anchor="middle" dominant-baseline="middle" fill="#EF4444" font-size="10" font-weight="bold">R</text>`;
                }

                // Degree label
                const signIndex = Math.floor(longitude / 30);
                const degInSign = Math.floor(longitude % 30);
                const signAbbrev = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];
                const degreePos = this.polarToCartesian(longitude, this.planetRadius - 25);
                svg += `<text x="${degreePos.x}" y="${degreePos.y}" text-anchor="middle" dominant-baseline="middle" fill="#9CA3AF" font-size="8">${degInSign}°${signAbbrev[signIndex]}</text>`;
            }
        }

        svg += '</svg>';

        // Update container
        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }

        if (container) {
            container.innerHTML = svg;
        }

        return svg;
    }

    /**
     * Update the planet list in sidebar
     */
    updatePlanetList() {
        const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        const PLANET_COLORS = {
            sun: '#FBBF24', moon: '#9CA3AF', mercury: '#F97316', venus: '#EC4899',
            mars: '#EF4444', jupiter: '#A855F7', saturn: '#D97706'
        };
        const PLANET_GLYPHS = {
            sun: '☉', moon: '☽', mercury: '☿', venus: '♀',
            mars: '♂', jupiter: '♃', saturn: '♄'
        };

        const planetListContainer = document.querySelector('.space-y-1.text-sm');
        if (!planetListContainer) return;

        let html = '';
        for (const [planet, longitude] of Object.entries(this.planets)) {
            if (!PLANET_GLYPHS[planet]) continue; // Skip outer planets

            const signIndex = Math.floor(longitude / 30);
            const degree = Math.floor(longitude % 30);
            const minutes = Math.floor((longitude % 1) * 60);
            const retroSymbol = this.retrograde[planet] ? ' ℞' : '';

            html += `
            <div class="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded cursor-pointer">
                <span style="color: ${PLANET_COLORS[planet]}">${PLANET_GLYPHS[planet]}</span>
                <span class="text-gray-300">${planet.charAt(0).toUpperCase() + planet.slice(1)}${retroSymbol}</span>
                <span class="text-gray-400 text-xs">${degree}° ${ZODIAC_SIGNS[signIndex]} ${minutes}'</span>
            </div>`;
        }

        planetListContainer.innerHTML = html;
    }

    /**
     * Update the house list in sidebar
     */
    updateHouseList() {
        const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        const houseGrid = document.querySelector('.grid.grid-cols-3');
        if (!houseGrid) return;

        let html = '';
        const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

        for (let i = 0; i < 12; i++) {
            const cusp = this.houseCusps[i] || (this.ascendant + i * 30) % 360;
            const signIndex = Math.floor(cusp / 30);
            const degree = Math.floor(cusp % 30);

            html += `
            <div class="bg-gray-700 p-1.5 rounded text-center">
                <span class="text-gray-500">${ordinals[i]}</span>
                <div class="text-gray-300">${degree}° ${ZODIAC_SIGNS[signIndex]}</div>
            </div>`;
        }

        houseGrid.innerHTML = html;
    }

    /**
     * Get chart data
     */
    getChartData() {
        return {
            planets: this.planets,
            ascendant: this.ascendant,
            retrograde: this.retrograde,
            aspects: this.aspects,
            houseCusps: this.houseCusps,
            sect: this.sect
        };
    }

    /**
     * Toggle aspect visibility
     */
    toggleAspects() {
        this.showAspects = !this.showAspects;
        return this.showAspects;
    }
}

// Singleton instance
const chartRenderer = new ChartRenderer();

export { ChartRenderer, chartRenderer };
export default chartRenderer;
