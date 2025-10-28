import { readUtf8 } from './io';
import { loadAstrologicalDetails } from './astrological_details';

export interface PageData {
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  timeOfBirth: string;
  gender: string;
  astroDetails?: any;
}

export function loadCssBundle(headerImageDataUrl: string, coverImageDataUrl: string): string {
  const cssPath = 'app/lib/career/pdf.css';
  const disclaimerCssPath = 'app/lib/career/disclaimer/disclaimer.css';
  const tableOfContentCssPath = 'app/lib/career/table_of_content/table_of_content.css';
  const astrologicalDetailsCssPath = 'app/lib/career/astrological_details/astrological_details.css';

  let cssContent = readUtf8(cssPath);
  const disclaimerCss = readUtf8(disclaimerCssPath);
  const tableOfContentCss = readUtf8(tableOfContentCssPath);
  const astrologicalDetailsCss = readUtf8(astrologicalDetailsCssPath);

    cssContent = cssContent.replace(/\{\{cover_image\}\}/g, coverImageDataUrl);
  cssContent = `${cssContent}\n${disclaimerCss}\n${tableOfContentCss}\n${astrologicalDetailsCss}`;

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

export function loadMainPage(data: PageData, disclaimer: string, toc: string, astro: string): string {
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
    .replace(/\{\{astrological_details\}\}/g, astro);

  return content;
}

export function assemblePages(data: PageData, headerImageDataUrl: string, coverImageDataUrl: string): { html: string; css: string } {
  const css = loadCssBundle(headerImageDataUrl, coverImageDataUrl);
  const disclaimer = loadDisclaimer(headerImageDataUrl);
  const toc = loadTableOfContents(headerImageDataUrl);
  const astro = loadAstrologicalDetails(data.astroDetails, headerImageDataUrl);
  const html = loadMainPage(data, disclaimer, toc, astro);

  return { html, css };
}