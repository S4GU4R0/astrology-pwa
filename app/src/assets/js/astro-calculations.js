/**
 * @file Astrological calculations engine
 * @module astro-calculations
 * @description Core calculations for planetary positions and astrological factors
 * Uses astronomy-engine for astronomical calculations
 */

// Note: astronomy-engine will be imported via script tag in HTML
// Access via global Astronomy object

/**
 * Calculate planetary positions for a given date, time, and location
 * @param {Date} date - Birth date and time
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @returns {Object} Planetary positions in ecliptic longitude (0-360 degrees)
 */
export function calculatePlanetaryPositions(date, latitude, longitude) {
  if (typeof Astronomy === 'undefined') {
    throw new Error('Astronomy engine not loaded. Include astronomy-engine library.');
  }

  try {
    // Convert JS Date to AstroTime
    const time = new Astronomy.AstroTime(date);
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const positions = {};

    // Calculate positions for the 7 traditional planets
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planetName of planets) {
      // astronomy-engine expects capitalized body names
      const body = planetName; // Use as-is: 'Sun', 'Moon', etc.

      // Get geocentric vector position
      const vector = Astronomy.GeoVector(body, time, true); // true = apply aberration correction

      // Convert to ecliptic coordinates
      const ecliptic = Astronomy.Ecliptic(vector);

      // Convert to 360-degree longitude
      let longitude = ecliptic.elon;
      if (longitude < 0) longitude += 360;

      positions[planetName] = {
        longitude: longitude,
        latitude: ecliptic.elat,
        distance: vector.Length()
      };
    }

    return positions;
  } catch (error) {
    throw new Error(`Failed to calculate planetary positions: ${error.message}`);
  }
}

/**
 * Calculate planetary velocity (speed) and direction
 * @param {string} planetName - Name of planet
 * @param {Date} date - Date and time
 * @returns {Object} Speed and direction information
 */
export function calculatePlanetaryMotion(planetName, date) {
  if (typeof Astronomy === 'undefined') {
    throw new Error('Astronomy engine not loaded.');
  }

  try {
    // astronomy-engine expects capitalized body names
    const body = planetName; // Use as-is: 'Sun', 'Moon', etc.

    // Convert dates to AstroTime
    const time1 = new Astronomy.AstroTime(date);
    const futureDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const time2 = new Astronomy.AstroTime(futureDate);

    // Calculate position now and 1 day later
    const vec1 = Astronomy.GeoVector(body, time1, true);
    const vec2 = Astronomy.GeoVector(body, time2, true);
    const pos1 = Astronomy.Ecliptic(vec1);
    const pos2 = Astronomy.Ecliptic(vec2);

    // Calculate daily motion
    let motion = pos2.elon - pos1.elon;

    // Handle 360-degree wraparound
    if (motion > 180) motion -= 360;
    if (motion < -180) motion += 360;

    const isRetrograde = motion < 0;
    const speed = Math.abs(motion);

    // Average speeds for comparison (degrees per day)
    const averageSpeeds = {
      'Sun': 0.9856,
      'Moon': 13.176,
      'Mercury': 1.383,
      'Venus': 1.602,
      'Mars': 0.524,
      'Jupiter': 0.083,
      'Saturn': 0.034
    };

    const avgSpeed = averageSpeeds[planetName] || 1.0;
    const isFast = speed > avgSpeed * 1.1; // 10% above average
    const isSlow = speed < avgSpeed * 0.9; // 10% below average

    return {
      direction: isRetrograde ? 'Retrograde' : 'Direct',
      speed: speed,
      speedCategory: isFast ? 'Fast' : (isSlow ? 'Slow' : 'Average'),
      dailyMotion: motion
    };
  } catch (error) {
    throw new Error(`Failed to calculate planetary motion: ${error.message}`);
  }
}

/**
 * Calculate ascendant (rising sign) for a given time and location
 * @param {Date} date - Date and time
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @returns {number} Ascendant longitude in degrees (0-360)
 */
