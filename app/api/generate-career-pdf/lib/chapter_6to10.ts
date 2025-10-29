import { readUtf8 } from './io';

export const loadChapter610 = (
  headerImageDataUrl: string,
  birthImprintHtml: string,
  karmicTraitsHtml: string,
  lifeTimelineHtml: string,
  planetryCyclesHtml: string,
  majorLifeShiftsTextHtml: string
): string => {
  const chapterPath = 'app/lib/career/chapter_6to10/ch.html';
  let content = readUtf8(chapterPath);
  
  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);
  content = content.replace(/\{\{birth_imprint_text\}\}/g, birthImprintHtml);
  content = content.replace(/\{\{karmic_traits_text\}\}/g, karmicTraitsHtml);
  content = content.replace(/\{\{life_timeline_text\}\}/g, lifeTimelineHtml);
  content = content.replace(/\{\{planetary_cycles_text\}\}/g, planetryCyclesHtml);
  content = content.replace(/\{\{major_life_shifts_text\}\}/g, majorLifeShiftsTextHtml);

  return content;
};
