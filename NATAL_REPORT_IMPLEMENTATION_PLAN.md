# Natal Report Generator - Implementation Plan

## Overview
Implement a natal chart report generation tool that follows the Hellenistic astrology framework outlined in `natal_report_plan.md`. The tool will integrate with the existing template-based architecture and use available calculation modules.

## Current State Analysis

### What Exists
1. **natal_report_plan.md** - Complete table of contents with 15 sections for Hellenistic natal report
2. **natal_report_interactive.html** - Standalone 649-line HTML form with all input fields for report data
3. **ViewManager reference** - `natal_report` view is already referenced in `header-template.js` (Tools menu) but not implemented
4. **Calculation modules available:**
   - `astro-calculations.js` (967 lines) - planetary positions, motion, sect, dignities, aspects, testimony
   - `dignity-tables.js` - domicile, exaltation, detriment, fall, triplicity, bounds
5. **Chart data access** - `window.ChartData.getCurrentData()` provides name, date, time, location from sidebar
6. **Template-based architecture** - All views use template functions returning HTML with Tailwind classes

### What's Missing
1. **Lot calculations** - Fortune, Spirit, Eros, Necessity (not in astro-calculations.js)
2. **natal-report-view.js component** - Template-based view component
3. **ViewManager integration** - Update to load the new natal report view
4. **Report generation logic** - Transform chart data + calculations into formatted report sections

## Implementation Approach

### Phase 1: Create Calculation Modules for Missing Features

**File:** `app/src/assets/js/lot-calculations.js` (NEW)

Add calculation functions for the four principal lots:
- `calculateLotOfFortune(sunLon, moonLon, ascLon, isDay)` - Day: Asc + Moon - Sun; Night: Asc + Sun - Moon
- `calculateLotOfSpirit(sunLon, moonLon, ascLon, isDay)` - Reverse of Fortune
- `calculateLotOfEros(venusLon, spiritLon, ascLon)` - Asc + Venus - Spirit
- `calculateLotOfNecessity(fortuneLon, mercuryLon, ascLon)` - Asc + Fortune - Mercury
- Helper: `normalizeLongitude(lon)` - Keep in 0-360 range

### Phase 2: Create Natal Report View Component

**File:** `app/src/assets/js/components/natal-report-view.js` (NEW)

Follow the template-based pattern from `test-suite-view.js` and `planetary-conditions-view.js`:

```javascript
// State management
let viewState = {
    container: null,
    chartData: null,
    reportData: null,
    modules: null
};

// Main function
export function createNatalReportView(container) {
    viewState.container = container;
    render();
    loadModules().then(() => {
        attachEventListeners();
        autoCalculateFromSidebar();
    });
    return { destroy: () => { /* cleanup */ } };
}
```

**UI Structure:**
1. Header with "← Back to Chart" link
2. Chart info display (name, date, time, location from sidebar)
3. "Generate Report" button (primary action)
4. Report sections (hidden until generated):
   - Foundational Analysis (sect, ascendant, triplicity lords, lots)
   - Planetary Conditions table (all 7 planets with dignities, aspects)
   - House-by-House Analysis (12 houses with interpretations)
   - Synthesis section (overall interpretation)
5. Export buttons (Print, Download HTML, Save JSON)

**Key Functions:**
- `render()` - Initial template with form inputs
- `loadModules()` - Import astro-calculations, lot-calculations, dignity-tables
- `attachEventListeners()` - Wire up buttons and inputs
- `autoCalculateFromSidebar()` - Pre-populate from ChartData.getCurrentData()
- `generateFullReport()` - Main orchestration function
- `calculateFoundations()` - Sect, ascendant, house cusps, lots
- `calculatePlanetaryConditions()` - All 7 planets with full dignity/aspect analysis
- `calculateHouseAnalysis()` - 12 houses with rulers and conditions
- `renderReportSections()` - Update DOM with calculated data
- `exportReportHTML()` - Generate standalone HTML file
- `exportReportJSON()` - Save data for later editing

### Phase 3: Update ViewManager

**File:** `app/src/lib/view-manager.js` (MODIFY)

Replace line 55:
```javascript
// FROM:
case 'natal_report':
    mainContent.innerHTML = '<natal-report-view></natal-report-view>';
    break;

// TO:
case 'natal_report':
    this.currentViewInstance = createNatalReportView(mainContent);
    break;
```

Add import at top:
```javascript
import { createNatalReportView } from '../assets/js/components/natal-report-view.js';
```

### Phase 4: Report Generation Logic

**Core calculation flow:**

1. **Get chart data** from sidebar (name, date, time, location)
2. **Calculate planetary positions** using `calculatePlanetaryPositions()`
3. **Calculate ascendant** using `calculateAscendant()`
4. **Determine sect** using `calculateSect()`
5. **Calculate house cusps** using `calculateHouseCusps()`
6. **Calculate lots** using new lot-calculations module
7. **For each planet:**
   - Essential dignities (`calculateEssentialDignities()`)
   - Motion/speed (`calculatePlanetaryMotion()`)
   - Aspects (`calculateAllAspects()`)
   - Sect testimony (`calculateSectBeneficMalefic()`)
   - Overall condition (`calculateOverallTestimony()`)
8. **For each house:**
   - Identify ruling planet
   - Check planets in house
   - Assess condition of house ruler
9. **Calculate triplicity lords:**
   - Get sect light (Sun/Moon based on day/night)
   - Get triplicity rulers of sect light's sign
   - Assess placement/condition of each
10. **Format and display** all sections

## Design Decisions

### Approach A: Full Interactive Form (Like HTML Prototype)
**Pros:**
- Allows manual entry/editing of interpretations
- Flexible for astrologers who want to customize
- Matches the detailed form in `natal_report_interactive.html`