export function calculateAscendant(date, latitude, longitude) {
  if (typeof Astronomy === 'undefined') {
    throw new Error('Astronomy engine not loaded.');
  }

  try {
    const time = new Astronomy.AstroTime(date);
    const observer = new Astronomy.Observer(latitude, longitude, 0);

    // Calculate sidereal time
    const gast = Astronomy.SiderealTime(time);
    const localSiderealTime = (gast + longitude / 15) % 24;
    const lst = localSiderealTime * 15; // Convert to degrees

    // Calculate obliquity of ecliptic
    const obliquity = 23.4397; // Mean obliquity, can be refined

    // Calculate RAMC (Right Ascension of Midheaven)
    const ramc = lst;

    // Calculate Ascendant using Placidus formula (simplified)
    // This is a basic approximation. For production, use a proper house system library
    const latRad = latitude * Math.PI / 180;
    const obliqRad = obliquity * Math.PI / 180;
    const ramcRad = ramc * Math.PI / 180;

    const y = Math.sin(ramcRad) * Math.cos(obliqRad);
    const x = Math.cos(ramcRad);
    const asc = Math.atan2(y, x) * 180 / Math.PI;

    let ascendant = asc + 180; // Adjust for proper quadrant
    if (ascendant < 0) ascendant += 360;
    if (ascendant >= 360) ascendant -= 360;

    return ascendant;
  } catch (error) {
    // Fallback: approximate ascendant based on time
    const hour = date.getHours() + date.getMinutes() / 60;
    return (hour * 15) % 360; // Rough approximation
  }
}

/**
 * Calculate house cusps using simplified equal house system
 * @param {number} ascendant - Ascendant degree (0-360)
 * @returns {Array<number>} Array of 12 house cusp longitudes
 */
export function calculateHouseCusps(ascendant) {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    let cusp = ascendant + (i * 30);
    if (cusp >= 360) cusp -= 360;
    houses.push(cusp);
  }
  return houses;
}

/**
 * Convert longitude to zodiac sign and degree
 * @param {number} longitude - Ecliptic longitude (0-360)
 * @returns {Object} Sign name and degree within sign
 */
export function longitudeToSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;

  return {
    sign: signs[signIndex],
    signIndex: signIndex,
    degree: degreeInSign,
    formattedPosition: `${signs[signIndex]} ${Math.floor(degreeInSign)}°${Math.floor((degreeInSign % 1) * 60)}'`
  };
}

/**
 * Determine chart sect (diurnal or nocturnal)
 * @param {Object} positions - Planetary positions object
 * @param {number} ascendant - Ascendant degree
 * @returns {string} 'Diurnal' or 'Nocturnal'
 */
export function calculateSect(positions, ascendant) {
  const sunLongitude = positions.Sun.longitude;

  // Calculate if Sun is above or below horizon
  // Sun is above horizon if it's in houses 7-12 (western hemisphere of chart)
  const descendant = (ascendant + 180) % 360;

  // Check if Sun is between Ascendant and Descendant going clockwise
  const sunRelativePosition = (sunLongitude - ascendant + 360) % 360;

  // If Sun is in the upper half of the chart (houses 7-12), it's a day chart
  const isDayChart = sunRelativePosition >= 180;

  return isDayChart ? 'Diurnal' : 'Nocturnal';
}

/**
 * Check if a planet is combust (too close to the Sun)
 * @param {number} planetLongitude - Planet's ecliptic longitude
 * @param {number} sunLongitude - Sun's ecliptic longitude
 * @returns {Object} Combustion status
 */
export function checkCombustion(planetLongitude, sunLongitude) {
  const separation = Math.abs(((planetLongitude - sunLongitude + 540) % 360) - 180);

  return {
    isCombust: separation <= 8.5, // Within 8.5 degrees
    isCazimi: separation <= 0.283, // Within 17 arcminutes (0.283 degrees)
    isUnderBeams: separation <= 15, // Within 15 degrees
    separation: separation,
    visibility: separation > 15 ? 'Visible' :
                (separation <= 0.283 ? 'Cazimi' :
                 (separation <= 8.5 ? 'Combust' : 'Under Beams'))
  };
}

