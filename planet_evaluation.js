
// planet-evaluation.js
/**
 * Planetary Condition Evaluation System
 * Based on traditional astrological principles for assessing planet conditions
 * @version 1.0
 */

/**
 * Main class for managing planetary evaluations for a client's chart
 * Handles client data and multiple planet assessments
 */
class PlanetEvaluation {
  /**
   * Creates a new planetary evaluation instance
   * @param {string} clientName - Name of the client being evaluated
   * @param {string} chartSect - Chart sect: 'Diurnal' (day chart) or 'Nocturnal' (night chart)
   */
  constructor(clientName, chartSect) {
    this.clientName = clientName;
    this.chartSect = chartSect; // 'Diurnal' or 'Nocturnal'
    this.planets = {};
  }

  /**
   * Adds a planet with its complete set of evaluation data
   * @param {string} planetName - Name of the planet (e.g., 'Mars', 'Venus', 'Sun')
   * @param {Object} data - Complete planetary condition data object
   * @returns {void}
   */
  addPlanet(planetName, data) {
    this.planets[planetName] = {
      nature: data.nature, // Benefic/Malefic/Common/Luminary
      sect: data.sect, // Day/Night + Same/Contrary
      rejoicing: data.rejoicing,
      lords: data.lords,
      essentialDignity: data.essentialDignity,
      solarPhase: data.solarPhase,
      lunarAspects: data.lunarAspects,
      testimony: data.testimony,
      conditionOfDomicileLord: data.conditionOfDomicileLord,
      judgmentGrade: data.judgmentGrade
    };
  }

  /**
   * Retrieves evaluation data for a specific planet
   * @param {string} planetName - Name of the planet to retrieve
   * @returns {Object|null} Planet data object or null if not found
   */
  getPlanet(planetName) {
    return this.planets[planetName] || null;
  }

  /**
   * Gets all planets that have been added to the evaluation
   * @returns {Object} Object containing all planet data
   */
  getAllPlanets() {
    return this.planets;
  }

  /**
   * Calculates the score and grade for a specific planet
   * @param {string} planetName - Name of the planet to evaluate
   * @returns {Object|null} Scoring results or null if planet not found
   */
  calculatePlanetScore(planetName) {
    const planetData = this.planets[planetName];
    if (!planetData) {
      console.warn(`Planet '${planetName}' not found in evaluation data`);
      return null;
    }
    
    return ScoringSystem.calculateScore(planetData);
  }

  /**
   * Calculates scores for all planets in the evaluation
   * @returns {Object} Object containing scoring results for each planet
   */
  calculateAllScores() {
    const scores = {};
    for (const planetName in this.planets) {
      scores[planetName] = this.calculatePlanetScore(planetName);
    }
    return scores;
  }
}

/**
 * Handles the scoring logic and grade determination for planetary conditions
 * Uses weighted scoring system based on traditional astrological principles
 */
class ScoringSystem {
  /**
   * Calculates a comprehensive score based on all planetary condition factors
   * @param {Object} planetData - Complete planet evaluation data
   * @returns {Object} Scoring results including raw score, normalized score, grade, and factors
   */
  static calculateScore(planetData) {
    let score = 0;
    let factors = [];

    // Nature scoring: Planetary inherent nature affects condition
    if (planetData.nature === 'Benefic') {
      score += 2;
      factors.push('Benefic nature: +2');
    }
    if (planetData.nature === 'Luminary') {
      score += 1;
      factors.push('Luminary nature: +1');
    }

    // Sect scoring: Alignment with chart's day/night nature
    if (planetData.sect.sameContrary === 'Same') {
      score += 2;
      factors.push('Sect agreement: +2');
    }

    // Rejoicing scoring: Planetary joy in current conditions
    if (planetData.rejoicing.sign === 'Yes') {
      score += 1;
      factors.push('Rejoices in sign: +1');
    }
    if (planetData.rejoicing.solarPhase === 'Yes') {
      score += 1;
      factors.push('Rejoices in solar phase: +1');
    }

    // Lords scoring: Planetary rulership strengths
    if (planetData.lords.domicile === 'Yes') {
      score += 5;
      factors.push('Lord of domicile: +5');
    }
    if (planetData.lords.exaltation === 'Yes') {
      score += 4;
      factors.push('Lord of exaltation: +4');
    }
    if (planetData.lords.triplicity === 'Yes') {
      score += 3;
      factors.push('Lord of triplicity: +3');
    }
    if (planetData.lords.bound === 'Yes') {
      score += 2;
      factors.push('Lord of bound: +2');
    }

    // Essential dignity (positive): Planetary strength through placement
    if (planetData.essentialDignity.domicile === 'Yes') {
      score += 5;
      factors.push('In domicile: +5');
    }
    if (planetData.essentialDignity.exaltation === 'Yes') {
      score += 4;
      factors.push('In exaltation: +4');
    }
    if (planetData.essentialDignity.triplicity === 'Yes') {
      score += 3;
      factors.push('In triplicity: +3');
    }
    if (planetData.essentialDignity.bound === 'Yes') {
      score += 2;
      factors.push('In bound: +2');
    }
    if (planetData.essentialDignity.mutualReception === 'Yes') {
      score += 3;
      factors.push('Mutual reception: +3');
    }

    // Essential dignity (negative): Planetary weakness through placement
    if (planetData.essentialDignity.detriment === 'Yes') {
      score -= 5;
      factors.push('In detriment: -5');
    }
    if (planetData.essentialDignity.fall === 'Yes') {
      score -= 4;
      factors.push('In fall: -4');
    }

    // Solar phase scoring: Relationship with Sun and visibility
    if (planetData.solarPhase.direction === 'Direct') {
      score += 1;
      factors.push('Direct motion: +1');
    }
    if (planetData.solarPhase.speed === 'Fast') {
      score += 1;
      factors.push('Fast speed: +1');
    }
    if (planetData.solarPhase.visibility === 'Visible') {
      score += 2;
      factors.push('Visible: +2');
    }
    if (planetData.solarPhase.visibility === 'Combust') {
      score -= 3;
      factors.push('Combust: -3');
    }

    // Lunar aspects: Relationship with Moon
    if (planetData.lunarAspects.lunarApplication === 'Applying') {
      score += 1;
      factors.push('Applying to Moon: +1');
    }

    // Testimony: Overall condition assessment
    if (planetData.testimony.favorable === 'Yes') {
      score += 2;
      factors.push('Favorable testimony: +2');
    }
    if (planetData.testimony.bonified === 'Yes') {
      score += 2;
      factors.push('Bonified: +2');
    }
    if (planetData.testimony.unfavorable === 'Yes') {
      score -= 2;
      factors.push('Unfavorable testimony: -2');
    }
    if (planetData.testimony.maltreated === 'Yes') {
      score -= 2;
      factors.push('Maltreated: -2');
    }

    // Domicile lord condition: Support from sign ruler
    if (planetData.conditionOfDomicileLord === 'Helps') {
      score += 2;
      factors.push('Domicile lord helps: +2');
    }

    return {
      rawScore: score,
      factors: factors,
      normalizedScore: this.normalizeScore(score),
      grade: this.determineGrade(this.normalizeScore(score))
    };
  }

