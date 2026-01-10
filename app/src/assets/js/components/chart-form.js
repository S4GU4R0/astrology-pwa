/**
 * ChartForm Web Component
 * Form for manual chart input
 */
class ChartFormElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
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
                    width: 80px;
                    padding: 3px 6px;
                    background: var(--input-bg, #fff);
                    border: 1px solid var(--input-border, #a0a0a0);
                    color: var(--text-color, #000);
                    font-size: 13px;
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
                        width: 60px;
                        padding: 5px;
                        border-radius: 3px;
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
                <h3>Manual Chart</h3>
                <table>
                    <tr>
                        <td><label for="sun">Sun:</label></td>
                        <td><input type="number" id="sun" value="135" min="0" max="360"></td>
                        <td><label for="moon">Moon:</label></td>
                        <td><input type="number" id="moon" value="45" min="0" max="360"></td>
                    </tr>
                    <tr>
                        <td><label for="mercury">Mercury:</label></td>
                        <td><input type="number" id="mercury" value="120" min="0" max="360"></td>
                        <td><label for="venus">Venus:</label></td>
                        <td><input type="number" id="venus" value="180" min="0" max="360"></td>
                    </tr>
                    <tr>
                        <td><label for="mars">Mars:</label></td>
                        <td><input type="number" id="mars" value="300" min="0" max="360"></td>
                        <td><label for="jupiter">Jupiter:</label></td>
                        <td><input type="number" id="jupiter" value="90" min="0" max="360"></td>
                    </tr>
                    <tr>
                        <td><label for="saturn">Saturn:</label></td>
                        <td><input type="number" id="saturn" value="270" min="0" max="360"></td>
                        <td><label for="uranus">Uranus:</label></td>
                        <td><input type="number" id="uranus" value="60" min="0" max="360"></td>
                    </tr>
                    <tr>
                        <td><label for="neptune">Neptune:</label></td>
                        <td><input type="number" id="neptune" value="330" min="0" max="360"></td>
                        <td><label for="pluto">Pluto:</label></td>
                        <td><input type="number" id="pluto" value="240" min="0" max="360"></td>
                    </tr>
                    <tr>
                        <td><label for="ascendant">Ascendant:</label></td>
                        <td><input type="number" id="ascendant" value="0" min="0" max="360"></td>
                    </tr>
                </table>
                <button id="update-btn">Update Chart</button>
            </div>
        `;
    }

    attachEventListeners() {
        const updateBtn = this.shadowRoot.getElementById('update-btn');
        updateBtn.addEventListener('click', () => {
            this.dispatchUpdateEvent();
        });
    }

    dispatchUpdateEvent() {
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

        this.dispatchEvent(new CustomEvent('chart-update', {
            detail: { planets, ascendant },
            bubbles: true,
            composed: true
        }));
    }

    getChartData() {
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

        return { planets, ascendant };
    }
}

customElements.define('chart-form', ChartFormElement);
