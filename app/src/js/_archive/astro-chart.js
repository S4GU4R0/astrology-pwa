/**
 * AstroChart Web Component
 * Renders an astrological chart as an SVG
 */
class AstroChartElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Default values
        this.planets = {
            sun: 135,
            moon: 45,
            mercury: 120,
            venus: 180,
            mars: 300,
            jupiter: 90,
            saturn: 270,
            uranus: 60,
            neptune: 330,
            pluto: 240
        };
        this.ascendant = 0;
        this.retrograde = {};
        this.aspects = [];
        this.showAspects = true;
    }

    connectedCallback() {
        this.render();
        this.drawChart();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    max-width: 600px;
                }

                svg {
                    width: 100%;
                    height: auto;
                }
            </style>
            <svg viewBox="0 0 600 600"></svg>
        `;
    }

    setPlanets(planets) {
        this.planets = planets;
        this.drawChart();
    }

    setAscendant(ascendant) {
        this.ascendant = ascendant;
        this.drawChart();
    }

    setRetrograde(retrograde) {
        this.retrograde = retrograde || {};
        this.drawChart();
    }

    setAspects(aspects) {
        this.aspects = aspects || [];
        this.drawChart();
    }

    toggleAspects(show) {
        this.showAspects = show;
        this.drawChart();
    }

    setChartData(data) {
        this.planets = data.planets || this.planets;
        this.ascendant = data.ascendant !== undefined ? data.ascendant : this.ascendant;
        this.retrograde = data.retrograde || {};
        this.aspects = data.aspects || [];
        this.drawChart();
    }

    drawChart() {
        const svg = this.shadowRoot.querySelector('svg');

        // Clear existing chart
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Chart dimensions
        const centerX = 300;
        const centerY = 300;
        const outerRadius = 280;
        const innerRadius = 200;
        const planetRadius = 160;

        // Zodiac signs
        const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

        // Planet glyphs
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

        // Detect color scheme
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const colors = {
            line: isDarkMode ? '#999' : '#333',
            text: isDarkMode ? '#e0e0e0' : '#000',
            houseText: isDarkMode ? '#aaa' : '#666',
            houseLine: isDarkMode ? '#777' : '#666',
            planetBg: isDarkMode ? '#2a2a2a' : '#fff',
            planetBorder: isDarkMode ? '#e0e0e0' : '#000'
        };

        // Helper function: polar to cartesian
        const polarToCartesian = (degree, radius) => {
            const degreesFromAsc = degree - this.ascendant;
            const svgAngle = 180 + degreesFromAsc;
            const angleRad = svgAngle * Math.PI / 180;

            return {
                x: centerX + radius * Math.cos(angleRad),
                y: centerY - radius * Math.sin(angleRad)
            };
        };

        // Helper function: draw circle
        const drawCircle = (cx, cy, r, fill, stroke, strokeWidth) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', fill);
            circle.setAttribute('stroke', stroke);
            circle.setAttribute('stroke-width', strokeWidth);
            svg.appendChild(circle);
        };

        // Helper function: draw line
        const drawLine = (x1, y1, x2, y2, stroke, strokeWidth) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', stroke);
            line.setAttribute('stroke-width', strokeWidth);
            svg.appendChild(line);
        };

        // Helper function: draw text
        const drawText = (text, x, y, font, fill, weight = 'normal') => {
            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('x', x);
            textEl.setAttribute('y', y);
            textEl.setAttribute('text-anchor', 'middle');
            textEl.setAttribute('dominant-baseline', 'middle');
            textEl.setAttribute('font-family', font.split(' ')[1]);
            textEl.setAttribute('font-size', font.split(' ')[0]);
            textEl.setAttribute('fill', fill);
            textEl.setAttribute('font-weight', weight);
            textEl.textContent = text;
            svg.appendChild(textEl);
        };

        // Draw zodiac wheel
        drawCircle(centerX, centerY, outerRadius, 'none', colors.line, 2);
        drawCircle(centerX, centerY, innerRadius, 'none', colors.line, 2);

        for (let i = 0; i < 12; i++) {
            const signDegree = i * 30;
            const lineStart = polarToCartesian(signDegree, innerRadius);
            const lineEnd = polarToCartesian(signDegree, outerRadius);
            drawLine(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, colors.line, 1);

            const signPos = polarToCartesian(signDegree + 15, (outerRadius + innerRadius) / 2);
            drawText(signs[i], signPos.x, signPos.y, '24px serif', colors.text);
        }

        // Draw houses
        const ascSign = Math.floor(this.ascendant / 30);

        for (let i = 0; i < 12; i++) {
            const houseNum = i + 1;
            const signIndex = (ascSign + i) % 12;
            const cuspDegree = signIndex * 30;

            const cuspInner = polarToCartesian(cuspDegree, 0);
            const cuspOuter = polarToCartesian(cuspDegree, innerRadius);
            drawLine(cuspInner.x, cuspInner.y, cuspOuter.x, cuspOuter.y, colors.houseLine, 1.5);

            const housePos = polarToCartesian(cuspDegree + 15, innerRadius - 30);
            drawText(houseNum.toString(), housePos.x, housePos.y, '16px sans-serif', colors.houseText);
        }

        // Draw ascendant marker
        const ascPos = polarToCartesian(this.ascendant, outerRadius + 20);
        drawText('ASC', ascPos.x, ascPos.y, '14px sans-serif', colors.text, 'bold');

        const ascInner = polarToCartesian(this.ascendant, 0);
        const ascOuter = polarToCartesian(this.ascendant, outerRadius);
        drawLine(ascInner.x, ascInner.y, ascOuter.x, ascOuter.y, colors.text, 2);

        // Draw aspect lines first (so they appear behind planets)
        if (this.showAspects && this.aspects && this.aspects.length > 0) {
            const aspectRadius = planetRadius - 30; // Draw aspects inside the planet ring

            // Aspect colors
            const aspectColors = {
                'Conjunction': isDarkMode ? '#ffeb3b' : '#f9a825', // Yellow/gold
                'Opposition': isDarkMode ? '#ef5350' : '#c62828', // Red
                'Trine': isDarkMode ? '#66bb6a' : '#2e7d32', // Green
                'Square': isDarkMode ? '#ef5350' : '#c62828', // Red
                'Sextile': isDarkMode ? '#42a5f5' : '#1565c0' // Blue
            };

            // Aspect line styles
            const aspectStyles = {
                'Conjunction': { width: 2, dash: '' },
                'Opposition': { width: 1.5, dash: '' },
                'Trine': { width: 1.5, dash: '' },
                'Square': { width: 1.5, dash: '' },
                'Sextile': { width: 1, dash: '4,4' }
            };

            for (const aspect of this.aspects) {
                // Find planet longitudes
                const planet1Key = aspect.planet1.toLowerCase();
                const planet2Key = aspect.planet2.toLowerCase();
                const lon1 = this.planets[planet1Key];
                const lon2 = this.planets[planet2Key];

                if (lon1 !== undefined && lon2 !== undefined) {
                    const pos1 = polarToCartesian(lon1, aspectRadius);
                    const pos2 = polarToCartesian(lon2, aspectRadius);

                    const color = aspectColors[aspect.aspectType] || colors.line;
                    const style = aspectStyles[aspect.aspectType] || { width: 1, dash: '' };

                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', pos1.x);
                    line.setAttribute('y1', pos1.y);
                    line.setAttribute('x2', pos2.x);
                    line.setAttribute('y2', pos2.y);
                    line.setAttribute('stroke', color);
                    line.setAttribute('stroke-width', style.width);
                    line.setAttribute('opacity', aspect.isExact ? 1 : 0.6);
                    if (style.dash) {
                        line.setAttribute('stroke-dasharray', style.dash);
                    }
                    svg.appendChild(line);
                }
            }
        }

        // Draw planets
        for (let [planet, longitude] of Object.entries(this.planets)) {
            const pos = polarToCartesian(longitude, planetRadius);
            const glyph = planetGlyphs[planet];

            if (glyph) {
                drawCircle(pos.x, pos.y, 12, colors.planetBg, colors.planetBorder, 1);
                drawText(glyph, pos.x, pos.y, '20px serif', colors.text);

                // Draw retrograde indicator
                if (this.retrograde && this.retrograde[planet]) {
                    // Draw small 'R' below the planet
                    const retroPos = polarToCartesian(longitude, planetRadius + 18);
                    drawText('R', retroPos.x, retroPos.y, '10px sans-serif', isDarkMode ? '#ff8a80' : '#d32f2f', 'bold');
                }
            }
        }

        // Draw degree markers on planets (small text showing position)
        for (let [planet, longitude] of Object.entries(this.planets)) {
            if (longitude === 0 && planet !== 'sun') continue; // Skip unset planets

            const degreePos = polarToCartesian(longitude, planetRadius - 22);
            const signIndex = Math.floor(longitude / 30);
            const degInSign = Math.floor(longitude % 30);
            const signs = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];
            const degreeText = `${degInSign}${signs[signIndex]}`;
            drawText(degreeText, degreePos.x, degreePos.y, '8px sans-serif', colors.houseText);
        }
    }
}

customElements.define('astro-chart', AstroChartElement);
