/**
 * MenuBar Web Component
 * Desktop menu bar with dropdown menus
 */
class MenuBarElement extends HTMLElement {
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
                        height: 28px;
                        background: var(--card-bg, #fff);
                        border-bottom: 1px solid var(--border-color, #c0c0c0);
                        padding: 0 8px;
                        font-size: 13px;
                    }
                }

                .menu-item {
                    padding: 4px 12px;
                    cursor: pointer;
                    position: relative;
                    color: var(--text-color, #000);
                }

                .menu-item:hover {
                    background: var(--hover-bg, #e5e5e5);
                }

                .dropdown-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: var(--card-bg, #fff);
                    border: 1px solid var(--border-color, #c0c0c0);
                    min-width: 150px;
                    z-index: 1000;
                }

                .dropdown-menu.show {
                    display: block;
                }

                .menu-option {
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 13px;
                    color: var(--text-color, #000);
                }

                .menu-option:hover {
                    background: var(--hover-bg, #e5e5e5);
                }
            </style>

            <div class="menu-item" id="file-menu-item">
                File
                <div class="dropdown-menu" id="file-menu">
                    <div class="menu-option" data-action="export">Export</div>
                </div>
            </div>
            <div class="menu-item">Edit</div>
            <div class="menu-item">View</div>
            <div class="menu-item" id="help-menu-item">
                Help
                <div class="dropdown-menu" id="help-menu">
                    <div class="menu-option" data-action="contact">Contact Author</div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const fileMenuItem = this.shadowRoot.getElementById('file-menu-item');
        const helpMenuItem = this.shadowRoot.getElementById('help-menu-item');
        const fileMenu = this.shadowRoot.getElementById('file-menu');
        const helpMenu = this.shadowRoot.getElementById('help-menu');

        fileMenuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            fileMenu.classList.toggle('show');
            helpMenu.classList.remove('show');
        });

        helpMenuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            helpMenu.classList.toggle('show');
            fileMenu.classList.remove('show');
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            fileMenu.classList.remove('show');
            helpMenu.classList.remove('show');
        });

        // Handle menu option clicks
        const menuOptions = this.shadowRoot.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.dispatchEvent(new CustomEvent('menu-action', {
                    detail: { action },
                    bubbles: true,
                    composed: true
                }));
            });
        });
    }
}

customElements.define('menu-bar', MenuBarElement);
