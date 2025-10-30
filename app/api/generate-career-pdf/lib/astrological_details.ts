import { readUtf8 } from './io';
import { renderKeyValueRows, renderDashaCycles, buildShadbalaInsights, formatLuckyNumbers, escapeHtml } from './render';
import { toDataUrl } from './io';

export function loadAstrologicalDetails(astroDetails: any, headerImageDataUrl: string, pageData?: any): string {
  if (!astroDetails && !pageData) return '';

  const htmlPath = 'app/lib/career/astrological_details/astrological_details.html';
  let content = readUtf8(htmlPath);

  const sunImageDataUrl = toDataUrl('public/sun.png');
  const venusImageDataUrl = toDataUrl('public/venus.png');

  // astroDetails may contain the static data, or pageData may have it flat
  // Create a merged section with proper fallbacks
  const astroData = astroDetails?.static ?? astroDetails;
  
  const staticSection = { 
    ...pageData,  // Base properties from pageData
    ...astroData, // Merge with astroDetails/static
  };

  // Ensure critical fields have proper values with multiple fallback paths
  const luckyColorValue = staticSection.luckyColor;
  const luckyNumbersValue = staticSection.luckyNumbers;

  // User Details - Name, DOB, TOB, POB, Gender
  const userDetailsRows = renderKeyValueRows(
    [
      { label: 'Name', value: pageData?.name },
      { label: 'Date of Birth', value: pageData?.dateOfBirth },
      { label: 'Time of Birth', value: pageData?.timeOfBirth },
      { label: 'Place of Birth', value: pageData?.placeOfBirth },
    ]
  );

  // Core Cosmic Identity - Only 4 fields: Ascendant, Nakshatra, Nakshatra Lord, Nakshatra Pada
  const identityRows = renderKeyValueRows(
    [
      { label: 'Ascendant', value: staticSection.ascendant },
      { label: 'Nakshatra', value: staticSection.nakshatra },
      { label: 'Nakshatra Lord', value: staticSection.nakshatraLord },
      { label: 'Nakshatra Pada', value: staticSection.nakshatraPada },
    ]
  );

  // Guiding Energies - Lucky Color and Lucky Numbers
  const luckyRows = renderKeyValueRows(
    [
      { label: 'Lucky Color', value: luckyColorValue },
      { label: 'Lucky Numbers', value: formatLuckyNumbers(luckyNumbersValue) },
    ]
  );

  // Render nested dasha cycles from dashas array
  const dashaCyclesHtml = renderDashaCycles(staticSection.dashas);

  content = content
    .replace('{{user_details_rows}}', userDetailsRows)
    .replace('{{core_rows}}', identityRows)
    .replace('{{lucky_rows}}', luckyRows)
    .replace('{{dasha_cycles}}', dashaCyclesHtml)
    .replace('{{sun_image}}', sunImageDataUrl)
    .replace('{{venus_image}}', venusImageDataUrl);

  const shadbalaInsights = buildShadbalaInsights(staticSection.shadBala?.total_balas ?? staticSection.shadBala);

  content = content
    .replace('{{shadbala_summary}}', escapeHtml(shadbalaInsights.summary))
    .replace('{{shadbala_peak}}', escapeHtml(shadbalaInsights.peakName))
    .replace('{{shadbala_peak_value}}', escapeHtml(shadbalaInsights.peakValue))
    .replace('{{shadbala_low}}', escapeHtml(shadbalaInsights.lowName))
    .replace('{{shadbala_low_value}}', escapeHtml(shadbalaInsights.lowValue))
    .replace('{{shadbala_average}}', escapeHtml(shadbalaInsights.averageValue))
    .replace('{{shadbala_rows}}', shadbalaInsights.pillsMarkup);

  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

  return content;
}