/**
 * Detect if a planet is stationary (about to change direction)
 * @param {string} planetName - Name of planet
 * @param {Date} date - Date and time
 * @returns {Object} Stationary status
 */
export function checkStationary(planetName, date) {
  if (typeof Astronomy === 'undefined') {
    throw new Error('Astronomy engine not loaded.');
  }

  try {
    const body = planetName;

    // Check motion over 3 time periods: 1 day ago, now, 1 day from now
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const time1 = new Astronomy.AstroTime(yesterday);
    const time2 = new Astronomy.AstroTime(date);
    const time3 = new Astronomy.AstroTime(tomorrow);

    const vec1 = Astronomy.GeoVector(body, time1, true);
    const vec2 = Astronomy.GeoVector(body, time2, true);
    const vec3 = Astronomy.GeoVector(body, time3, true);

    const pos1 = Astronomy.Ecliptic(vec1);
    const pos2 = Astronomy.Ecliptic(vec2);
    const pos3 = Astronomy.Ecliptic(vec3);

    // Calculate motion for each day
    let motion1to2 = pos2.elon - pos1.elon;
    let motion2to3 = pos3.elon - pos2.elon;

    // Handle 360-degree wraparound
    if (motion1to2 > 180) motion1to2 -= 360;
    if (motion1to2 < -180) motion1to2 += 360;
    if (motion2to3 > 180) motion2to3 -= 360;
    if (motion2to3 < -180) motion2to3 += 360;

    // Check if motion is changing sign (stationing)
    const isStationary = (motion1to2 * motion2to3) < 0; // Sign change
    const stationaryThreshold = 0.01; // Very slow motion (degrees per day)
    const isNearStationary = Math.abs(motion2to3) < stationaryThreshold;

    let stationType = null;
    if (isStationary || isNearStationary) {
      if (motion2to3 >= 0 && motion1to2 < 0) {
        stationType = 'Direct Station'; // Turning direct
      } else if (motion2to3 < 0 && motion1to2 >= 0) {
        stationType = 'Retrograde Station'; // Turning retrograde
      }
    }

    return {
      isStationary: isStationary || isNearStationary,
      stationType: stationType,
      dailyMotion: motion2to3
    };
  } catch (error) {
    return {
      isStationary: false,
      stationType: null,
      dailyMotion: 0
    };
  }
}

/**
 * Calculate comprehensive solar phase data for a planet
 * @param {string} planetName - Name of planet
 * @param {Date} date - Date and time
 * @param {number} planetLongitude - Planet's ecliptic longitude
 * @param {number} sunLongitude - Sun's ecliptic longitude
 * @returns {Object} Complete solar phase information
 */
export function calculateCompleteSolarPhase(planetName, date, planetLongitude, sunLongitude) {
  // Get motion data
  const motion = calculatePlanetaryMotion(planetName, date);

  // Get combustion/visibility data
  const combustion = checkCombustion(planetLongitude, sunLongitude);

  // Get morning/evening star status (for Mercury and Venus)
  const morningEvening = (planetName === 'Mercury' || planetName === 'Venus') ?
    determineMorningEvening(planetLongitude, sunLongitude) : 'N/A';

  // Check if stationary
  const stationary = checkStationary(planetName, date);

  // Determine final direction including stationary
  let direction = motion.direction;
  if (stationary.isStationary) {
    direction = stationary.stationType || 'Stationary';
  }

  return {
    direction: direction,
    isRetrograde: motion.direction === 'Retrograde',
    isDirect: motion.direction === 'Direct',
    isStationary: stationary.isStationary,
    stationType: stationary.stationType,
    speed: motion.speed,
    speedCategory: motion.speedCategory,
    dailyMotion: motion.dailyMotion,
    visibility: combustion.visibility,
    isCombust: combustion.isCombust,
    isCazimi: combustion.isCazimi,
    isUnderBeams: combustion.isUnderBeams,
    separationFromSun: combustion.separation,
    morningEveningStar: morningEvening
  };
}

