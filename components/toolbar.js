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
                        height: 40px;
                        background: var(--card-bg, #fff);
                        border-bottom: 1px solid var(--border-color, #c0c0c0);
                        padding: 0 8px;
                        gap: 4px;
                    }
                }

                button {
                    padding: 4px 8px;
                    background: var(--menu-button-bg, #e0e0e0);
                    border: 1px solid var(--border-color, #c0c0c0);
                    color: var(--menu-button-text, #000);
                    cursor: pointer;
                    font-size: 12px;
                }

                button:hover {
                    background: var(--hover-bg, #e5e5e5);
                }

                button:active {
                    background: var(--border-color, #c0c0c0);
                }
            </style>

            <button id="update-btn">Update</button>
        `;
    }

    attachEventListeners() {
        const updateBtn = this.shadowRoot.getElementById('update-btn');
        updateBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toolbar-update', {
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('tool-bar', ToolbarElement);
