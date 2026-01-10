/**
 * MobileMenu Web Component
 * Slide-out menu for mobile
 */
class MobileMenuElement extends HTMLElement {
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
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--bg-color, #f0f0f0);
                    border-top: 1px solid var(--border-color, #c0c0c0);
                    transform: translateY(100%);
                    transition: transform 0.3s;
                    z-index: 999;
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                }

                :host(.active) {
                    transform: translateY(0);
                }

                @media (min-width: 768px) {
                    :host {
                        display: none;
                    }
                }

                button {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: var(--card-bg, #fff);
                    border: 1px solid var(--input-border, #a0a0a0);
                    border-radius: 5px;
                    cursor: pointer;
                    text-align: left;
                    color: var(--text-color, #000);
                }

                button:hover {
                    opacity: 0.8;
                }
            </style>

            <button data-action="manual-chart">Manual Chart</button>
        `;
    }

    attachEventListeners() {
        const buttons = this.shadowRoot.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.dispatchEvent(new CustomEvent('menu-select', {
                    detail: { action },
                    bubbles: true,
                    composed: true
                }));
                this.close();
            });
        });
    }

    toggle() {
        this.classList.toggle('active');
    }

    close() {
        this.classList.remove('active');
    }
}

customElements.define('mobile-menu', MobileMenuElement);
