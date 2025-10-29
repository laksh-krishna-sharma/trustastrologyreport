import { readUtf8 } from './io';

export const loadChapter610 = (headerImageDataUrl: string): string => {
  const chapterPath = 'app/lib/career/chapter_6to10/ch.html';
  let content = readUtf8(chapterPath);
  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);
  return content;
};
