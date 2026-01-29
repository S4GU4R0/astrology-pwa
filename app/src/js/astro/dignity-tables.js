/**
 * @file Comprehensive astrological dignity reference data
 * @module dignity-tables
 * @description Traditional astrological dignity tables including rulerships, exaltations,
 * detriments, falls, triplicities, and Egyptian bounds.
 */

/**
 * Zodiac signs with their corresponding indices
 * @constant {Object}
 */
export const SIGNS = {
  ARIES: 0,
  TAURUS: 1,
  GEMINI: 2,
  CANCER: 3,
  LEO: 4,
  VIRGO: 5,
  LIBRA: 6,
  SCORPIO: 7,
  SAGITTARIUS: 8,
  CAPRICORN: 9,
  AQUARIUS: 10,
  PISCES: 11
};

/**
 * Planetary bodies used in traditional astrology
 * @constant {Object}
 */
export const PLANETS = {
  SUN: 'Sun',
  MOON: 'Moon',
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn'
};

/**
 * Traditional domicile rulerships - which planet rules each zodiac sign
 * @constant {Object}
 */
export const DOMICILE_RULERSHIPS = {
  [SIGNS.ARIES]: PLANETS.MARS,
  [SIGNS.TAURUS]: PLANETS.VENUS,
  [SIGNS.GEMINI]: PLANETS.MERCURY,
  [SIGNS.CANCER]: PLANETS.MOON,
  [SIGNS.LEO]: PLANETS.SUN,
  [SIGNS.VIRGO]: PLANETS.MERCURY,
  [SIGNS.LIBRA]: PLANETS.VENUS,
  [SIGNS.SCORPIO]: PLANETS.MARS,
  [SIGNS.SAGITTARIUS]: PLANETS.JUPITER,
  [SIGNS.CAPRICORN]: PLANETS.SATURN,
  [SIGNS.AQUARIUS]: PLANETS.SATURN,
  [SIGNS.PISCES]: PLANETS.JUPITER
};

/**
 * Exaltation positions with specific degrees
 * @constant {Object}
 */
export const EXALTATIONS = {
  [PLANETS.SUN]: { sign: SIGNS.ARIES, degree: 19 },
  [PLANETS.MOON]: { sign: SIGNS.TAURUS, degree: 3 },
  [PLANETS.MERCURY]: { sign: SIGNS.VIRGO, degree: 15 },
  [PLANETS.VENUS]: { sign: SIGNS.PISCES, degree: 27 },
  [PLANETS.MARS]: { sign: SIGNS.CAPRICORN, degree: 28 },
  [PLANETS.JUPITER]: { sign: SIGNS.CANCER, degree: 15 },
  [PLANETS.SATURN]: { sign: SIGNS.LIBRA, degree: 21 }
};

/**
 * Detriment positions (opposite signs of domicile rulerships)
 * @constant {Object}
 */
export const DETRIMENTS = {
  [PLANETS.SUN]: SIGNS.AQUARIUS,
  [PLANETS.MOON]: SIGNS.CAPRICORN,
  [PLANETS.MERCURY]: SIGNS.SAGITTARIES, // Gemini's opposite & Virgo's opposite
  [PLANETS.VENUS]: SIGNS.ARIES, // Taurus's opposite & Scorpio's opposite (but Scorpio ruled by Mars traditionally)
  [PLANETS.MARS]: SIGNS.LIBRA, // Aries's opposite & Taurus's opposite? Wait, let's clarify
  [PLANETS.JUPITER]: SIGNS.GEMINI,
  [PLANETS.SATURN]: SIGNS.CANCER
};

// Correction for detriments - each planet is in detriment in the sign opposite its domicile
export const DETRIMENTS_CORRECTED = {
  [PLANETS.MARS]: [SIGNS.LIBRA, SIGNS.TAURUS], // Mars rules Aries and Scorpio -> opposite signs are Libra and Taurus
  [PLANETS.VENUS]: [SIGNS.ARIES, SIGNS.SCORPIO], // Venus rules Taurus and Libra -> opposite signs are Scorpio and Aries
  [PLANETS.MERCURY]: [SIGNS.SAGITTARIUS, SIGNS.PISCES], // Mercury rules Gemini and Virgo -> opposite signs are Sagittarius and Pisces
  [PLANETS.MOON]: SIGNS.CAPRICORN, // Moon rules Cancer -> opposite is Capricorn
  [PLANETS.SUN]: SIGNS.AQUARIUS, // Sun rules Leo -> opposite is Aquarius
  [PLANETS.SATURN]: [SIGNS.CANCER, SIGNS.LEO], // Saturn rules Capricorn and Aquarius -> opposite signs are Cancer and Leo
  [PLANETS.JUPITER]: [SIGNS.GEMINI, SIGNS.VIRGO] // Jupiter rules Sagittarius and Pisces -> opposite signs are Gemini and Virgo
};