/**
 * Determine if a planet is morning or evening star (for Mercury and Venus)
 * @param {number} planetLongitude - Planet's ecliptic longitude
 * @param {number} sunLongitude - Sun's ecliptic longitude
 * @returns {string} 'Morning Star', 'Evening Star', or 'N/A'
 */
export function determineMorningEvening(planetLongitude, sunLongitude) {
  const diff = (planetLongitude - sunLongitude + 360) % 360;

  // If planet is ahead of Sun (eastern), it's evening star
  // If planet is behind Sun (western), it's morning star
  if (diff > 0 && diff < 180) {
    return 'Evening Star';
  } else if (diff >= 180) {
    return 'Morning Star';
  }

  return 'None';
}

/**
 * Complete planetary data calculation for a birth chart
 * @param {Date} birthDate - Birth date and time
 * @param {number} latitude - Birth location latitude
 * @param {number} longitude - Birth location longitude
 * @returns {Object} Complete chart data
 */
export async function calculateCompleteChart(birthDate, latitude, longitude) {
  try {
    // Calculate basic positions
    const positions = calculatePlanetaryPositions(birthDate, latitude, longitude);
    const ascendant = calculateAscendant(birthDate, latitude, longitude);
    const houses = calculateHouseCusps(ascendant);
    const sect = calculateSect(positions, ascendant);

    // Add motion data for each planet
    const planetsWithMotion = {};

    for (const [planetName, posData] of Object.entries(positions)) {
      const motion = calculatePlanetaryMotion(planetName, birthDate);
      const signInfo = longitudeToSign(posData.longitude);

      let combustion = null;
      let morningEvening = 'N/A';

      if (planetName !== 'Sun') {
        combustion = checkCombustion(posData.longitude, positions.Sun.longitude);

        if (planetName === 'Mercury' || planetName === 'Venus') {
          morningEvening = determineMorningEvening(posData.longitude, positions.Sun.longitude);
        }
      }

      planetsWithMotion[planetName] = {
        ...posData,
        ...motion,
        ...signInfo,
        combustion,
        morningEvening
      };
    }

    return {
      date: birthDate,
      location: { latitude, longitude },
      ascendant,
      houses,
      sect,
      planets: planetsWithMotion
    };
  } catch (error) {
    throw new Error(`Failed to calculate complete chart: ${error.message}`);
  }
}

// Import dignity tables (note: add this at top of file if not already there)
// import { SIGNS, PLANETS, DOMICILE_RULERSHIPS, EXALTATIONS, DETRIMENTS, FALLS, TRIPLICITY_RULERS, getBoundRuler } from './dignity-tables.js';

/**
 * Calculate essential dignities for a planet at a specific longitude
 * @param {string} planetName - Name of the planet ('Sun', 'Moon', etc.)
 * @param {number} longitude - Ecliptic longitude in degrees (0-360)
 * @param {Object} dignityTables - Dignity tables object (optional, for testing)
 * @returns {Object} Object indicating dignities with 'Yes'/'No' values
 */
export function calculateEssentialDignities(planetName, longitude, dignityTables = null) {
  // This function requires dignity-tables.js to be imported
  // For now, return placeholder values
  // TODO: Import dignity-tables.js and implement full logic

  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;

  return {
    domicile: 'No',
    exaltation: 'No',
    detriment: 'No',
    fall: 'No',
    triplicity: 'No', // Note: Requires sect to determine
    bound: 'No',
    mutualReception: 'No'
  };
}

/**
 * Calculate the triplicity ruler for a sign based on sect (day/night chart)
 * @param {number} signIndex - Index of the sign (0-11)
 * @param {boolean} isDayChart - True if daytime chart, false if nighttime
 * @returns {string} Name of the triplicity ruler planet
 */
