import { readUtf8 } from './io';
import { loadAstrologicalDetails } from './astrological_details';
import { loadHoroscopeCharts } from './horoscope_charts';
import { loadAstavargaChart } from './astavarga_chart';
import { loadChapter610 } from './chapter_6to10';

export interface PageData {
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  timeOfBirth: string;
  gender: string;
  astroDetails?: any;
  chartImages?: Record<string, string>;
  astavargaChartImage?: string;
}

export function loadCssBundle(headerImageDataUrl: string, coverImageDataUrl: string): string {
  const cssPath = 'app/lib/career/pdf.css';
  const disclaimerCssPath = 'app/lib/career/disclaimer/disclaimer.css';
  const tableOfContentCssPath = 'app/lib/career/table_of_content/table_of_content.css';
  const astrologicalDetailsCssPath = 'app/lib/career/astrological_details/astrological_details.css';
  const horoscopeChartsCssPath = 'app/lib/career/horoscope_charts/horoscope_charts.css';
  const astavargaChartCssPath = 'app/lib/career/astavarga_chart/astavarga_chart.css';
  const chapter610CssPath = 'app/lib/career/chapter_6to10/ch.css';

  let cssContent = readUtf8(cssPath);
  const disclaimerCss = readUtf8(disclaimerCssPath);
  const tableOfContentCss = readUtf8(tableOfContentCssPath);
  const astrologicalDetailsCss = readUtf8(astrologicalDetailsCssPath);
  const horoscopeChartsCss = readUtf8(horoscopeChartsCssPath);
  const astavargaChartCss = readUtf8(astavargaChartCssPath);
  const chapter610Css = readUtf8(chapter610CssPath);

  cssContent = cssContent.replace(/\{\{cover_image\}\}/g, coverImageDataUrl);
  cssContent = `${cssContent}\n${disclaimerCss}\n${tableOfContentCss}\n${astrologicalDetailsCss}\n${horoscopeChartsCss}\n${astavargaChartCss}\n${chapter610Css}`;

  return cssContent;
}

export function loadDisclaimer(headerImageDataUrl: string): string {
  const disclaimerPath = 'app/lib/career/disclaimer/disclaimer.html';
  let content = readUtf8(disclaimerPath);
  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);
  return content;
}

export function loadTableOfContents(headerImageDataUrl: string): string {
  const tableOfContentPath = 'app/lib/career/table_of_content/table_of_content.html';
  let content = readUtf8(tableOfContentPath);
  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);
  return content;
}

export function loadMainPage(
  data: PageData,
  disclaimer: string,
  toc: string,
  astro: string,
  horoscope: string,
  astavarga: string,
  chapter610: string
): string {
  const htmlPath = 'app/lib/career/pdf.html';
  let content = readUtf8(htmlPath);

  content = content
    .replace(/\{\{name\}\}/g, data.name)
    .replace(/\{\{date_of_birth\}\}/g, data.dateOfBirth)
    .replace(/\{\{place_of_birth\}\}/g, data.placeOfBirth)
    .replace(/\{\{time_of_birth\}\}/g, data.timeOfBirth)
    .replace(/\{\{gender\}\}/g, data.gender)
    .replace(/\{\{disclaimer_content\}\}/g, disclaimer)
    .replace(/\{\{table_of_content\}\}/g, toc)
  .replace(/\{\{astrological_details\}\}/g, astro)
  .replace(/\{\{horoscope_charts\}\}/g, horoscope)
  .replace(/\{\{astavarga_chart\}\}/g, astavarga)
  .replace(/\{\{chapter_6to10\}\}/g, chapter610);

  return content;
}

export function assemblePages(
  data: PageData,
  headerImageDataUrl: string,
  coverImageDataUrl: string,
  chartImages: Record<string, string>,
  birthImprintHtml: string,
  karmicTraitsHtml: string,
  lifeTimelineHtml: string,
  planetryCyclesHtml: string,
  majorLifeShiftsTextHtml: string
): { html: string; css: string } {
  const css = loadCssBundle(headerImageDataUrl, coverImageDataUrl);
  const disclaimer = loadDisclaimer(headerImageDataUrl);
  const toc = loadTableOfContents(headerImageDataUrl);
  const astro = loadAstrologicalDetails(data.astroDetails, headerImageDataUrl);
  const charts = loadHoroscopeCharts(headerImageDataUrl, chartImages);
  const astavarga = loadAstavargaChart(headerImageDataUrl, data.astavargaChartImage);
  const chapter610 = loadChapter610(
    headerImageDataUrl,
    birthImprintHtml,
    karmicTraitsHtml,
    lifeTimelineHtml,
    planetryCyclesHtml,
    majorLifeShiftsTextHtml
  );
  const html = loadMainPage(data, disclaimer, toc, astro, charts, astavarga, chapter610);

  return { html, css };
}