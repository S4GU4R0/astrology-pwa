/**
 * Alpine.js Component Data for Preferences Window
 * Handles window state, drag functionality, and preference management
 */

import { PreferencesManager } from '../helpers/preferences-manager.js';

/**
 * Create the Alpine.js component data for preferences window
 * @returns {Object} Alpine component data
 */
export function preferencesWindow() {
  return {
    // Window state
    isOpen: true,
    isMinimized: false,
    activeTab: 'general',

    // Window position
    position: {
      x: 0,
      y: 0
    },

    // Drag state
    isDragging: false,
    dragOffset: { x: 0, y: 0 },

    // Tabs configuration
    tabs: [
      { id: 'general', label: 'General' },
      { id: 'display', label: 'Display' },
      { id: 'chart', label: 'Chart' },
      { id: 'advanced', label: 'Advanced' }
    ],

    // Accent colors (from themer.js)
    accentColors: ['#810CA8', '#38E54D', '#3AB0FF', '#F94C66', '#FFC54D'],

    // Preferences data
    preferences: null,

    /**
     * Initialize the component
     */
    init() {
      // Load preferences
      this.preferences = PreferencesManager.load();

      // Center the window on screen
      this.centerWindow();

      // Setup drag event listeners
      this.setupDragListeners();

      // Load saved position if available
      this.loadWindowPosition();
    },

    /**
     * Center the window on screen
     */
    centerWindow() {
      const windowWidth = 600; // Match the w-[600px] class
      const windowHeight = Math.min(window.innerHeight * 0.8, 800);

      this.position.x = Math.max(0, (window.innerWidth - windowWidth) / 2);
      this.position.y = Math.max(0, (window.innerHeight - windowHeight) / 2);
    },

    /**
     * Setup drag event listeners
     */
    setupDragListeners() {
      // Mouse move handler
      const handleMouseMove = (e) => {
        if (this.isDragging) {
          this.position.x = e.clientX - this.dragOffset.x;
          this.position.y = e.clientY - this.dragOffset.y;

          // Constrain to viewport
          const maxX = window.innerWidth - 600; // Window width
          const maxY = window.innerHeight - 100; // Min visible height

          this.position.x = Math.max(0, Math.min(this.position.x, maxX));
          this.position.y = Math.max(0, Math.min(this.position.y, maxY));
        }
      };

      // Mouse up handler
      const handleMouseUp = () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.saveWindowPosition();
        }
      };

      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Cleanup on destroy
      this.$el.addEventListener('destroy', () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      });
    },

    /**
     * Start dragging the window
     * @param {MouseEvent} event - Mouse down event
     */
    startDrag(event) {
      // Only drag on title bar, not buttons
      if (event.target.closest('button')) {
        return;
      }

      this.isDragging = true;
      this.dragOffset.x = event.clientX - this.position.x;
      this.dragOffset.y = event.clientY - this.position.y;

      // Prevent text selection while dragging
      event.preventDefault();
    },

    /**
     * Save window position to localStorage
     */
    saveWindowPosition() {
      try {
        localStorage.setItem('prefs_window_position', JSON.stringify(this.position));
      } catch (error) {
        console.error('Failed to save window position:', error);
      }
    },

    /**
     * Load window position from localStorage
     */
    loadWindowPosition() {
      try {
        const saved = localStorage.getItem('prefs_window_position');
        if (saved) {
          const position = JSON.parse(saved);

          // Validate position is still within viewport
          const maxX = window.innerWidth - 600;
          const maxY = window.innerHeight - 100;

          if (position.x >= 0 && position.x <= maxX &&
              position.y >= 0 && position.y <= maxY) {
            this.position = position;
          }
        }
      } catch (error) {
        console.error('Failed to load window position:', error);
      }
    },

    /**
     * Close the preferences window
     */
    close() {
      this.isOpen = false;

      // Remove from DOM after transition
      setTimeout(() => {
        this.$el.remove();
      }, 200);
    },

    /**
     * Save preferences and close
     */
    save() {
      const success = PreferencesManager.save(this.preferences);

      if (success) {
        // Dispatch event to notify app
        window.dispatchEvent(new CustomEvent('preferences-updated', {
          detail: this.preferences
        }));

        // Apply theme changes immediately
        this.applyThemeChanges();

        // Show success feedback
        this.showSaveSuccess();

        // Close window
        this.close();
      } else {
        alert('Failed to save preferences. Please try again.');
      }
    },

    /**
     * Apply theme changes immediately
     */
    applyThemeChanges() {
      if (window.themer) {
        const theme = this.preferences.general.theme;
        const accentIndex = this.preferences.general.accentColor;
        const accentColor = this.accentColors[accentIndex];

        // Set theme
        if (theme === 'auto') {
          // Detect system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          window.themer.setTheme(prefersDark ? 'dark' : 'light');
        } else {
          window.themer.setTheme(theme);
        }

        // Set accent color
        window.themer.setAccent(accentIndex, accentColor);
      }
    },

    /**
     * Show save success feedback
     */
    showSaveSuccess() {
      // Use existing toast if available
      if (typeof showToast === 'function') {
        showToast('Preferences saved successfully', 'success');
      } else {
        console.log('Preferences saved successfully');
      }
    },

    /**
     * Reset preferences to defaults
     */
    reset() {
      if (confirm('Reset all preferences to defaults? This cannot be undone.')) {
        this.preferences = PreferencesManager.getDefaults();

        // Show feedback
        if (typeof showToast === 'function') {
          showToast('Preferences reset to defaults', 'info');
        }
      }
    },

    /**
     * Export preferences to JSON file
     */
    exportPreferences() {
      try {
        const dataStr = JSON.stringify(this.preferences, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `lunar-ice-preferences-${Date.now()}.json`;
        link.click();

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);

        // Show feedback
        if (typeof showToast === 'function') {
          showToast('Preferences exported successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to export preferences:', error);
        alert('Failed to export preferences. Please try again.');
      }
    },

    /**
     * Import preferences from JSON file
     */
    importPreferences() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);

            // Validate structure
            if (!imported.general || !imported.display || !imported.chart) {
              throw new Error('Invalid preferences file structure');
            }

            // Merge with defaults to ensure all keys exist
            this.preferences = PreferencesManager.mergeWithDefaults(imported);

            // Show feedback
            if (typeof showToast === 'function') {
              showToast('Preferences imported successfully', 'success');
            } else {
              alert('Preferences imported successfully');
            }
          } catch (error) {
            console.error('Failed to import preferences:', error);
            alert('Invalid preferences file. Please check the file and try again.');
          }
        };

        reader.onerror = () => {
          alert('Failed to read file. Please try again.');
        };

        reader.readAsText(file);
      };

      input.click();
    }
  };
}

// Register with Alpine when it initializes
if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (window.Alpine) {
      window.Alpine.data('preferencesWindow', preferencesWindow);
    }
  });
}
