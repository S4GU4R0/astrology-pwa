/**
 * AppLayout Web Component
 * Main layout wrapper that preserves Alpine.js functionality
 */
class AppLayout extends HTMLElement {
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
                    display: block;
                }
            </style>
            <slot></slot>
        `;
    }
}

customElements.define('app-layout', AppLayout);