export function calculateTriplicityRuler(signIndex, isDayChart) {
  // Map sign index to element
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  const elementIndex = signIndex % 4; // 0=fire, 1=earth, 2=air, 3=water

  // Traditional triplicity rulers
  const triplicityRulers = {
    'Fire': { day: 'Sun', night: 'Jupiter', participating: 'Saturn' },
    'Earth': { day: 'Venus', night: 'Moon', participating: 'Mars' },
    'Air': { day: 'Saturn', night: 'Mercury', participating: 'Jupiter' },
    'Water': { day: 'Venus', night: 'Mars', participating: 'Moon' }
  };

  const element = elements[elementIndex];
  const rulers = triplicityRulers[element];

  return isDayChart ? rulers.day : rulers.night;
}

/**
 * Calculate the bound/term ruler for a specific degree of longitude
 * @param {number} longitude - Ecliptic longitude in degrees (0-360)
 * @returns {string} Name of the bound ruler planet
 */
export function calculateBoundRuler(longitude) {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;

  // TODO: Implement using getBoundRuler from dignity-tables.js
  return 'Unknown';
}

/**
 * Check if two planets are in mutual reception
 * @param {string} planet1 - First planet name
 * @param {number} sign1 - Sign index (0-11) of first planet
 * @param {string} planet2 - Second planet name
 * @param {number} sign2 - Sign index (0-11) of second planet
 * @returns {string} 'Yes' if mutual reception exists, 'No' otherwise
 */
export function checkMutualReception(planet1, sign1, planet2, sign2) {
  // Domicile rulers (traditional)
  const domicileRulers = [
    'Mars',    // 0 - Aries
    'Venus',   // 1 - Taurus
    'Mercury', // 2 - Gemini
    'Moon',    // 3 - Cancer
    'Sun',     // 4 - Leo
    'Mercury', // 5 - Virgo
    'Venus',   // 6 - Libra
    'Mars',    // 7 - Scorpio
    'Jupiter', // 8 - Sagittarius
    'Saturn',  // 9 - Capricorn
    'Saturn',  // 10 - Aquarius
    'Jupiter'  // 11 - Pisces
  ];

  const rulerOfSign1 = domicileRulers[sign1];
  const rulerOfSign2 = domicileRulers[sign2];

  return (rulerOfSign1 === planet2 && rulerOfSign2 === planet1) ? 'Yes' : 'No';
}

/**
 * Calculate the angular separation between two longitudes
 * @param {number} longitude1 - First longitude (0-360)
 * @param {number} longitude2 - Second longitude (0-360)
 * @returns {number} Separation in degrees (0-180)
 */
