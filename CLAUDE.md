# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an astrology PWA (Progressive Web App) application built with vanilla JavaScript and Tailwind CSS. The app is called "Lunar Ice" and provides astrological chart rendering and analysis capabilities.

**Architecture Note:** This project uses a **template-based approach** with vanilla JavaScript, NOT Web Components. This is intentional because Web Components with Shadow DOM are incompatible with Tailwind CSS (Shadow DOM encapsulation prevents Tailwind utility classes from working).

## Build System

The project uses **Vite** as the build tool with the VitePWA plugin for Progressive Web App functionality.

### Development
```bash
npm run dev:run
```
Runs the development server with hot module replacement (HMR). It:
- Starts Vite dev server
- Enables service worker in development mode
- Serves the app from the `app/` directory
- Auto-refreshes on file changes with HMR
- Debug logging enabled for PWA plugin

### Alternative Development Modes
```bash
npm run dev:destroy    # Development with service worker self-destruction
npm run dev:start      # Build and serve production build locally
npm run dev:serve      # Serve the production dist folder
```

### Production Build
```bash
npm run build
```
Creates a production build in `./dist/` (relative to project root). This:
- Builds from the `app/` directory
- Compiles and bundles all JavaScript modules
- Processes Tailwind CSS via PostCSS
- Generates service worker for offline functionality
- Creates PWA manifest
- Outputs to `../dist` (parent of app folder)

**CRITICAL**: The build outputs to `./dist/`, not `./public/`. The `app/` directory is the source directory.

## Project Structure

### Root Configuration Files
- `vite.config.js` - Vite configuration with PWA plugin setup
- `tailwind.config.js` - Tailwind CSS configuration with custom theme
- `postcss.config.js` - PostCSS configuration (Tailwind + Autoprefixer + Nested)
- `package.json` - Project dependencies and npm scripts

### Source Directory (`./app/`)
The `app/` directory is the Vite root and contains all source files:

**Entry Points:**
- `app/index.html` - Main HTML entry point
- `app/src/main.js` - Main JavaScript entry point (imported by index.html)
- `app/src/app.js` - Core application initialization

**Styling:**
- `app/css/` - CSS source files including Tailwind imports

**Public Assets:**
- `app/public/` - Static assets copied as-is to dist (favicons, icons, etc.)
- PWA icons (android-chrome, apple-touch-icon, favicon variants)

**Core Libraries:**
- `app/src/lib/chart-data.js` - Astrological chart data models and calculations
- `app/src/lib/view-manager.js` - View state management

**Plugins:**
- `app/src/plugins/themer.js` - Dark mode and theme management
- `app/src/plugins/indexedDB.js` - Local data persistence
- `app/src/plugins/utils.js` - Utility functions

**UI Components (`app/src/assets/js/components/`):**
This directory contains a mix of active and legacy code:

**Active Components (in use - ALL TEMPLATE-BASED!):**
- `preferences-window.js` - Preferences modal (template-based) ✅
- `planetary-conditions-view.js` - Planetary dignities view (template-based) ✅
- `test-suite-view.js` - Test suite view (template-based) ✅

**All active components have been successfully converted from Web Components to template-based approach!**

**Legacy Components (NOT in use - can be archived/deleted):**
- `app-shell.js` - Old main shell (replaced by template system) 💀
- `app-layout.js` - Old layout (not imported) 💀
- `astro-chart.js` - Old chart renderer (not imported) 💀
- `chart-form.js` - Old form (not imported) 💀
- `menu-bar.js` - Old menu bar (replaced by header-template.js) 💀
- `toolbar.js` - Old toolbar (not imported) 💀
- `sidebar.js` - Old sidebar (replaced by sidebar-template.js) 💀
- `mobile-buttons.js` - Old mobile buttons (not imported) 💀
- `mobile-menu.js` - Old mobile menu (not imported) 💀
- `status-bar.js` - Old status bar (not imported) 💀

