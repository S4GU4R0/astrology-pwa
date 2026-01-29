/**
 * @file Geocoding service using OpenStreetMap Nominatim API
 * @module geocoding-service
 * @description Free geocoding service for converting location strings to coordinates
 */

/**
 * Geocoding service for converting location names to coordinates
 */
export class GeocodingService {
  static NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
  static USER_AGENT = 'AstrologyPWA/1.0';
  static RATE_LIMIT_MS = 1000; // 1 request per second
  static lastRequestTime = 0;

  // Fallback cache for common locations (used when API is unavailable)
  static LOCATION_CACHE = {
    'new york': { latitude: 40.7128, longitude: -74.0060, displayName: 'New York, NY, USA' },
    'new york, ny': { latitude: 40.7128, longitude: -74.0060, displayName: 'New York, NY, USA' },
    'los angeles': { latitude: 34.0522, longitude: -118.2437, displayName: 'Los Angeles, CA, USA' },
    'los angeles, ca': { latitude: 34.0522, longitude: -118.2437, displayName: 'Los Angeles, CA, USA' },
    'chicago': { latitude: 41.8781, longitude: -87.6298, displayName: 'Chicago, IL, USA' },
    'chicago, il': { latitude: 41.8781, longitude: -87.6298, displayName: 'Chicago, IL, USA' },
    'houston': { latitude: 29.7604, longitude: -95.3698, displayName: 'Houston, TX, USA' },
    'miami': { latitude: 25.7617, longitude: -80.1918, displayName: 'Miami, FL, USA' },
    'seattle': { latitude: 47.6062, longitude: -122.3321, displayName: 'Seattle, WA, USA' },
    'san francisco': { latitude: 37.7749, longitude: -122.4194, displayName: 'San Francisco, CA, USA' },
    'denver': { latitude: 39.7392, longitude: -104.9903, displayName: 'Denver, CO, USA' },
    'atlanta': { latitude: 33.7490, longitude: -84.3880, displayName: 'Atlanta, GA, USA' },
    'boston': { latitude: 42.3601, longitude: -71.0589, displayName: 'Boston, MA, USA' },
    'phoenix': { latitude: 33.4484, longitude: -112.0740, displayName: 'Phoenix, AZ, USA' },
    'dallas': { latitude: 32.7767, longitude: -96.7970, displayName: 'Dallas, TX, USA' },
    'orange': { latitude: 33.7879, longitude: -117.8531, displayName: 'Orange, CA, USA' },
    'orange, ca': { latitude: 33.7879, longitude: -117.8531, displayName: 'Orange, CA, USA' },
    'london': { latitude: 51.5074, longitude: -0.1278, displayName: 'London, UK' },
    'paris': { latitude: 48.8566, longitude: 2.3522, displayName: 'Paris, France' },
    'tokyo': { latitude: 35.6762, longitude: 139.6503, displayName: 'Tokyo, Japan' },
    'sydney': { latitude: -33.8688, longitude: 151.2093, displayName: 'Sydney, Australia' },
    'berlin': { latitude: 52.5200, longitude: 13.4050, displayName: 'Berlin, Germany' },
    'rome': { latitude: 41.9028, longitude: 12.4964, displayName: 'Rome, Italy' },
    'madrid': { latitude: 40.4168, longitude: -3.7038, displayName: 'Madrid, Spain' },
    'toronto': { latitude: 43.6532, longitude: -79.3832, displayName: 'Toronto, Canada' },
    'vancouver': { latitude: 49.2827, longitude: -123.1207, displayName: 'Vancouver, Canada' },
    'mexico city': { latitude: 19.4326, longitude: -99.1332, displayName: 'Mexico City, Mexico' },
    'sao paulo': { latitude: -23.5505, longitude: -46.6333, displayName: 'São Paulo, Brazil' },
    'mumbai': { latitude: 19.0760, longitude: 72.8777, displayName: 'Mumbai, India' },
    'beijing': { latitude: 39.9042, longitude: 116.4074, displayName: 'Beijing, China' },
    'shanghai': { latitude: 31.2304, longitude: 121.4737, displayName: 'Shanghai, China' },
  };

  /**
   * Check if location is in the fallback cache
   * @param {string} locationString - Location to look up
   * @returns {Object|null} Cached location or null
   */
  static _checkCache(locationString) {
    const normalized = locationString.toLowerCase().trim();
    return this.LOCATION_CACHE[normalized] || null;
  }

  /**
   * Geocode a location string to coordinates
   * @param {string} locationString - Location name (e.g., "New York, USA")
   * @returns {Promise<Object>} Geocoding result with latitude, longitude, display_name
   * @throws {Error} If geocoding fails
   */
  static async geocode(locationString) {
    if (!locationString || locationString.trim() === '') {
      throw new Error('Location string cannot be empty');
    }

    // Check cache first (for offline support and API failures)
    const cached = this._checkCache(locationString);

    // Rate limiting
    await this._enforceRateLimit();

    try {
      const params = new URLSearchParams({
        q: locationString,
        format: 'json',
        limit: '1',
        addressdetails: '1'
      });

      const response = await fetch(`${this.NOMINATIM_API}?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT
        }
      });

      if (!response.ok) {
        // If API fails but we have cached data, use it
        if (cached) {
          console.warn(`Geocoding API unavailable (${response.status}), using cached location for "${locationString}"`);
          return cached;
        }
        throw new Error(`Geocoding API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        // If no results but we have cached data, use it
        if (cached) {
          console.warn(`No API results for "${locationString}", using cached location`);
          return cached;
        }
        throw new Error(`No results found for location: "${locationString}"`);
      }

      const result = data[0];

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country,
        countryCode: result.address?.country_code
      };
    } catch (error) {
      // If fetch fails entirely (network error) but we have cached data, use it
      if (cached) {
        console.warn(`Geocoding failed (${error.message}), using cached location for "${locationString}"`);
        return cached;
      }
      if (error.message.includes('No results found')) {
        throw error;
      }
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to location name
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>} Location information
   * @throws {Error} If reverse geocoding fails
   */
  static async reverseGeocode(latitude, longitude) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Rate limiting
    await this._enforceRateLimit();

    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country,
        countryCode: result.address?.country_code
      };
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  /**
   * Get timezone offset for coordinates (simple estimation)
   * Note: This is a simple timezone estimation. For production use, consider a dedicated timezone API.
   * @param {number} longitude - Longitude
   * @returns {number} Estimated UTC offset in hours
   */
  static getTimezoneOffset(longitude) {
    // Simple longitude-based timezone estimation
    // Each 15 degrees of longitude ≈ 1 hour of time
    return Math.round(longitude / 15);
  }

  /**
   * Enforce rate limiting (1 request per second for Nominatim)
   * @private
   */
  static async _enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} True if coordinates are valid
   */
  static validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }
}

export default GeocodingService;
