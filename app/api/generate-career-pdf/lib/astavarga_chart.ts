import { readUtf8 } from './io';
import { escapeHtml } from './render';

export function loadAstavargaChart(headerImageDataUrl: string, astroDetails?: any, chartImage?: string): string {
  const htmlPath = 'app/lib/career/astavarga_chart/astavarga_chart.html';
  let content = readUtf8(htmlPath);

  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

  // Build astavarga details from ashtakvarga data
  let astavargaDetailsMarkup = '';
  
  if (astroDetails?.ashtakvarga) {
    const astavargaValues = astroDetails.ashtakvarga;
    const totalPoints = Object.values(astavargaValues).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
    const houseCount = Object.keys(astavargaValues).length;
    const averagePoints = houseCount > 0 ? Math.round((totalPoints / houseCount) * 10) / 10 : 0;

    astavargaDetailsMarkup = `
      <div class="astavarga-description">
        <p><strong>Ashtakavarga Analysis</strong></p>
        <p>The Ashtakavarga chart reveals the strength distribution across the twelve houses of your birth chart. 
        Each planet contributes to the overall energy potential of each house, determining areas of favorable outcomes and potential challenges.</p>
      </div>
    `;
  }

  if (!astavargaDetailsMarkup) {
    astavargaDetailsMarkup = '<div class="astro-empty">Astavarga details will appear here once available.</div>';
  }

  const chartMarkup = chartImage
    ? `<div class="astavarga-chart"><img src="${chartImage}" alt="Ashtakavarga Chart" /></div>`
    : '';

  content = content.replace('{{astavarga_details}}', astavargaDetailsMarkup);
  content = content.replace('{{astavarga_chart}}', chartMarkup);

  return content;
}
