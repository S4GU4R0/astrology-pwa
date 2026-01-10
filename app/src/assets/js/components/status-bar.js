/**
 * StatusBar Web Component
 * Desktop status bar
 */
class StatusBarElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
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
                        height: 24px;
                        background: var(--card-bg, #fff);
                        border-top: 1px solid var(--border-color, #c0c0c0);
                        padding: 0 8px;
                        font-size: 12px;
                        color: var(--text-color, #000);
                    }
                }
            </style>

            <span id="status-text">Ready</span>
        `;
    }

    setStatus(message) {
        const statusText = this.shadowRoot.getElementById('status-text');
        if (statusText) {
            statusText.textContent = message;
        }
    }
}

customElements.define('status-bar', StatusBarElement);
