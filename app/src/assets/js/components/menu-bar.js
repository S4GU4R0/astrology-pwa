/**
 * MenuBar Web Component
 * Desktop menu bar with dropdown menus
 */
class MenuBarElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.activeMenu = null;
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
                        background: #1f2937;
                        border-bottom: 1px solid #374151;
                        padding: 0 8px;
                        font-size: 13px;
                    }
                }

                .menu-container {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    margin-right: 16px;
                }

                .logo-section img {
                    height: 20px;
                    margin-right: 8px;
                }

                .logo-section span {
                    color: #d1d5db;
                    font-size: 14px;
                    font-weight: 600;
                }

                .menu-nav {
                    display: flex;
                    align-items: center;
                    space-x: 4px;
                }

                .menu-item {
                    position: relative;
                    padding: 4px 12px;
                    cursor: pointer;
                    color: #d1d5db;
                    border-radius: 4px;
                }

                .menu-item:hover {
                    background: #374151;
                }

                .dropdown-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 6px;
                    min-width: 192px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    margin-top: 4px;
                }

                .dropdown-menu.show {
                    display: block;
                }

                .menu-option {
                    display: block;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #d1d5db;
                    text-decoration: none;
                }

                .menu-option:hover {
                    background: #374151;
                }

                .menu-divider {
                    border-top: 1px solid #374151;
                    margin: 4px 0;
                }

                .right-section {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    space-x: 8px;
                }

                .icon-button {
                    padding: 4px;
                    color: #9ca3af;
                    background: none;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .icon-button:hover {
                    color: #e5e7eb;
                    background: #374151;
                }
            </style>

            <div class="menu-container">
                <div class="logo-section">
                    <img src="images/logos/logo-c98274bea344d9c7669cdc3c97a5bebe.png" alt="AstroDesk">
                    <span>AstroDesk</span>
                </div>
                
                <nav class="menu-nav">
                    <div class="menu-item" data-menu="file">
                        File
                        <div class="dropdown-menu" id="file-menu">
                            <a href="#" class="menu-option" data-action="new-chart">New Chart</a>
                            <a href="#" class="menu-option" data-action="open">Open...</a>
                            <a href="#" class="menu-option" data-action="save">Save</a>
                            <a href="#" class="menu-option" data-action="save-as">Save As...</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="export-pdf">Export PDF</a>
                            <a href="#" class="menu-option" data-action="print">Print...</a>
                        </div>
                    </div>
                    
                    <div class="menu-item" data-menu="edit">
                        Edit
                        <div class="dropdown-menu" id="edit-menu">
                            <a href="#" class="menu-option" data-action="undo">Undo</a>
                            <a href="#" class="menu-option" data-action="redo">Redo</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="copy-chart">Copy Chart</a>
                            <a href="#" class="menu-option" data-action="preferences">Preferences...</a>
                        </div>
                    </div>
                    
                    <div class="menu-item" data-menu="view">
                        View
                        <div class="dropdown-menu" id="view-menu">
                            <a href="#" class="menu-option" data-action="zoom-in">Zoom In</a>
                            <a href="#" class="menu-option" data-action="zoom-out">Zoom Out</a>
                            <a href="#" class="menu-option" data-action="fit-window">Fit to Window</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="show-grid">Show Grid</a>
                            <a href="#" class="menu-option" data-action="show-aspects">Show Aspects</a>
                        </div>
                    </div>
                    
                    <div class="menu-item" data-menu="chart">
                        Chart
                        <div class="dropdown-menu" id="chart-menu">
                            <a href="#" class="menu-option" data-action="natal-chart">Natal Chart</a>
                            <a href="#" class="menu-option" data-action="transit-chart">Transit Chart</a>
                            <a href="#" class="menu-option" data-action="synastry">Synastry</a>
                            <a href="#" class="menu-option" data-action="composite">Composite</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="progressions">Progressions</a>
                            <a href="#" class="menu-option" data-action="solar-return">Solar Return</a>
                        </div>
                    </div>
                    
                    <div class="menu-item" data-menu="tools">
                        Tools
                        <div class="dropdown-menu" id="tools-menu">
                            <a href="#" class="menu-option" data-action="planetary-conditions">Planetary Conditions</a>
                            <a href="#" class="menu-option" data-action="natal-report">Natal Report</a>
                            <a href="#" class="menu-option" data-action="chart-view">Chart View</a>
                            <a href="#" class="menu-option" data-action="test-suite">Test Suite</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="aspect-calculator">Aspect Calculator</a>
                            <a href="#" class="menu-option" data-action="ephemeris">Ephemeris</a>
                            <a href="#" class="menu-option" data-action="house-system">House System</a>
                        </div>
                    </div>
                    
                    <div class="menu-item" data-menu="help">
                        Help
                        <div class="dropdown-menu" id="help-menu">
                            <a href="#" class="menu-option" data-action="documentation">Documentation</a>
                            <a href="#" class="menu-option" data-action="keyboard-shortcuts">Keyboard Shortcuts</a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-option" data-action="about">About AstroDesk</a>
                        </div>
                    </div>
                </nav>
                
                <div class="right-section">
                    <button class="icon-button" title="Search">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>
                    <button class="icon-button" title="Settings">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const menuItems = this.shadowRoot.querySelectorAll('.menu-item');
        const dropdowns = this.shadowRoot.querySelectorAll('.dropdown-menu');

        // Handle menu item hover/click
        menuItems.forEach(item => {
            const menuName = item.dataset.menu;
            const dropdown = this.shadowRoot.getElementById(`${menuName}-menu`);
            
            if (dropdown) {
                // Show dropdown on hover
                item.addEventListener('mouseenter', () => {
                    this.hideAllDropdowns();
                    this.showDropdown(menuName);
                });
                
                item.addEventListener('mouseleave', (e) => {
                    // Hide when leaving the menu item unless entering the dropdown
                    setTimeout(() => {
                        if (!dropdown.matches(':hover')) {
                            this.hideDropdown(menuName);
                        }
                    }, 100);
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    this.hideDropdown(menuName);
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.hideAllDropdowns();
        });

        // Handle menu option clicks
        const menuOptions = this.shadowRoot.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Handle icon button clicks
        const iconButtons = this.shadowRoot.querySelectorAll('.icon-button');
        iconButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const title = e.currentTarget.getAttribute('title');
                this.handleIconAction(title);
            });
        });
    }

    showDropdown(menuName) {
        const dropdown = this.shadowRoot.getElementById(`${menuName}-menu`);
        if (dropdown) {
            dropdown.classList.add('show');
            this.activeMenu = menuName;
        }
    }

    hideDropdown(menuName) {
        const dropdown = this.shadowRoot.getElementById(`${menuName}-menu`);
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        if (this.activeMenu === menuName) {
            this.activeMenu = null;
        }
    }

    hideAllDropdowns() {
        const dropdowns = this.shadowRoot.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        this.activeMenu = null;
    }

    handleMenuAction(action) {
        // Handle special view navigation actions
        const viewActions = {
            'planetary-conditions': 'planetary_conditions',
            'natal-report': 'natal_report',
            'chart-view': 'chart',
            'test-suite': 'test'
        };

        if (viewActions[action]) {
            this.dispatchEvent(new CustomEvent('nav-change', {
                detail: { view: viewActions[action] },
                bubbles: true,
                composed: true
            }));
        } else {
            // Handle other menu actions
            this.dispatchEvent(new CustomEvent('menu-action', {
                detail: { action },
                bubbles: true,
                composed: true
            }));
        }
        
        this.hideAllDropdowns();
    }

    handleIconAction(title) {
        this.dispatchEvent(new CustomEvent('icon-action', {
            detail: { action: title.toLowerCase() },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('menu-bar', MenuBarElement);
