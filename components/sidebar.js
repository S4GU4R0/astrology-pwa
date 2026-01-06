/**
 * Sidebar Web Component
 * Desktop navigation sidebar
 */
class SidebarElement extends HTMLElement {
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
                        display: block;
                        width: 180px;
                        background: var(--sidebar-bg, #f5f5f5);
                        border-right: 1px solid var(--border-color, #c0c0c0);
                        overflow-y: auto;
                    }
                }

                .nav-item {
                    padding: 6px 12px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    color: var(--text-color, #000);
                    font-size: 13px;
                }

                .nav-item:hover {
                    background: var(--hover-bg, #e5e5e5);
                }

                .nav-item.active {
                    background: var(--hover-bg, #e5e5e5);
                }
            </style>

            <button class="nav-item active" data-view="manual-chart">Manual Chart</button>
        `;
    }

    attachEventListeners() {
        const navItems = this.shadowRoot.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                navItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                e.target.classList.add('active');

                const view = e.target.dataset.view;
                this.dispatchEvent(new CustomEvent('nav-change', {
                    detail: { view },
                    bubbles: true,
                    composed: true
                }));
            });
        });
    }
}

customElements.define('side-bar', SidebarElement);
