import { readUtf8 } from './io';

export function loadHoroscopeCharts(headerImageDataUrl: string, chartImages: Record<string, string>): string {
  const htmlPath = 'app/lib/career/horoscope_charts/horoscope_charts.html';
  let content = readUtf8(htmlPath);

  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

  const chartRows = [
    [
      { id: 'd1_img', title: 'Rasi Chart' },
      { id: 'd2_img', title: 'Hora Chart' },
    ],
    [
      { id: 'd9_img', title: 'Navamsa Chart' },
      { id: 'd10_img', title: 'Dasamsa Chart' },
    ],
  ];

  const chartsHtml = chartRows
    .map((row) => {
      const rowHtml = row
        .map((chart) => {
          const imageUrl = chartImages[chart.id];
          if (!imageUrl) {
            return '';
          }

          return `
            <div class="chart-section">
              <h3>${chart.title}</h3>
              <img src="${imageUrl}" alt="${chart.title}" class="chart-image" />
            </div>
          `;
        })
        .join('');

      return rowHtml ? `<div class="charts-row">${rowHtml}</div>` : '';
    })
    .join('');

  content = content.replace('{{charts}}', chartsHtml);

  return content;
}
