import { readUtf8 } from './io';
import { renderKeyValueRows, renderTimelineRows, buildShadbalaInsights, formatLuckyNumbers, sanitizeBulletPrefix, escapeHtml } from './render';
import { toDataUrl } from './io';

export function loadAstrologicalDetails(astroDetails: any, headerImageDataUrl: string): string {
  if (!astroDetails) return '';

  const htmlPath = 'app/lib/career/astrological_details/astrological_details.html';
  let content = readUtf8(htmlPath);

  const sunImageDataUrl = toDataUrl('public/sun.png');
  const venusImageDataUrl = toDataUrl('public/venus.png');

  const staticSection = astroDetails.static ?? {};
  const dailySection = astroDetails.daily ?? {};

  const identityRows = renderKeyValueRows(
    [
      { label: 'Ascendant', value: staticSection.ascendant },
      { label: 'Nakshatra', value: staticSection.nakshatra },
      { label: 'Nakshatra Lord', value: staticSection.nakshatraLord },
      { label: 'Nakshatra Pada', value: staticSection.nakshatraPada },
      { label: 'Kaalsarp Dosha', value: sanitizeBulletPrefix(staticSection.kaalsarpDosha) },
      { label: 'Pitra Dosha', value: staticSection.pitraDosha },
      { label: 'Mangal Dosha', value: sanitizeBulletPrefix(staticSection.mangalDosha), variant: 'astro-row--center' },
    ].filter((row) => row.value !== undefined && row.value !== null && `${row.value}`.trim() !== '')
  );

  const dailyRows = renderKeyValueRows(
    [
      { label: 'Lucky Color', value: dailySection.luckyColor },
      { label: 'Lucky Numbers', value: formatLuckyNumbers(dailySection.luckyNumbers) },
      {
        label: 'Current Mahadasha',
        value: dailySection.currentMahadasha ?? staticSection.mahadasha?.[0]?.Mahadasha,
      },
      { label: 'Current Antardasha', value: dailySection.currentAntardasha },
      { label: 'Current Paryantardasha', value: dailySection.currentParyantardasha },
      { label: 'Current Shooksamadasha', value: dailySection.currentShookshamadasha },
      { label: 'Current Pranadasha', value: dailySection.currentPranadasha },
      { label: 'Shani Transit', value: dailySection.shaniPeriodType },
    ].filter((row) => row.value !== undefined && row.value !== null && `${row.value}`.trim() !== '')
  );

  const mahadashaRows = renderTimelineRows(
    Array.isArray(staticSection.mahadasha) ? staticSection.mahadasha : undefined,
    [
      { key: 'Mahadasha', label: 'Mahadasha' },
      { key: 'Start Date', label: 'Starts' },
      { key: 'End Date', label: 'Ends' },
    ],
    'Mahadasha insights will appear here once documented.'
  );

  const antardashaRows = renderTimelineRows(
    Array.isArray(staticSection.antardasha) ? staticSection.antardasha : undefined,
    [
      { key: 'Antardasha', label: 'Antardasha' },
      { key: 'Start Date', label: 'Starts' },
      { key: 'End Date', label: 'Ends' },
    ],
    'Antardasha timeline will appear here once documented.'
  );

  content = content
    .replace('{{core_rows}}', identityRows)
    .replace('{{daily_rows}}', dailyRows)
    .replace('{{mahadasha_rows}}', mahadashaRows)
    .replace('{{antardasha_rows}}', antardashaRows)
    .replace('{{sun_image}}', sunImageDataUrl)
    .replace('{{venus_image}}', venusImageDataUrl);

  const shadbalaInsights = buildShadbalaInsights(staticSection.shadBala?.total_balas);

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