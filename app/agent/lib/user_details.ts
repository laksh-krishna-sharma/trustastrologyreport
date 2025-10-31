/**
 * User Details Utility
 * Extracts and manages user astrological details for agent consumption
 */

export interface UserDetails {
  name: string;
  dob: string;
  age: number;
  tob: string;
  pob: string;
  gender: string;
  ascendant: string;
  moonSign: string;
  currentMahadasha: string;
  currentAntardasha: string;
  currentParyantardasha: string;
  ashtakvarga: Record<string, number>;
  d1: string;
  d9: string;
  d10: string;
  yogas: Record<string, string>;
  shadBala: Record<string, number | null>;
  nakshatra: string;
  nakshatraLord: string;
  nakshatraPada: string;
  luckyColor: string;
  luckyNumbers: number[];
  shaniPeriodType: string;
  shaniSaturnRetrograde: boolean;
}

/**
 * Extract user details from raw payload
 * @param payload - Raw JSON payload from API request
 * @returns Extracted UserDetails object
 */
export function extractUserDetails(payload: Record<string, any>): UserDetails {
  return {
    name: payload.name || '',
    dob: payload.dob || '',
    age: payload.age || 0,
    tob: payload.tob || '',
    pob: payload.pob || '',
    gender: payload.gender || '',
    ascendant: payload.ascendant || '',
    moonSign: payload.moonSign || '',
    currentMahadasha: payload.currentMahadasha || '',
    currentAntardasha: payload.currentAntardasha || '',
    currentParyantardasha: payload.currentParyantardasha || '',
    ashtakvarga: payload.ashtakvarga || {},
    d1: payload.d1 || '',
    d9: payload.d9 || '',
    d10: payload.d10 || '',
    yogas: payload.yogas || {},
    shadBala: payload.shadBala || {},
    nakshatra: payload.nakshatra || '',
    nakshatraLord: payload.nakshatraLord || '',
    nakshatraPada: payload.nakshatraPada || '',
    luckyColor: payload.luckyColor || '',
    luckyNumbers: Array.isArray(payload.luckyNumbers) ? payload.luckyNumbers : [],
    shaniPeriodType: payload.shaniPeriodType || '',
    shaniSaturnRetrograde: payload.shaniSaturnRetrograde || false,
  };
}

/**
 * Format user details for agent prompts
 * Creates a formatted context string for LLM consumption
 * @param details - UserDetails object
 * @returns Formatted string for prompt context
 */
export function formatUserDetailsForPrompt(details: UserDetails): string {
  const yogasText = Object.entries(details.yogas)
    .map(([yoga, percentage]) => `${yoga}: ${percentage}`)
    .join(', ');

  const shadbalaText = Object.entries(details.shadBala)
    .filter(([, value]) => value !== null)
    .map(([planet, value]) => `${planet}: ${value}`)
    .join(', ');

  const ashtakavargaText = Object.entries(details.ashtakvarga)
    .map(([house, points]) => `House ${house}: ${points} points`)
    .join(', ');

  return `
User Profile:
- Name: ${details.name}
- Date of Birth: ${details.dob}
- Age: ${details.age}
- Time of Birth: ${details.tob}
- Place of Birth: ${details.pob}
- Gender: ${details.gender}

Astrological Profile:
- Ascendant (Lagna): ${details.ascendant}
- Moon Sign: ${details.moonSign}
- Nakshatra: ${details.nakshatra}
- Nakshatra Lord: ${details.nakshatraLord}
- Nakshatra Pada: ${details.nakshatraPada}

Current Planetary Cycles:
- Current Mahadasha: ${details.currentMahadasha}
- Current Antardasha: ${details.currentAntardasha}
- Current Paryantardasha: ${details.currentParyantardasha}

Chart Placements:
## D1 Chart:\n${details.d1}
## D9 Chart:\n${details.d9}
## D10 Chart:\n ${details.d10}

Strength Metrics (Shad Bala):
${shadbalaText}

Ashtakavarga Distribution:
${ashtakavargaText}

Yogas Present:
${yogasText}

Lucky Details:
- Lucky Color: ${details.luckyColor}
- Lucky Numbers: ${details.luckyNumbers.join(', ')}

Saturn Period:
- Period Type: ${details.shaniPeriodType}
- Saturn Retrograde: ${details.shaniSaturnRetrograde ? 'Yes' : 'No'}
`;
}

/**
 * Store user details globally for agent access
 * This allows agents to access user data without passing it through function parameters
 */
let globalUserDetails: UserDetails | null = null;

export function setUserDetails(details: UserDetails): void {
  globalUserDetails = details;
}

export function getUserDetails(): UserDetails | null {
  return globalUserDetails;
}

export function clearUserDetails(): void {
  globalUserDetails = null;
}

/**
 * Get formatted user details for prompt
 * Convenience function to get current user details formatted for prompts
 */
export function getFormattedUserDetailsForPrompt(): string {
  if (!globalUserDetails) {
    return 'No user details available';
  }
  return formatUserDetailsForPrompt(globalUserDetails);
}