export function calculateSeparation(longitude1, longitude2) {
  let diff = Math.abs(longitude1 - longitude2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Get aspect type information
 * @returns {Array} Array of aspect definitions
 */
export function getAspectTypes() {
  return [
    { name: 'Conjunction', degrees: 0, orb: 8, nature: 'neutral' },
    { name: 'Opposition', degrees: 180, orb: 8, nature: 'hard' },
    { name: 'Trine', degrees: 120, orb: 8, nature: 'soft' },
    { name: 'Square', degrees: 90, orb: 8, nature: 'hard' },
    { name: 'Sextile', degrees: 60, orb: 6, nature: 'soft' }
  ];
}

/**
 * Calculate a specific aspect between two positions
 * @param {number} longitude1 - First planet's longitude (0-360)
 * @param {number} longitude2 - Second planet's longitude (0-360)
 * @param {number} aspectDegrees - Aspect angle (0, 60, 90, 120, 180)
 * @param {number} orb - Maximum orb in degrees
 * @returns {Object|null} Aspect data if within orb, null otherwise
 */
export function calculateAspect(longitude1, longitude2, aspectDegrees, orb) {
  // Calculate the actual angular distance
  let diff = Math.abs(longitude1 - longitude2);
  if (diff > 180) diff = 360 - diff;

  // Calculate how far off from exact aspect
  const deviation = Math.abs(diff - aspectDegrees);

  // Check if within orb
  if (deviation <= orb) {
    return {
      separation: diff,
      exactDegrees: aspectDegrees,
      orb: deviation,
      isExact: deviation < 1.0, // Within 1 degree is considered "exact"
      isWithinOrb: true
    };
  }

  return null;
}

/**
 * Determine if an aspect is applying or separating
 * @param {number} planet1Motion - Daily motion of first planet (degrees/day)
 * @param {number} planet2Motion - Daily motion of second planet (degrees/day)
 * @param {number} currentOrb - Current orb of the aspect
 * @param {number} longitude1 - First planet's longitude
 * @param {number} longitude2 - Second planet's longitude
 * @returns {string} 'Applying', 'Separating', or 'Stationary'
 */
export function determineAspectDirection(planet1Motion, planet2Motion, currentOrb, longitude1, longitude2) {
  // If either planet is stationary or moving very slowly, it's hard to determine
  if (Math.abs(planet1Motion) < 0.01 && Math.abs(planet2Motion) < 0.01) {
    return 'Stationary';
  }

  // Calculate relative motion (how fast planets are moving toward/away from each other)
  // Positive relative motion means getting closer
  const relativeMotion = planet1Motion - planet2Motion;

  // Calculate future positions (1 day ahead)
  const futureLon1 = (longitude1 + planet1Motion + 360) % 360;
  const futureLon2 = (longitude2 + planet2Motion + 360) % 360;

  // Calculate future separation
  let futureDiff = Math.abs(futureLon1 - futureLon2);
  if (futureDiff > 180) futureDiff = 360 - futureDiff;

  // Calculate current separation
  let currentDiff = Math.abs(longitude1 - longitude2);
  if (currentDiff > 180) currentDiff = 360 - currentDiff;

  // If separation is decreasing, aspect is applying
  if (futureDiff < currentDiff) {
    return 'Applying';
  } else if (futureDiff > currentDiff) {
    return 'Separating';
  }

  return 'Stationary';
}

/**
 * Calculate all aspects between planets in a chart
 * @param {Object} planetPositions - Object with planet names as keys and position data as values
 * @param {Date} date - Date for calculating motion (to determine applying/separating)
 * @returns {Array} Array of aspect objects
 */
export function calculateAllAspects(planetPositions, date) {
  const aspects = [];
  const aspectTypes = getAspectTypes();
  const planetNames = Object.keys(planetPositions);

  // Compare each planet with every other planet
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1Name = planetNames[i];
      const planet2Name = planetNames[j];
      const planet1Data = planetPositions[planet1Name];
      const planet2Data = planetPositions[planet2Name];

      const lon1 = planet1Data.longitude;
      const lon2 = planet2Data.longitude;

      // Calculate motion for applying/separating determination
      let motion1 = 0;
      let motion2 = 0;

      try {
        const motionData1 = calculatePlanetaryMotion(planet1Name, date);
        const motionData2 = calculatePlanetaryMotion(planet2Name, date);
        motion1 = motionData1.dailyMotion;
        motion2 = motionData2.dailyMotion;
      } catch (e) {
        // If motion calculation fails, just use 0
      }

      // Check each aspect type
      for (const aspectType of aspectTypes) {
        const aspect = calculateAspect(lon1, lon2, aspectType.degrees, aspectType.orb);

        if (aspect) {
          const direction = determineAspectDirection(motion1, motion2, aspect.orb, lon1, lon2);

          aspects.push({
            planet1: planet1Name,
            planet2: planet2Name,
            aspectType: aspectType.name,
            aspectDegrees: aspectType.degrees,
            nature: aspectType.nature,
            separation: aspect.separation,
            orb: aspect.orb,
            isExact: aspect.isExact,
            direction: direction,
            isApplying: direction === 'Applying',
            isSeparating: direction === 'Separating'
          });
        }
      }
    }
  }

  return aspects;
}