**Templates (`app/src/assets/js/templates/sections/`):**
HTML template generators for major UI sections. These functions return HTML strings with Tailwind classes that get inserted into the regular DOM. These are actively used by `app.js`:
- `header-template.js` - Top header/menu bar ✅
- `sidebar-template.js` - Sidebar with chart inputs ✅
- `main-template.js` - Main content area ✅
- `properties-template.js` - Chart properties panel ✅
- `footer-template.js` - Footer content ✅

**Helpers:**
- `app/src/assets/js/ui-helpers.js` - UI utility functions
- `app/src/assets/js/error-handling.js` - Error handling utilities
- `app/src/assets/js/global-14392.js` - Global utilities

**Module Communication:**
UI modules communicate via custom events bubbling through the regular DOM. Common events include:
- Chart data updates
- Toolbar and menu actions
- Mobile menu toggles
- Navigation state changes
- Export and sharing actions

### Build Output (`./dist/`)
Generated directory - **never edit files here directly**. Created by `npm run build`.

### Development Output (`./app/dev-dist/`)
Generated during development by Vite - contains service worker files in dev mode.

## Tailwind Configuration

The Tailwind config in `./tailwind.config.js` (project root) uses:
- Custom preset with extended theme (colors, spacing, typography)
- Custom fonts: "Inter" (body), "Space Grotesk" (headings)
- Dark mode via `class` strategy (not media query)
- Content paths: `./app/**/*.html`, `./app/src/**/*.js`
- Includes comprehensive spacing, typography, and color scales

The configuration extends from a base preset with:
- Custom screen breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1140px)
- "Source Sans Pro" as the base font family
- Extensive theme customization for colors, shadows, borders, etc.

## CSS Processing

PostCSS configuration (`postcss.config.js`):
- `tailwindcss` - Processes Tailwind directives
- `autoprefixer` - Adds vendor prefixes
- `postcss-nested` - Supports nested CSS syntax

## Responsive Design

The app uses a responsive layout:
- **Desktop (≥768px)**: Full menu bar, toolbar, sidebar layout
- **Mobile (<768px)**: Mobile buttons and slide-out menu
- Dark mode managed via class-based strategy (see `app/src/plugins/themer.js`)

## PWA Features

Full PWA support via VitePWA plugin (configured in `vite.config.js`):
- Automatic service worker generation
- Web app manifest with icons
- Offline functionality
- Install prompts on supported browsers
- Development mode service worker for testing

**PWA Configuration:**
- Name: "PWA Router" (configured in manifest)
- Icons: 192x192 and 512x512 PNG variants
- Theme color: #ffffff
- Service worker injection: automatic in production, configurable in dev

## Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev:run
   ```
   - Vite dev server with HMR
   - Service worker enabled in dev mode
   - Access at `http://localhost:5173` (default Vite port)

2. **Edit Source Files:**
   - UI modules in `app/src/assets/js/components/`
   - Template generators in `app/src/assets/js/templates/sections/`
   - Core logic in `app/src/lib/` and `app/src/plugins/`
   - Main entry points: `app/index.html`, `app/src/main.js`, `app/src/app.js`

3. **Style Changes:**
   - Edit Tailwind classes directly in template strings and UI modules
   - Modify `tailwind.config.js` for theme changes
   - CSS files in `app/css/` for custom styles
   - Remember: Tailwind classes work because this uses regular DOM, not Shadow DOM

4. **Build for Production:**
   ```bash
   npm run build
   ```
   - Output to `./dist/`
   - Minified and optimized bundles
   - Service worker and manifest generated

5. **Test Production Build Locally:**
   ```bash
   npm run dev:start    # or npm run dev:serve after building
   ```

## Important Notes

- **Never edit files in `./dist/` or `./app/dev-dist/`** - these are generated
- Vite handles all bundling, code splitting, and optimization
- Service worker is automatically generated - no manual SW code needed (unless customizing)
- HMR works out of the box for fast development
- All imports use ES modules - no CommonJS

## Git Workflow

- **Current branch:** `main`
- **Main branch for PRs:** `main`
- Check `git status` for current uncommitted changes
