import { readUtf8 } from './io';

export function loadAstavargaChart(headerImageDataUrl: string, chartImage?: string): string {
  const htmlPath = 'app/lib/career/astavarga_chart/astavarga_chart.html';
  let content = readUtf8(htmlPath);

  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

  const chartMarkup = chartImage
    ? `<div class="astavarga-chart"><img src="${chartImage}" alt="Ashtakavarga Chart" /></div>`
    : '';

  content = content.replace('{{astavarga_chart}}', chartMarkup);

  return content;
}
