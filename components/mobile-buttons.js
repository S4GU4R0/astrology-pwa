/**
 * MobileButtons Web Component
 * Floating action buttons for mobile
 */
class MobileButtonsElement extends HTMLElement {
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

                @media (min-width: 768px) {
                    :host {
                        display: none;
                    }
                }

                button {
                    position: fixed;
                    padding: 0;
                    background: var(--menu-button-bg, #e0e0e0);
                    color: var(--menu-button-text, #000);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                #menu-button {
                    bottom: 20px;
                    right: 20px;
                    width: 56px;
                    height: 56px;
                    font-size: 24px;
                }

                #export-button {
                    top: 20px;
                    left: 20px;
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                }
            </style>

            <button id="export-button">↓</button>
            <button id="menu-button">+</button>
        `;
    }

    attachEventListeners() {
        const exportBtn = this.shadowRoot.getElementById('export-button');
        const menuBtn = this.shadowRoot.getElementById('menu-button');

        exportBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('export-chart', {
                bubbles: true,
                composed: true
            }));
        });

        menuBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggle-menu', {
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('mobile-buttons', MobileButtonsElement);