/**
 * Get all aspects for a specific planet
 * @param {string} planetName - Name of the planet
 * @param {Array} allAspects - Array of all aspects from calculateAllAspects()
 * @returns {Array} Array of aspects involving this planet
 */
export function getAspectsForPlanet(planetName, allAspects) {
  return allAspects.filter(aspect =>
    aspect.planet1 === planetName || aspect.planet2 === planetName
  );
}

/**
 * Categorize aspects by benefic/malefic for testimony calculation
 * @param {Array} aspects - Array of aspects
 * @param {string} targetPlanet - Planet to analyze testimony for
 * @returns {Object} Favorable and unfavorable aspects
 */
export function categorizeAspectTestimony(aspects, targetPlanet) {
  const beneficPlanets = ['Venus', 'Jupiter'];
  const maleficPlanets = ['Mars', 'Saturn'];
  const softAspects = ['Trine', 'Sextile'];
  const hardAspects = ['Square', 'Opposition'];

  const favorable = [];
  const unfavorable = [];

  for (const aspect of aspects) {
    // Skip conjunctions for testimony (they're neutral/complex)
    if (aspect.aspectType === 'Conjunction') {
      continue;
    }

    // Determine the other planet in the aspect
    const otherPlanet = aspect.planet1 === targetPlanet ? aspect.planet2 : aspect.planet1;

    // Benefic planets with soft aspects = favorable
    // Benefic planets with hard aspects = less favorable/neutral
    // Malefic planets with hard aspects = unfavorable
    // Malefic planets with soft aspects = less unfavorable/neutral

    if (beneficPlanets.includes(otherPlanet) && softAspects.includes(aspect.aspectType)) {
      favorable.push(aspect);
    } else if (maleficPlanets.includes(otherPlanet) && hardAspects.includes(aspect.aspectType)) {
      unfavorable.push(aspect);
    } else if (beneficPlanets.includes(otherPlanet) && hardAspects.includes(aspect.aspectType)) {
      // Benefic hard aspects are neutral/mixed
      // Could add a "neutral" category if needed
    } else if (maleficPlanets.includes(otherPlanet) && softAspects.includes(aspect.aspectType)) {
      // Malefic soft aspects are neutral/mixed
    }
  }

  return {
    favorable,
    unfavorable,
    favorableCount: favorable.length,
    unfavorableCount: unfavorable.length
  };
}

/**
 * Calculate sect-based benefic/malefic classification for a planet
 * @param {string} planetName - Name of the planet
 * @param {string} sect - Chart sect ('Diurnal' or 'Nocturnal')
 * @returns {Object} Sect benefic/malefic status and alignment
 */
export function calculateSectBeneficMalefic(planetName, sect) {
  const diurnalSectPlanets = ['Sun', 'Jupiter', 'Saturn'];
  const diurnalContrary = ['Mars'];
  const nocturnalSectPlanets = ['Moon', 'Venus', 'Mars'];
  const nocturnalContrary = ['Saturn'];

  let isSectBenefic = false;
  let isSectMalefic = false;
  let sectAlignment = 'Neutral';

  if (sect === 'Diurnal') {
    if (diurnalSectPlanets.includes(planetName)) {
      isSectBenefic = true;
      sectAlignment = 'Sect';
    } else if (diurnalContrary.includes(planetName)) {
      isSectMalefic = true;
      sectAlignment = 'Contrary';
    }
  } else if (sect === 'Nocturnal') {
    if (nocturnalSectPlanets.includes(planetName)) {
      isSectBenefic = true;
      sectAlignment = 'Sect';
    } else if (nocturnalContrary.includes(planetName)) {
      isSectMalefic = true;
      sectAlignment = 'Contrary';
    }
  }

  return { isSectBenefic, isSectMalefic, sectAlignment };
}

