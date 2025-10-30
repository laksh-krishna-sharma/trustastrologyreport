import * as sd from 'showdown';

export default function parseMarkdownToHtml(markdown: string): string {
  const converter = new sd.Converter();
  return converter.makeHtml(markdown);
}