  /**
   * Converts raw score to a normalized 0-100 scale for easier interpretation
   * @param {number} score - Raw calculated score
   * @returns {number} Normalized score between 0 and 100
   */
  static normalizeScore(score) {
    // Define reasonable bounds for scoring system
    const maxScore = 30;   // Estimated maximum positive score possible
    const minScore = -10;  // Estimated minimum negative score possible
    
    // Linear normalization formula
    const normalized = ((score - minScore) / (maxScore - minScore)) * 100;
    
    // Ensure score stays within 0-100 bounds
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Determines letter grade based on normalized score
   * Uses traditional academic grading scale adapted for astrological assessment
   * @param {number} normalizedScore - Score from 0 to 100
   * @returns {string} Letter grade A through F
   */
  static determineGrade(normalizedScore) {
    if (normalizedScore >= 90) return 'A';  // Excellent condition
    if (normalizedScore >= 75) return 'B';  // Good condition
    if (normalizedScore >= 60) return 'C';  // Average condition
    if (normalizedScore >= 40) return 'D';  // Below average condition
    if (normalizedScore >= 20) return 'E';  // Poor condition
    return 'F';  // Very poor condition
  }
}

/**
 * Demonstration function showing how to use the planetary evaluation system
 * Provides a complete example with sample data
 */
function runExample() {
  console.log('=== Planetary Condition Evaluation System Demo ===');
  
  // Create a new evaluation for a client
  const evaluation = new PlanetEvaluation('John Smith', 'Diurnal');

  // Add Mars evaluation data with all condition factors
  evaluation.addPlanet('Mars', {
    nature: 'Malefic',
    sect: { dayNight: 'Day', sameContrary: 'Contrary' },
    rejoicing: { hemisphere: 'Northern', sign: 'No', solarPhase: 'No' },
    lords: { domicile: 'Yes', exaltation: 'No', triplicity: 'Yes', bound: 'No' },
    essentialDignity: { 
      domicile: 'Yes', detriment: 'No', exaltation: 'No', fall: 'No',
      triplicity: 'Yes', bound: 'No', mutualReception: 'No'
    },
    solarPhase: {
      speed: 'Average', direction: 'Direct', station: 'Not Stationary',
      visibility: 'Visible', morningEvening: 'Evening', phasis: 'No'
    },
    lunarAspects: {
      lunarApplication: 'Applying', nodalConnection: 'None'
    },
    testimony: {
      favorable: 'No', unfavorable: 'Yes', maltreated: 'No', bonified: 'No'
    },
    conditionOfDomicileLord: 'Helps',
    judgmentGrade: 'C'
  });

  // Calculate and display detailed scoring results
  const marsScore = evaluation.calculatePlanetScore('Mars');
  
  console.log(`Client: ${evaluation.clientName}`);
  console.log(`Chart Sect: ${evaluation.chartSect}`);
  console.log(`Planet: Mars`);
  console.log(`Raw Score: ${marsScore.rawScore}`);
  console.log(`Normalized Score: ${marsScore.normalizedScore.toFixed(1)}`);
  console.log(`Grade: ${marsScore.grade}`);
  console.log('Detailed Factors:');
  marsScore.factors.forEach(factor => console.log(`  ${factor}`));
  
  return evaluation;
}

// Export for use in Node.js environments or modular ES6 applications
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlanetEvaluation, ScoringSystem, runExample };
}

// Auto-run example when loaded in browser context (optional)
if (typeof window !== 'undefined') {
  console.log('Planetary Evaluation System loaded. Call runExample() to see a demo.');
}