/**
 * Calculate rejoicing conditions for a planet
 * @param {string} planetName - Name of the planet
 * @param {Object} planetData - Planet data with longitude
 * @param {string} chartSect - Chart sect ('Diurnal' or 'Nocturnal')
 * @param {number} ascendant - Ascendant degree
 * @returns {Object} Rejoicing status and conditions
 */
export function calculateRejoicing(planetName, planetData, chartSect, ascendant) {
  const rejoicingHouses = {
    'Mercury': 1,
    'Moon': 3,
    'Venus': 5,
    'Mars': 6,
    'Sun': 9,
    'Jupiter': 11,
    'Saturn': 12
  };

  const rejoicingConditions = [];

  if (rejoicingHouses.hasOwnProperty(planetName)) {
    const targetHouse = rejoicingHouses[planetName];
    const planetLongitude = planetData.longitude;
    const houseStart = (ascendant + (targetHouse - 1) * 30) % 360;
    const houseEnd = (houseStart + 30) % 360;

    let isInHouse = false;
    if (houseStart < houseEnd) {
      isInHouse = planetLongitude >= houseStart && planetLongitude < houseEnd;
    } else {
      isInHouse = planetLongitude >= houseStart || planetLongitude < houseEnd;
    }

    if (isInHouse) {
      rejoicingConditions.push(`Rejoices in house ${targetHouse}`);
    }
  }

  return {
    isRejoicing: rejoicingConditions.length > 0,
    rejoicingConditions
  };
}

/**
 * Calculate overall testimony for a planet based on aspects and sect
 * @param {string} planetName - Name of the planet
 * @param {Array} aspects - Array of all aspects in the chart
 * @param {string} chartSect - Chart sect ('Diurnal' or 'Nocturnal')
 * @returns {Object} Testimony classification, score, and details
 */
export function calculateOverallTestimony(planetName, aspects, chartSect) {
  const sectInfo = calculateSectBeneficMalefic(planetName, chartSect);

  // Get favorable/unfavorable aspects for this planet
  const planetAspects = getAspectsForPlanet(planetName, aspects);
  const testimony = categorizeAspectTestimony(planetAspects, planetName);

  const favorableCount = testimony.favorableCount;
  const unfavorableCount = testimony.unfavorableCount;

  // Calculate score: favorable aspects add points, unfavorable subtract
  let score = favorableCount - unfavorableCount;

  // Sect alignment adjusts score
  if (sectInfo.isSectBenefic) {
    score += 1;
  } else if (sectInfo.isSectMalefic) {
    score -= 1;
  }

  // Determine overall testimony classification
  let testimonyClassification = 'None';
  if (favorableCount > 0 && unfavorableCount === 0) {
    testimonyClassification = 'Favorable';
  } else if (unfavorableCount > 0 && favorableCount === 0) {
    testimonyClassification = 'Unfavorable';
  } else if (favorableCount > 0 && unfavorableCount > 0) {
    testimonyClassification = 'Mixed';
  }

  const details = {
    favorableAspects: favorableCount,
    unfavorableAspects: unfavorableCount,
    sectAlignment: sectInfo.sectAlignment,
    sectBonus: sectInfo.isSectBenefic ? 1 : (sectInfo.isSectMalefic ? -1 : 0)
  };

  return { testimony: testimonyClassification, score, details };
}

export default {
  calculatePlanetaryPositions,
  calculatePlanetaryMotion,
  calculateAscendant,
  calculateHouseCusps,
  longitudeToSign,
  calculateSect,
  checkCombustion,
  checkStationary,
  calculateCompleteSolarPhase,
  determineMorningEvening,
  calculateCompleteChart,
  calculateEssentialDignities,
  calculateTriplicityRuler,
  calculateBoundRuler,
  checkMutualReception,
  calculateSeparation,
  getAspectTypes,
  calculateAspect,
  determineAspectDirection,
  calculateAllAspects,
  getAspectsForPlanet,
  categorizeAspectTestimony,
  calculateSectBeneficMalefic,
  calculateRejoicing,
  calculateOverallTestimony
};
