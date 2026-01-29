/**
 * PreferencesManager
 * Manages application preferences with localStorage persistence
 */

export class PreferencesManager {
  static STORAGE_KEY = 'lunar_ice_preferences';
  static VERSION = 1;

  static DEFAULT_PREFERENCES = {
    version: 1,

    general: {
      theme: 'auto',              // 'light', 'dark', 'auto'
      accentColor: 0,             // Index into accent color array
      fontSize: 'medium',         // 'small', 'medium', 'large'
      compactMode: false,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',   // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
      timeFormat: '12h',          // '12h', '24h'
      timeZone: 'system'          // 'system' or specific timezone
    },

    display: {
      chartStyle: 'modern',       // 'modern', 'classical', 'minimalist'
      chartSize: 'responsive',
      background: 'transparent',
      borderStyle: 'thin',
      showAspects: true,
      aspectOpacity: 0.6,
      showAspectGrid: true,
      showMinorPlanets: false,
      showFixedStars: false,
      showArabicParts: false,
      showHouseCusps: true,
      showDegreeMarkers: true,
      planetColorScheme: 'traditional',
      signColorScheme: 'traditional',
      aspectColorScheme: 'traditional'
    },

    chart: {
      defaultChartType: 'natal',  // 'natal', 'transit', 'synastry', 'composite'
      houseSystem: 'placidus',    // 'placidus', 'koch', 'whole-sign', 'equal', 'campanus'
      zodiac: 'tropical',         // 'tropical', 'sidereal'
      ayanamsa: 'lahiri',         // If sidereal: 'lahiri', 'raman', etc.
      nodeType: 'true',           // 'true', 'mean'
      lilith: 'mean',             // 'true', 'mean', 'osculating', 'interpolated'
      partOfFortune: 'day-night', // 'day-night', 'always-day'
      orbMode: 'default',         // 'default', 'tight', 'wide', 'custom'
      customOrbs: {},
      majorAspects: {
        conjunction: { enabled: true, orb: 8 },
        opposition: { enabled: true, orb: 8 },
        trine: { enabled: true, orb: 8 },
        square: { enabled: true, orb: 8 },
        sextile: { enabled: true, orb: 6 }
      },
      minorAspects: {
        semisextile: { enabled: false, orb: 3 },
        quincunx: { enabled: false, orb: 3 },
        semisquare: { enabled: false, orb: 3 },
        sesquisquare: { enabled: false, orb: 3 },
        quintile: { enabled: false, orb: 2 },
        biquintile: { enabled: false, orb: 2 }
      },
      aspectCalculation: 'both'   // 'applying', 'separating', 'both'
    },

    data: {
      storageType: 'localStorage',
      saveHistory: true,
      maxCharts: 50,
      autoSave: true,
      analytics: false,
      crashReporting: false,
      offlineMode: true
    },

    advanced: {
      debugMode: false,
      performanceMonitoring: false,
      consoleLogging: 'errors',   // 'none', 'errors', 'warnings', 'all'
      betaFeatures: false,
      featureFlags: {}
    }
  };

  /**
   * Load preferences from localStorage
   * @returns {Object} Preferences object
   */
  static load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaults();
      }

      const parsed = JSON.parse(stored);
      return this.migrate(parsed);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return this.getDefaults();
    }
  }

  /**
   * Save preferences to localStorage
   * @param {Object} preferences - Preferences object to save
   * @returns {boolean} Success status
   */
  static save(preferences) {
    try {
      preferences.version = this.VERSION;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  /**
   * Get a deep copy of default preferences
   * @returns {Object} Default preferences
   */
  static getDefaults() {
    return JSON.parse(JSON.stringify(this.DEFAULT_PREFERENCES));
  }

  /**
   * Migrate preferences from older versions
   * @param {Object} preferences - Preferences to migrate
   * @returns {Object} Migrated preferences
   */
  static migrate(preferences) {
    const current = preferences.version || 0;

    // Ensure all default keys exist
    const migrated = this.mergeWithDefaults(preferences);

    // Version-specific migrations
    if (current < 1) {
      // v0 → v1 migration (if needed in future)
    }

    migrated.version = this.VERSION;
    return migrated;
  }

  /**
   * Merge stored preferences with defaults (for new keys)
   * @param {Object} stored - Stored preferences
   * @returns {Object} Merged preferences
   */
  static mergeWithDefaults(stored) {
    const defaults = this.getDefaults();

    return {
      version: this.VERSION,
      general: { ...defaults.general, ...stored.general },
      display: { ...defaults.display, ...stored.display },
      chart: {
        ...defaults.chart,
        ...stored.chart,
        majorAspects: { ...defaults.chart.majorAspects, ...stored.chart?.majorAspects },
        minorAspects: { ...defaults.chart.minorAspects, ...stored.chart?.minorAspects }
      },
      data: { ...defaults.data, ...stored.data },
      advanced: { ...defaults.advanced, ...stored.advanced }
    };
  }

  /**
   * Reset preferences to defaults
   */
  static reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export preferences as JSON blob URL
   * @returns {string} Blob URL for download
   */
  static exportToJSON() {
    const prefs = this.load();
    const dataStr = JSON.stringify(prefs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  /**
   * Import preferences from JSON string
   * @param {string} jsonString - JSON string of preferences
   * @returns {boolean} Success status
   */
  static importFromJSON(jsonString) {
    try {
      const prefs = JSON.parse(jsonString);

      // Validate structure
      if (!prefs.general || !prefs.display || !prefs.chart) {
        throw new Error('Invalid preferences structure');
      }

      const merged = this.mergeWithDefaults(prefs);
      this.save(merged);
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * Get a specific preference value by path
   * @param {string} path - Dot-notation path (e.g., 'general.theme')
   * @returns {*} Preference value
   */
  static get(path) {
    const prefs = this.load();
    const parts = path.split('.');
    let value = prefs;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return null;
    }

    return value;
  }

  /**
   * Set a specific preference value by path
   * @param {string} path - Dot-notation path (e.g., 'general.theme')
   * @param {*} value - Value to set
   * @returns {boolean} Success status
   */
  static set(path, value) {
    const prefs = this.load();
    const parts = path.split('.');
    const last = parts.pop();
    let target = prefs;

    for (const part of parts) {
      if (!target[part]) target[part] = {};
      target = target[part];
    }

    target[last] = value;
    return this.save(prefs);
  }
}
