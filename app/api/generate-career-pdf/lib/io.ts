import fs from 'fs';
import path from 'path';

const resolveFromRoot = (...parts: string[]) => path.join(process.cwd(), ...parts);
const ensureAbsolute = (p: string) => (path.isAbsolute(p) ? p : resolveFromRoot(p));

export const resolve = resolveFromRoot;

export const readUtf8 = (p: string) => fs.readFileSync(ensureAbsolute(p), 'utf-8');

export const toDataUrl = (filePath: string, mime = 'image/png') => {
  const absolutePath = ensureAbsolute(filePath);
  const buffer = fs.readFileSync(absolutePath);
  const b64 = buffer.toString('base64');
  return `data:${mime};base64,${b64}`;
};
