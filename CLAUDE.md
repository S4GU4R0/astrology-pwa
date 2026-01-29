# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an astrology PWA (Progressive Web App) called "Lunar Ice" built with vanilla JavaScript and Tailwind CSS. It provides astrological chart rendering and analysis capabilities.

**Architecture Note:** This project uses a **template-based approach** with vanilla JavaScript, NOT Web Components. Web Components with Shadow DOM are incompatible with Tailwind CSS (Shadow DOM encapsulation prevents Tailwind utility classes from working). All UI is built with functions that return HTML strings or DOM fragments with Tailwind classes.

## Commands

### Development
```bash
npm run dev:run          # Start dev server with HMR (recommended)
npm run dev:destroy      # Dev server with service worker self-destruction
npm run dev:start        # Build and serve production build locally
npm run dev:serve        # Serve the production dist folder
```

### Production Build
```bash
npm run build            # Build to ./dist/
```

**CRITICAL**: The build outputs to `./dist/`, not `./public/`. The `app/` directory is the Vite root/source directory.

## Architecture

### Application Flow
1. `app/index.html` loads `app/src/main.js`
2. `main.js` initializes theme (via `themer.js`) and calls `initApp()` from `app.js`
3. `app.js` creates a `TemplateRenderer` which composes the UI from template functions
4. Template functions (`app/src/js/templates/`) return DOM fragments with Tailwind classes
5. `ViewManager` (`app/src/js/helpers/view-manager.js`) handles switching views in the main content area

### Key Directories
```
app/                          # Vite root (source directory)
├── src/
│   ├── main.js               # Entry point - theme init, app bootstrap
│   ├── app.js                # App initialization, form handlers, chart calculation
│   ├── js/
│   │   ├── astro/            # Astrology calculations & data
│   │   │   ├── chart-data.js
│   │   │   ├── astro-calculations.js
│   │   │   ├── chart-renderer.js
│   │   │   ├── dignity-tables.js
│   │   │   └── planet_evaluation.js
│   │   ├── views/            # View components
│   │   │   ├── planetary-conditions-view.js
│   │   │   ├── test-suite-view.js
│   │   │   └── preferences-window.js
│   │   ├── templates/        # UI templates
│   │   │   ├── template-renderer.js
│   │   │   ├── header-template.js
│   │   │   ├── sidebar-template.js
│   │   │   ├── main-template.js
│   │   │   ├── properties-template.js
│   │   │   └── footer-template.js
│   │   ├── helpers/          # Utility modules
│   │   │   ├── view-manager.js
│   │   │   ├── preferences-manager.js
│   │   │   ├── ui-helpers.js
│   │   │   ├── error-handling.js
│   │   │   └── geocoding-service.js
│   │   ├── vendor/           # Third-party libraries
│   │   │   └── astronomy.browser.min.js
│   │   └── _archive/         # Legacy code (not imported)
│   ├── plugins/
│   │   ├── themer.js         # Dark mode (class-based strategy)
│   │   ├── indexedDB.js      # Local data persistence
│   │   └── utils.js          # Utility functions
│   └── css/                  # Tailwind CSS source
├── public/                   # Static assets (icons, favicons)
dist/                         # Build output (generated, never edit)
app/dev-dist/                 # Dev service worker files (generated)
```

### Module Communication
UI modules communicate via custom events on the DOM:
- `view-change` - Switch views (listened by ViewManager)
- Chart data updates, menu actions, navigation state changes

## Tailwind Configuration

- Dark mode: `class` strategy (toggle via `themer.js`)
- Content paths: `./app/**/*.html`, `./app/src/**/*.js`
- Fonts: "Inter" (body), "Space Grotesk" (headings) in theme extension; preset uses "Source Sans Pro"
- Breakpoints: sm 640px, md 768px, lg 1024px, xl 1140px
- PostCSS plugins: tailwindcss, autoprefixer, postcss-nested

## Responsive Design

- **Desktop (≥768px)**: Full menu bar, toolbar, sidebar layout
- **Mobile (<768px)**: Mobile buttons and slide-out menu

## PWA

VitePWA plugin handles service worker generation automatically. Dev mode SW enabled via `npm run dev:run`.

## Important Notes

- **Never edit files in `./dist/` or `./app/dev-dist/`** - these are generated
- All imports use ES modules (no CommonJS)
- Tailwind classes work because this uses regular DOM, not Shadow DOM
