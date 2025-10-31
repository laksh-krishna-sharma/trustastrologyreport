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

  const astavargaChartImage =
    staticSection.astavarga_chart_image ??
    staticSection.ashtakvarga_img ??
    pageData?.astavargaChartImage ??
    pageData?.astavarga_chart_image;

  const astavargaChartBlock = astavargaChartImage
    ? `<div class="astavarga-inline__frame"
          style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            width:100%;
            max-width:450px;
            margin:1.4rem auto 2rem;
            padding:0;
            gap:1.4rem;
          ">
          <h3 style="
            font-size:1.4rem !important;
            font-weight:700;
            font-size:16px;
            text-transform:uppercase;
            color:#1f2a44;
            letter-spacing:1px;
            margin-bottom:0.8rem;
          ">
            Astavarga Chart
          </h3>
          <img src="${escapeHtml(astavargaChartImage)}"
              alt="Astavarga Chart"
              class="astavarga-inline__image"
              style="
                width:100%;
                height:auto;
                object-fit:contain;
                display:block;
                box-shadow:0 2px 10px rgba(0,0,0,0.05);
                border-radius:6px;
              " />
      </div>`
    : `<div class="astro-empty"
          style="
            text-align:center;
            padding:2rem;
            margin:2rem auto;
            width:100%;
            max-width:450px;
            border:1px dashed #ccc;
            border-radius:8px;
            color:#555;
            font-style:italic;
          ">
          Astavarga chart will appear here once available.
      </div>`;

  // Render nested dasha cycles from dashas array
  const dashaCyclesHtml = renderDashaCycles(staticSection.dashas);

  content = content
    .replace('{{user_details_rows}}', userDetailsRows)
    .replace('{{core_rows}}', identityRows)
    .replace('{{lucky_rows}}', luckyRows)
  .replace('{{dasha_cycles}}', dashaCyclesHtml)
  .replace('{{astavarga_chart_block}}', astavargaChartBlock)
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