/**
 * Fall positions (opposite signs of exaltations)
 * @constant {Object}
 */
export const FALLS = {
  [PLANETS.SUN]: SIGNS.LIBRA, // Opposite of Aries
  [PLANETS.MOON]: SIGNS.SCORPIO, // Opposite of Taurus
  [PLANETS.MERCURY]: SIGNS.PISCES, // Opposite of Virgo
  [PLANETS.VENUS]: SIGNS.VIRGO, // Opposite of Pisces
  [PLANETS.MARS]: SIGNS.CANCER, // Opposite of Capricorn
  [PLANETS.JUPITER]: SIGNS.CAPRICORN, // Opposite of Cancer
  [PLANETS.SATURN]: SIGNS.ARIES // Opposite of Libra
};

/**
 * Triplicity rulers by element and sect
 * @constant {Object}
 */
export const TRIPLICITY_RULERS = {
  FIRE: {
    signs: [SIGNS.ARIES, SIGNS.LEO, SIGNS.SAGITTARIUS],
    day: PLANETS.SUN,
    night: PLANETS.JUPITER,
    participating: PLANETS.SATURN
  },
  EARTH: {
    signs: [SIGNS.TAURUS, SIGNS.VIRGO, SIGNS.CAPRICORN],
    day: PLANETS.VENUS,
    night: PLANETS.MOON,
    participating: PLANETS.MARS
  },
  AIR: {
    signs: [SIGNS.GEMINI, SIGNS.LIBRA, SIGNS.AQUARIUS],
    day: PLANETS.SATURN,
    night: PLANETS.MERCURY,
    participating: PLANETS.JUPITER
  },
  WATER: {
    signs: [SIGNS.CANCER, SIGNS.SCORPIO, SIGNS.PISCES],
    day: PLANETS.VENUS,
    night: PLANETS.MARS,
    participating: PLANETS.MOON
  }
};

/**
 * Egyptian bounds (terms) - degree ranges for each planet in each sign
 * Traditional Ptolemaic bounds
 * @constant {Object}
 */