**Cons:**
- Very large component (649+ lines just for form HTML)
- Doesn't leverage existing calculation modules
- More UI complexity to maintain

### Approach B: Auto-Generated Report (Recommended)
**Pros:**
- Leverages all existing calculation modules
- Consistent with automated app approach
- Simpler UI - just display results
- Faster workflow for users

**Cons:**
- Less flexibility for manual interpretation
- Requires good formatting of calculated data

**RECOMMENDATION: Approach B with export to editable formats**
- Auto-generate from calculations
- Display formatted results
- Export to HTML for manual editing in external tools
- Export to JSON for data portability

### Report Content Strategy

**Level 1: Essential Data (MVP)**
- Chart metadata (name, date, time, location)
- Sect determination
- Ascendant and chart ruler
- 7 planetary positions with signs and houses
- Essential dignities table
- Aspect grid
- 4 principal lots with rulers

**Level 2: Intermediate Analysis**
- Triplicity lords of sect light
- Planetary condition scores
- House-by-house ruler analysis
- Benefic/malefic testimony by sect
- Combustion, retrogradation, cazimi status

**Level 3: Advanced Interpretation**
- Critical configurations (stelliums, T-squares, etc.)
- Mutual receptions
- Reception chains
- Synthesis and overall judgment
- Time-lord periods (zodiacal releasing, profections)

**RECOMMENDATION: Start with Level 1, add Level 2 in initial implementation, defer Level 3 for future enhancement**

### UI Layout

**Section Organization:**
```
┌─────────────────────────────────────┐
│ ← Back to Chart                     │
│                                     │
│ NATAL CHART REPORT                  │
│ Name: [From Sidebar]                │
│ Birth: [Date/Time/Location]         │
│                                     │
│ [Generate Report] [Export ▾]        │
├─────────────────────────────────────┤
│ I. FOUNDATIONAL ANALYSIS            │
│   • Sect: Day/Night                 │
│   • Ascendant: [Sign] [Degree]      │
│   • Chart Ruler: [Planet]           │
│   • Lots: Fortune, Spirit, etc.     │
├─────────────────────────────────────┤
│ II. PLANETARY CONDITIONS            │
│   [Table: Planet | Sign | House |   │
│    Dignity | Aspects | Testimony]   │
├─────────────────────────────────────┤
│ III. HOUSE ANALYSIS                 │
│   [12 houses with rulers]           │
├─────────────────────────────────────┤
│ IV. SYNTHESIS                       │
│   [Summary of key themes]           │
└─────────────────────────────────────┘
```

## File Changes Summary

### New Files
1. `app/src/assets/js/lot-calculations.js` - Lot calculation functions (~150 lines)
2. `app/src/assets/js/components/natal-report-view.js` - Main view component (~800 lines)

### Modified Files
1. `app/src/lib/view-manager.js` - Add natal_report case and import (~5 lines changed)

### Documentation Updates
1. `CLAUDE.md` - Add natal-report-view.js to active components list
2. `natal_report_plan.md` - Add implementation status notes

## Implementation Steps

1. ✅ **Create lot-calculations.js** - Add 4 lot calculation functions
2. ✅ **Create natal-report-view.js** - Main component with:
   - Template rendering
   - Module loading
   - Event listeners
   - Auto-population from sidebar
3. ✅ **Implement generateFullReport()** - Orchestrate all calculations
4. ✅ **Implement renderReportSections()** - Format and display results
5. ✅ **Update ViewManager** - Add import and switch case
6. ✅ **Test with sample data** - Verify calculations and display
7. ✅ **Add export functionality** - HTML and JSON export
8. ✅ **Update documentation** - CLAUDE.md

## Testing Plan

**Test Cases:**
1. **Chart data retrieval** - Verify sidebar data loads correctly
2. **Sect calculation** - Test day vs night charts
3. **Lot calculations** - Verify with known examples
4. **Dignity calculations** - Test all 5 essential dignities
5. **Aspect calculations** - Verify all planet-to-planet aspects
6. **House analysis** - Check all 12 house rulers
7. **Export HTML** - Verify standalone file works
8. **Export JSON** - Verify data can be re-imported

**Sample Test Data:**
- December 28, 1989, 11:36 PM, Orange, CA (from test-suite-view.js)
- Expected: Sun in Capricorn, Moon in Capricorn, Mercury in Capricorn

## Future Enhancements

1. **Interpretation text** - Add AI-generated or template-based delineations
2. **PDF export** - Generate print-ready PDF reports
3. **Report templates** - Multiple report styles (brief, detailed, traditional)
4. **Time lords** - Add zodiacal releasing, profections, primary directions
5. **Transits** - Compare natal to current transits
6. **Synastry** - Two-chart comparison mode
7. **Editable reports** - Allow inline editing before export
8. **Chart image** - Embed SVG chart visualization in report

## Questions for User

1. **Report style preference:** Auto-generated (recommended) or manual form-based entry?
2. **Detail level:** Start with MVP (Level 1) or full Level 2 analysis?
3. **Export formats:** HTML + JSON sufficient, or also want PDF initially?
4. **Interpretation text:** Just data tables initially, or add text delineations?

## Risks and Mitigation

**Risk 1: Lot calculations not verified**
- Mitigation: Use traditional formulas from Chris Brennan's works, test with known examples

**Risk 2: Large component file**
- Mitigation: Can split into separate modules (report-generator.js, report-renderer.js) if needed

**Risk 3: Performance with complex calculations**
- Mitigation: All calculations are synchronous and fast; use loading indicator for UX

**Risk 4: Tailwind styles might conflict with export**
- Mitigation: Export includes full Tailwind CSS or inline critical styles
