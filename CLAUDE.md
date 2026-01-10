# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an astrology PWA (Progressive Web App) application built with vanilla JavaScript Web Components and Tailwind CSS. The project was originally scaffolded from Shuffle.dev's Tailwind Builder but has been customized into an astrology charting tool called "Astrodex".

## Build System

The project uses a Tailwind-based build system with npm scripts:

### Development
```bash
npm run watch
```
This runs the development server with live reload via Browsersync. It:
- Builds all assets
- Watches for HTML changes in `src/html/`
- Watches for Tailwind CSS changes
- Serves the app at `http://localhost:3000` (or next available port)
- Auto-refreshes on file changes

### Production Build
```bash
npm run build
```
Creates a production build in `./public/`. This:
- Cleans the public directory
- Copies assets from `src/assets/`
- Copies HTML files from `src/html/`
- Compiles and minifies Tailwind CSS

### Individual Build Steps
- `npm run clean` - Removes all files from `./public/`
- `npm run copy-assets` - Copies static assets to public
- `npm run copy-html` - Copies HTML templates to public
- `npm run css` - Compiles and minifies Tailwind CSS
- `npm run css-compile` - Compiles CSS without minification
- `npm run css-minified` - Compiles and minifies CSS

**CRITICAL**: npm commands overwrite the `./public` directory. Always edit source files in `./src/`, not in `./public/`.

## Project Structure

### Source Files (`./src/`)
- `src/html/*.html` - HTML templates (source of truth, copied to public during build)
- `src/tailwind/tailwind.config.js` - Tailwind theme configuration with custom presets
- `src/tailwind/tailwind.css` - Tailwind CSS entry point
- `src/assets/` - Static assets (images, placeholders)

### Components (`./components/`)
Vanilla JavaScript Web Components using Shadow DOM. All components follow the pattern:
- Extend `HTMLElement`
- Use `attachShadow({ mode: 'open' })`
- Implement `connectedCallback()` for initialization
- Self-contained with scoped styles

**Component Architecture:**
- `app-shell.js` - Main application shell, composes all other components
- `astro-chart.js` - SVG-based astrological chart renderer
- `chart-form.js` - Form for inputting chart data
- `menu-bar.js` - Desktop menu bar
- `toolbar.js` - Desktop toolbar
- `sidebar.js` - Desktop sidebar navigation
- `status-bar.js` - Status/info bar
- `mobile-buttons.js` - Mobile-specific button controls
- `mobile-menu.js` - Mobile navigation menu

**Component Communication:**
Components communicate via custom events bubbling through Shadow DOM:
- `chart-update` - Emitted when chart data changes
- `toolbar-update` - Emitted when toolbar actions occur
- `toggle-menu` - Mobile menu toggle
- `menu-select` - Menu item selection
- `nav-change` - Navigation state change
- `menu-action` - General menu actions (export, contact, etc.)
- `export-chart` - Triggers chart export

### Build Output (`./public/`)
Generated directory - **never edit files here directly**. Modified on every build.

## Tailwind Configuration

The Tailwind config in `src/tailwind/tailwind.config.js` uses:
- Custom preset with extended theme (colors, spacing, typography)
- Custom fonts: "Inter" (body), "Space Grotesk" (headings)
- CSS custom properties for dark mode support
- Content paths: `src/pug/*.pug`, `src/html/*.html`

## Responsive Design

The app uses a responsive layout:
- **Desktop (≥768px)**: Full menu bar, toolbar, sidebar layout
- **Mobile (<768px)**: Mobile buttons and slide-out menu
- CSS custom properties handle dark mode via `prefers-color-scheme`

## PWA Features

The app references a service worker registration in the root `index.html`:
```javascript
navigator.serviceWorker.register('/service-worker.js')
```

Note: Service worker and manifest files may need to be created if implementing full PWA functionality.

## Development Workflow

1. Edit source files in `./src/html/` or components in `./components/`
2. Run `npm run watch` for development with live reload
3. Edit Tailwind config in `src/tailwind/tailwind.config.js` if theme changes needed
4. Build outputs automatically to `./public/`

## Git Workflow

Current branch: `main`
Main branch for PRs: `main`

The project has some uncommitted changes (check `git status` for current state).
