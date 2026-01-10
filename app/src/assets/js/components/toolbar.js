/**
 * Toolbar Web Component
 * Desktop toolbar with action buttons
 */
class ToolbarElement extends HTMLElement {
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
                    display: none;
                }

                @media (min-width: 768px) {
                    :host {
                        display: flex;
                        align-items: center;
                        background: #374151;
                        border-top: 1px solid #374151;
                        padding: 4px 8px;
                        gap: 8px;
                    }
                }

                .toolbar-button {
                    padding: 6px;
                    color: #9ca3af;
                    background: none;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toolbar-button:hover {
                    color: #e5e7eb;
                    background: #4b5563;
                }

                .divider {
                    width: 1px;
                    height: 20px;
                    background: #4b5563;
                    margin: 0 8px;
                }

                .toolbar-select {
                    background: #374151;
                    color: #d1d5db;
                    border: 1px solid #4b5563;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                }

                .toolbar-select:focus {
                    outline: none;
                    border-color: #6b7280;
                }
            </style>

            <button class="toolbar-button" data-action="new-chart" title="New Chart">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>
            <button class="toolbar-button" data-action="open" title="Open">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                </svg>
            </button>
            <button class="toolbar-button" data-action="save" title="Save">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
            </button>
            
            <div class="divider"></div>
            
            <button class="toolbar-button" data-action="undo" title="Undo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                </svg>
            </button>
            <button class="toolbar-button" data-action="redo" title="Redo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path>
                </svg>
            </button>
            
            <div class="divider"></div>
            
            <button class="toolbar-button" data-action="zoom-in" title="Zoom In">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
                </svg>
            </button>
            <button class="toolbar-button" data-action="zoom-out" title="Zoom Out">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                </svg>
            </button>
            
            <div class="divider"></div>
            
            <select class="toolbar-select" id="chart-type">
                <option value="natal">Natal Chart</option>
                <option value="transit">Transit</option>
                <option value="synastry">Synastry</option>
                <option value="composite">Composite</option>
            </select>
            
            <select class="toolbar-select" id="house-system">
                <option value="placidus">Placidus</option>
                <option value="koch">Koch</option>
                <option value="whole-sign">Whole Sign</option>
                <option value="equal">Equal</option>
            </select>
        `;
    }

    attachEventListeners() {
        // Handle toolbar button clicks
        const buttons = this.shadowRoot.querySelectorAll('.toolbar-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.dispatchEvent(new CustomEvent('toolbar-action', {
                    detail: { action },
                    bubbles: true,
                    composed: true
                }));
            });
        });

        // Handle select changes
        const chartTypeSelect = this.shadowRoot.getElementById('chart-type');
        const houseSystemSelect = this.shadowRoot.getElementById('house-system');

        chartTypeSelect.addEventListener('change', (e) => {
            this.dispatchEvent(new CustomEvent('chart-type-change', {
                detail: { chartType: e.target.value },
                bubbles: true,
                composed: true
            }));
        });

        houseSystemSelect.addEventListener('change', (e) => {
            this.dispatchEvent(new CustomEvent('house-system-change', {
                detail: { houseSystem: e.target.value },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('tool-bar', ToolbarElement);
