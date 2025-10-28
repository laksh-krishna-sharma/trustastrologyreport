type JsonRecord = Record<string, any>;
export type TimelineColumn = { key: string; label: string };
export type KeyValueEntry = { label: string; value: unknown; variant?: string };

export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
};

export const renderKeyValueRows = (entries: KeyValueEntry[]): string => {
  const rows = entries
    .filter(({ value }) => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    })
    .map(({ label, value, variant }) => {
      const classes = ['astro-row'];
      if (variant) classes.push(variant);
      return `<div class="${classes.join(' ')}"><span class="astro-label">${escapeHtml(label)}</span><span class="astro-value">${escapeHtml(value)}</span></div>`;
    })
    .join('');

  return rows || '<div class="astro-empty">Details will appear here once available.</div>';
};

export const renderTimelineRows = (
  items: Array<JsonRecord> | undefined,
  columns: TimelineColumn[],
  emptyMessage: string
): string => {
  if (!items || !items.length) return `<tr><td colspan="${columns.length}">${escapeHtml(emptyMessage)}</td></tr>`;

  return items
    .map((item) => {
      const cells = columns.map(({ key }) => `<td>${escapeHtml(item[key])}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
};

export const sanitizeBulletPrefix = (text?: string): string | undefined => {
  if (!text) return text;
  return text.replace(/^\*\s*/, '').trim();
};

export const formatLuckyNumbers = (input: unknown): string | undefined => {
  if (!Array.isArray(input) || !input.length) return undefined;
  return input.map((v) => String(v)).join(' • ');
};

type ShadbalaInsights = {
  pillsMarkup: string;
  summary: string;
  peakName: string;
  peakValue: string;
  lowName: string;
  lowValue: string;
  averageValue: string;
};

export const buildShadbalaInsights = (values: JsonRecord | undefined): ShadbalaInsights => {
  const defaultMessage = 'Strength metrics will appear here once available.';
  const emptyState: ShadbalaInsights = {
    pillsMarkup: `<div class="astro-empty">${escapeHtml(defaultMessage)}</div>`,
    summary: defaultMessage,
    peakName: '—',
    peakValue: '—',
    lowName: '—',
    lowValue: '—',
    averageValue: '—',
  };

  if (!values) return emptyState;

  const entries = Object.entries(values).filter(([, value]) => typeof value === 'number' && Number.isFinite(Number(value))).sort((a, b) => Number(b[1]) - Number(a[1]));
  if (!entries.length) return emptyState;
  const limited = entries.slice(0, 6);

  const pillsMarkup = limited.map(([label, value]) => `<div class="astro-pill"><span class="astro-pill-label">${escapeHtml(label)}</span><span class="astro-pill-value">${escapeHtml(value)}</span></div>`).join('');

  const [peakLabel, peakValue] = limited[0];
  const [lowLabel, lowValue] = limited[limited.length - 1];
  const numeric = limited.map(([, v]) => Number(v));
  const avg = numeric.length ? Math.round((numeric.reduce((a, b) => a + b, 0) / numeric.length) * 10) / 10 : 0;

  return {
    pillsMarkup,
    summary: `Dominant strength currently resides in ${peakLabel} (${peakValue} pts) while ${lowLabel} offers a softer influence at ${lowValue} pts. Average momentum: ${avg} pts.`,
    peakName: String(peakLabel),
    peakValue: String(peakValue),
    lowName: String(lowLabel),
    lowValue: String(lowValue),
    averageValue: String(avg),
  };
};