export const EGYPTIAN_BOUNDS = {
  [SIGNS.ARIES]: [
    { start: 0, end: 6, ruler: PLANETS.JUPITER },
    { start: 6, end: 12, ruler: PLANETS.VENUS },
    { start: 12, end: 20, ruler: PLANETS.MERCURY },
    { start: 20, end: 25, ruler: PLANETS.MARS },
    { start: 25, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.TAURUS]: [
    { start: 0, end: 8, ruler: PLANETS.VENUS },
    { start: 8, end: 14, ruler: PLANETS.MERCURY },
    { start: 14, end: 22, ruler: PLANETS.JUPITER },
    { start: 22, end: 27, ruler: PLANETS.SATURN },
    { start: 27, end: 30, ruler: PLANETS.MARS }
  ],
  [SIGNS.GEMINI]: [
    { start: 0, end: 6, ruler: PLANETS.MERCURY },
    { start: 6, end: 12, ruler: PLANETS.JUPITER },
    { start: 12, end: 17, ruler: PLANETS.VENUS },
    { start: 17, end: 24, ruler: PLANETS.MARS },
    { start: 24, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.CANCER]: [
    { start: 0, end: 7, ruler: PLANETS.MARS },
    { start: 7, end: 13, ruler: PLANETS.VENUS },
    { start: 13, end: 19, ruler: PLANETS.MERCURY },
    { start: 19, end: 26, ruler: PLANETS.JUPITER },
    { start: 26, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.LEO]: [
    { start: 0, end: 6, ruler: PLANETS.JUPITER },
    { start: 6, end: 11, ruler: PLANETS.VENUS },
    { start: 11, end: 18, ruler: PLANETS.MERCURY },
    { start: 18, end: 24, ruler: PLANETS.MARS },
    { start: 24, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.VIRGO]: [
    { start: 0, end: 7, ruler: PLANETS.MERCURY },
    { start: 7, end: 17, ruler: PLANETS.VENUS },
    { start: 17, end: 21, ruler: PLANETS.JUPITER },
    { start: 21, end: 28, ruler: PLANETS.MARS },
    { start: 28, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.LIBRA]: [
    { start: 0, end: 6, ruler: PLANETS.SATURN },
    { start: 6, end: 14, ruler: PLANETS.MERCURY },
    { start: 14, end: 21, ruler: PLANETS.JUPITER },
    { start: 21, end: 28, ruler: PLANETS.VENUS },
    { start: 28, end: 30, ruler: PLANETS.MARS }
  ],
  [SIGNS.SCORPIO]: [
    { start: 0, end: 7, ruler: PLANETS.MARS },
    { start: 7, end: 11, ruler: PLANETS.VENUS },
    { start: 11, end: 19, ruler: PLANETS.MERCURY },
    { start: 19, end: 24, ruler: PLANETS.JUPITER },
    { start: 24, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.SAGITTARIUS]: [
    { start: 0, end: 12, ruler: PLANETS.JUPITER },
    { start: 12, end: 17, ruler: PLANETS.VENUS },
    { start: 17, end: 21, ruler: PLANETS.MERCURY },
    { start: 21, end: 26, ruler: PLANETS.MARS },
    { start: 26, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.CAPRICORN]: [
    { start: 0, end: 7, ruler: PLANETS.MERCURY },
    { start: 7, end: 14, ruler: PLANETS.JUPITER },
    { start: 14, end: 22, ruler: PLANETS.VENUS },
    { start: 22, end: 26, ruler: PLANETS.MARS },
    { start: 26, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.AQUARIUS]: [
    { start: 0, end: 7, ruler: PLANETS.MERCURY },
    { start: 7, end: 13, ruler: PLANETS.VENUS },
    { start: 13, end: 20, ruler: PLANETS.JUPITER },
    { start: 20, end: 25, ruler: PLANETS.MARS },
    { start: 25, end: 30, ruler: PLANETS.SATURN }
  ],
  [SIGNS.PISCES]: [
    { start: 0, end: 12, ruler: PLANETS.VENUS },
    { start: 12, end: 16, ruler: PLANETS.JUPITER },
    { start: 16, end: 19, ruler: PLANETS.MERCURY },
    { start: 19, end: 28, ruler: PLANETS.MARS },
    { start: 28, end: 30, ruler: PLANETS.SATURN }
  ]
};

/**
 * Get the ruling planet for a specific zodiac sign
 * @param {number} signIndex - The sign index (0-11)
 * @returns {string} The ruling planet
 */
export function getDomicileRuler(signIndex) {
  return DOMICILE_RULERSHIPS[signIndex];
}

/**
 * Get the exaltation information for a specific planet
 * @param {string} planet - The planet name
 * @returns {Object} Exaltation details {sign, degree}
 */
export function getExaltation(planet) {
  return EXALTATIONS[planet];
}

/**
 * Get the detriment signs for a specific planet
 * @param {string} planet - The planet name
 * @returns {number|Array} Sign index or array of sign indices
 */
export function getDetriment(planet) {
  return DETRIMENTS_CORRECTED[planet];
}

/**
 * Get the fall sign for a specific planet
 * @param {string} planet - The planet name
 * @returns {number} Sign index
 */
export function getFall(planet) {
  return FALLS[planet];
}

/**
 * Get triplicity rulers for a specific element
 * @param {string} element - The element (FIRE, EARTH, AIR, WATER)
 * @returns {Object} Triplicity rulers {day, night, participating}
 */
export function getTriplicityRulers(element) {
  return TRIPLICITY_RULERS[element];
}

/**
 * Get Egyptian bounds for a specific zodiac sign
 * @param {number} signIndex - The sign index (0-11)
 * @returns {Array} Array of bound objects
 */
export function getEgyptianBounds(signIndex) {
  return EGYPTIAN_BOUNDS[signIndex];
}

/**
 * Find the bound ruler for a specific degree in a sign
 * @param {number} signIndex - The sign index (0-11)
 * @param {number} degree - The degree (0-29.999...)
 * @returns {string} The bound ruling planet
 */
export function getBoundRuler(signIndex, degree) {
  const bounds = EGYPTIAN_BOUNDS[signIndex];
  for (const bound of bounds) {
    if (degree >= bound.start && degree < bound.end) {
      return bound.ruler;
    }
  }
  return null;
}

export default {
  SIGNS,
  PLANETS,
  DOMICILE_RULERSHIPS,
  EXALTATIONS,
  DETRIMENTS: DETRIMENTS_CORRECTED,
  FALLS,
  TRIPLICITY_RULERS,
  EGYPTIAN_BOUNDS,
  getDomicileRuler,
  getExaltation,
  getDetriment,
  getFall,
  getTriplicityRulers,
  getEgyptianBounds,
  getBoundRuler
};
