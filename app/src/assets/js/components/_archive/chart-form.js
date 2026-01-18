/**
 * ChartForm Web Component
 * Form for birth data and chart input
 */
import {
    calculatePlanetaryPositions,
    calculateAscendant,
    calculatePlanetaryMotion,
    calculateAllAspects
} from '../astro-calculations.js';

class ChartFormElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mode = 'birth'; // 'birth' or 'manual'
        this.calculatedData = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                :host(.active) {
                    display: block;
                }

                h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: var(--text-color, #000);
                }

                .tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 16px;
                }

                .tab {
                    padding: 6px 12px;
                    background: var(--menu-button-bg, #e0e0e0);
                    border: 1px solid var(--border-color, #c0c0c0);
                    color: var(--menu-button-text, #000);
                    cursor: pointer;
                    font-size: 12px;
                }

                .tab:hover {
                    background: var(--hover-bg, #d0d0d0);
                }

                .tab.active {
                    background: var(--active-bg, #0078d4);
                    color: #fff;
                    border-color: var(--active-bg, #0078d4);
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                table {
                    border-collapse: collapse;
                }

                td {
                    padding: 4px 8px 4px 0;
                }

                label {
                    display: inline;
                    margin: 0;
                    font-size: 13px;
                    color: var(--text-color, #000);
                }

                input {
                    padding: 3px 6px;
                    background: var(--input-bg, #fff);
                    border: 1px solid var(--input-border, #a0a0a0);
                    color: var(--text-color, #000);
                    font-size: 13px;
                }

                input[type="number"] {
                    width: 80px;
                }

                input[type="date"], input[type="time"] {
                    width: 140px;
                }

                input[type="text"] {
                    width: 180px;
                }

                .birth-inputs {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .birth-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .birth-row label {
                    min-width: 70px;
                }

                button {
                    margin-top: 16px;
                    padding: 5px 16px;
                    background: var(--menu-button-bg, #e0e0e0);
                    border: 1px solid var(--border-color, #c0c0c0);
                    color: var(--menu-button-text, #000);
                    cursor: pointer;
                    font-size: 13px;
                }

                button:hover {
                    background: var(--hover-bg, #e5e5e5);
                }

                button.primary {
                    background: var(--active-bg, #0078d4);
                    color: #fff;
                    border-color: var(--active-bg, #0078d4);
                }

                button.primary:hover {
                    background: #006cbd;
                }

                .status {
                    margin-top: 8px;
                    font-size: 12px;
                    color: var(--text-color, #666);
                }

                .status.error {
                    color: #d32f2f;
                }

                .status.success {
                    color: #388e3c;
                }

                /* Mobile styles */
                @media (max-width: 767px) {
                    :host {
                        max-width: 600px;
                        margin: 0 auto 100px;
                        padding: 20px;
                        display: none;
                    }

                    h3 {
                        margin-top: 0;
                        font-size: inherit;
                        font-weight: inherit;
                    }

                    label {
                        display: inline-block;
                        margin: 5px;
                    }

                    input {
                        padding: 5px;
                        border-radius: 3px;
                    }

                    input[type="number"] {
                        width: 60px;
                    }

                    button {
                        display: block;
                        margin: 20px auto 0;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                    }
                }

                /* Desktop styles */
                @media (min-width: 768px) {
                    :host {
                        max-width: none;
                        margin: 0;
                        padding: 0;
                        background: none;
                    }
                }
            </style>

            <div>
                <h3>Birth Chart</h3>

                <div class="tabs">
                    <button class="tab active" data-tab="birth">Birth Data</button>
                    <button class="tab" data-tab="manual">Manual Entry</button>
                </div>

                <!-- Birth Data Tab -->
                <div class="tab-content active" id="birth-tab">
                    <div class="birth-inputs">
                        <div class="birth-row">
                            <label for="birth-date">Date:</label>
                            <input type="date" id="birth-date" value="${dateStr}">
                        </div>
                        <div class="birth-row">
                            <label for="birth-time">Time:</label>
                            <input type="time" id="birth-time" value="${timeStr}">
                        </div>
                        <div class="birth-row">
                            <label for="latitude">Latitude:</label>
                            <input type="number" id="latitude" value="40.7128" step="0.0001" min="-90" max="90">
                        </div>
                        <div class="birth-row">
                            <label for="longitude">Longitude:</label>
                            <input type="number" id="longitude" value="-74.0060" step="0.0001" min="-180" max="180">
                        </div>
                    </div>
                    <button id="calculate-btn" class="primary">Calculate Chart</button>
                    <div class="status" id="calc-status"></div>
                </div>

                <!-- Manual Entry Tab -->
                <div class="tab-content" id="manual-tab">
                    <table>
                        <tr>
                            <td><label for="sun">Sun:</label></td>
                            <td><input type="number" id="sun" value="135" min="0" max="360" step="0.01"></td>
                            <td><label for="moon">Moon:</label></td>
                            <td><input type="number" id="moon" value="45" min="0" max="360" step="0.01"></td>
                        </tr>
                        <tr>
                            <td><label for="mercury">Mercury:</label></td>
                            <td><input type="number" id="mercury" value="120" min="0" max="360" step="0.01"></td>
                            <td><label for="venus">Venus:</label></td>
                            <td><input type="number" id="venus" value="180" min="0" max="360" step="0.01"></td>
                        </tr>
                        <tr>
                            <td><label for="mars">Mars:</label></td>
                            <td><input type="number" id="mars" value="300" min="0" max="360" step="0.01"></td>
                            <td><label for="jupiter">Jupiter:</label></td>
                            <td><input type="number" id="jupiter" value="90" min="0" max="360" step="0.01"></td>
                        </tr>
                        <tr>
                            <td><label for="saturn">Saturn:</label></td>
                            <td><input type="number" id="saturn" value="270" min="0" max="360" step="0.01"></td>
                            <td><label for="uranus">Uranus:</label></td>
                            <td><input type="number" id="uranus" value="60" min="0" max="360" step="0.01"></td>
                        </tr>
                        <tr>
                            <td><label for="neptune">Neptune:</label></td>
                            <td><input type="number" id="neptune" value="330" min="0" max="360" step="0.01"></td>
                            <td><label for="pluto">Pluto:</label></td>
                            <td><input type="number" id="pluto" value="240" min="0" max="360" step="0.01"></td>
                        </tr>
                        <tr>
                            <td><label for="ascendant">Ascendant:</label></td>
                            <td><input type="number" id="ascendant" value="0" min="0" max="360" step="0.01"></td>
                        </tr>
                    </table>
                    <button id="update-btn">Update Chart</button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Tab switching
        const tabs = this.shadowRoot.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Manual update button
        const updateBtn = this.shadowRoot.getElementById('update-btn');
        updateBtn.addEventListener('click', () => {
            this.dispatchManualUpdate();
        });

        // Calculate button
        const calculateBtn = this.shadowRoot.getElementById('calculate-btn');
        calculateBtn.addEventListener('click', () => {
            this.calculateFromBirthData();
        });
    }

    switchTab(tabId) {
        this.mode = tabId;

        // Update tab buttons
        this.shadowRoot.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabId);
        });

        // Update tab content
        this.shadowRoot.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        this.shadowRoot.getElementById(`${tabId}-tab`).classList.add('active');
    }

    calculateFromBirthData() {
        const statusEl = this.shadowRoot.getElementById('calc-status');

        try {
            // Get birth data
            const dateStr = this.shadowRoot.getElementById('birth-date').value;
            const timeStr = this.shadowRoot.getElementById('birth-time').value;
            const latitude = parseFloat(this.shadowRoot.getElementById('latitude').value);
            const longitude = parseFloat(this.shadowRoot.getElementById('longitude').value);

            if (!dateStr || !timeStr) {
                statusEl.textContent = 'Please enter date and time';
                statusEl.className = 'status error';
                return;
            }

            // Create date object
            const birthDate = new Date(`${dateStr}T${timeStr}`);

            statusEl.textContent = 'Calculating...';
            statusEl.className = 'status';

            // Check if Astronomy library is loaded
            if (typeof Astronomy === 'undefined') {
                statusEl.textContent = 'Astronomy library not loaded';
                statusEl.className = 'status error';
                return;
            }

            // Calculate positions
            const positions = calculatePlanetaryPositions(birthDate, latitude, longitude);
            const ascendant = calculateAscendant(birthDate, latitude, longitude);

            // Get motion data for each planet
            const planetMotion = {};
            for (const [name, data] of Object.entries(positions)) {
                try {
                    const motion = calculatePlanetaryMotion(name, birthDate);
                    planetMotion[name] = motion;
                } catch (e) {
                    planetMotion[name] = { direction: 'Direct', isRetrograde: false };
                }
            }

            // Calculate aspects
            const aspects = calculateAllAspects(positions, birthDate);

            // Format for chart component
            const planets = {
                sun: positions.Sun.longitude,
                moon: positions.Moon.longitude,
                mercury: positions.Mercury.longitude,
                venus: positions.Venus.longitude,
                mars: positions.Mars.longitude,
                jupiter: positions.Jupiter.longitude,
                saturn: positions.Saturn.longitude,
                uranus: 0, // Not calculated by traditional engine
                neptune: 0,
                pluto: 0
            };

            // Build retrograde map
            const retrograde = {
                sun: false,
                moon: false,
                mercury: planetMotion.Mercury?.direction === 'Retrograde',
                venus: planetMotion.Venus?.direction === 'Retrograde',
                mars: planetMotion.Mars?.direction === 'Retrograde',
                jupiter: planetMotion.Jupiter?.direction === 'Retrograde',
                saturn: planetMotion.Saturn?.direction === 'Retrograde',
                uranus: false,
                neptune: false,
                pluto: false
            };

            // Store calculated data
            this.calculatedData = {
                planets,
                ascendant,
                retrograde,
                aspects,
                birthDate,
                latitude,
                longitude
            };

            // Update manual fields to reflect calculated values
            this.updateManualFields(planets, ascendant);

            // Dispatch update event
            this.dispatchEvent(new CustomEvent('chart-update', {
                detail: {
                    planets,
                    ascendant,
                    retrograde,
                    aspects
                },
                bubbles: true,
                composed: true
            }));

            statusEl.textContent = `Chart calculated for ${birthDate.toLocaleDateString()} ${birthDate.toLocaleTimeString()}`;
            statusEl.className = 'status success';

        } catch (error) {
            console.error('Calculation error:', error);
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'status error';
        }
    }

    updateManualFields(planets, ascendant) {
        for (const [planet, longitude] of Object.entries(planets)) {
            const input = this.shadowRoot.getElementById(planet);
            if (input) {
                input.value = longitude.toFixed(2);
            }
        }
        const ascInput = this.shadowRoot.getElementById('ascendant');
        if (ascInput) {
            ascInput.value = ascendant.toFixed(2);
        }
    }

    dispatchManualUpdate() {
        const planets = {
            sun: parseFloat(this.shadowRoot.getElementById('sun').value),
            moon: parseFloat(this.shadowRoot.getElementById('moon').value),
            mercury: parseFloat(this.shadowRoot.getElementById('mercury').value),
            venus: parseFloat(this.shadowRoot.getElementById('venus').value),
            mars: parseFloat(this.shadowRoot.getElementById('mars').value),
            jupiter: parseFloat(this.shadowRoot.getElementById('jupiter').value),
            saturn: parseFloat(this.shadowRoot.getElementById('saturn').value),
            uranus: parseFloat(this.shadowRoot.getElementById('uranus').value),
            neptune: parseFloat(this.shadowRoot.getElementById('neptune').value),
            pluto: parseFloat(this.shadowRoot.getElementById('pluto').value)
        };

        const ascendant = parseFloat(this.shadowRoot.getElementById('ascendant').value);

        // Calculate aspects for manual entry too
        const positionsForAspects = {};
        for (const [name, lon] of Object.entries(planets)) {
            const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
            positionsForAspects[capitalName] = { longitude: lon };
        }

        let aspects = [];
        try {
            aspects = calculateAllAspects(positionsForAspects, new Date());
        } catch (e) {
            console.warn('Could not calculate aspects:', e);
        }

        this.dispatchEvent(new CustomEvent('chart-update', {
            detail: {
                planets,
                ascendant,
                retrograde: {},
                aspects
            },
            bubbles: true,
            composed: true
        }));
    }

    getChartData() {
        if (this.calculatedData) {
            return this.calculatedData;
        }

        const planets = {
            sun: parseFloat(this.shadowRoot.getElementById('sun').value),
            moon: parseFloat(this.shadowRoot.getElementById('moon').value),
            mercury: parseFloat(this.shadowRoot.getElementById('mercury').value),
            venus: parseFloat(this.shadowRoot.getElementById('venus').value),
            mars: parseFloat(this.shadowRoot.getElementById('mars').value),
            jupiter: parseFloat(this.shadowRoot.getElementById('jupiter').value),
            saturn: parseFloat(this.shadowRoot.getElementById('saturn').value),
            uranus: parseFloat(this.shadowRoot.getElementById('uranus').value),
            neptune: parseFloat(this.shadowRoot.getElementById('neptune').value),
            pluto: parseFloat(this.shadowRoot.getElementById('pluto').value)
        };

        const ascendant = parseFloat(this.shadowRoot.getElementById('ascendant').value);

        return { planets, ascendant, retrograde: {}, aspects: [] };
    }
}

customElements.define('chart-form', ChartFormElement);
