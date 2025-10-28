import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

type JsonRecord = Record<string, any>;
type TimelineColumn = { key: string; label: string };
type KeyValueEntry = { label: string; value: unknown; variant?: string };

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
};

const renderKeyValueRows = (entries: KeyValueEntry[]): string => {
  const rows = entries
    .filter(({ value }) => {
      if (value === null || value === undefined) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return true;
    })
    .map(({ label, value, variant }) => {
      const classes = ['astro-row'];
      if (variant) {
        classes.push(variant);
      }
      return `<div class="${classes.join(' ')}"><span class="astro-label">${escapeHtml(label)}</span><span class="astro-value">${escapeHtml(value)}</span></div>`;
    })
    .join('');

  return rows || '<div class="astro-empty">Details will appear here once available.</div>';
};

const renderTimelineRows = (
  items: Array<JsonRecord> | undefined,
  columns: TimelineColumn[],
  emptyMessage: string
): string => {
  if (!items || !items.length) {
    return `<tr><td colspan="${columns.length}">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return items
    .map((item) => {
      const cells = columns
        .map(({ key }) => `<td>${escapeHtml(item[key])}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
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

const buildShadbalaInsights = (values: JsonRecord | undefined): ShadbalaInsights => {
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

  if (!values) {
    return emptyState;
  }

  const entries = Object.entries(values)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(Number(value)))
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  if (!entries.length) {
    return emptyState;
  }

  const limitedEntries = entries.slice(0, 6);
  const pillsMarkup = limitedEntries
    .map(([label, value]) => {
      const safeLabel = escapeHtml(label);
      const safeValue = escapeHtml(value);
      return `<div class="astro-pill"><span class="astro-pill-label">${safeLabel}</span><span class="astro-pill-value">${safeValue}</span></div>`;
    })
    .join('');

  const [peakLabel, peakValue] = limitedEntries[0];
  const [lowLabel, lowValue] = limitedEntries[limitedEntries.length - 1];
  const numericValues = limitedEntries.map(([, value]) => Number(value));
  const total = numericValues.reduce((acc, value) => acc + value, 0);
  const average = numericValues.length ? Math.round((total / numericValues.length) * 10) / 10 : 0;

  const summary = `Dominant strength currently resides in ${peakLabel} (${peakValue} pts) while ${lowLabel} offers a softer influence at ${lowValue} pts. Average momentum balances around ${average} pts.`;

  return {
    pillsMarkup,
    summary,
    peakName: String(peakLabel),
    peakValue: String(peakValue),
    lowName: String(lowLabel),
    lowValue: String(lowValue),
    averageValue: String(average),
  };
};

const sanitizeBulletPrefix = (text?: string): string | undefined => {
  if (!text) {
    return text;
  }
  return text.replace(/^\*\s*/, '').trim();
};

const formatLuckyNumbers = (input: unknown): string | undefined => {
  if (!Array.isArray(input) || !input.length) {
    return undefined;
  }
  return input.map((value) => String(value)).join(' • ');
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as JsonRecord;

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const potentialRecord = (payload.astro_record ?? undefined) as JsonRecord | undefined;
    const fallbackRecord: JsonRecord | undefined = potentialRecord ?? (payload.astro ? payload : undefined);

    const resolvedFields = {
      name: payload.name ?? fallbackRecord?.name,
      date_of_birth: payload.date_of_birth ?? fallbackRecord?.dob ?? fallbackRecord?.date_of_birth,
      place_of_birth: payload.place_of_birth ?? fallbackRecord?.pob ?? fallbackRecord?.place_of_birth,
      time_of_birth: payload.time_of_birth ?? fallbackRecord?.tob ?? fallbackRecord?.time_of_birth,
      gender: payload.gender ?? fallbackRecord?.gender,
    } as Record<string, string | undefined>;

    for (const [key, value] of Object.entries(resolvedFields)) {
      if (!value) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    const astroDetails: JsonRecord | undefined = payload.astro ?? fallbackRecord?.astro;

    const name = resolvedFields.name as string;
    const dateOfBirth = resolvedFields.date_of_birth as string;
    const placeOfBirth = resolvedFields.place_of_birth as string;
    const timeOfBirth = resolvedFields.time_of_birth as string;
    const gender = resolvedFields.gender as string;

    // Read HTML & CSS assets
    const htmlPath = path.join(process.cwd(), 'app/lib/career/pdf.html');
    const cssPath = path.join(process.cwd(), 'app/lib/career/pdf.css');
    const disclaimerCssPath = path.join(process.cwd(), 'app/lib/career/disclaimer/disclaimer.css');
    const tableOfContentCssPath = path.join(process.cwd(), 'app/lib/career/table_of_content/table_of_content.css');
    const astrologicalDetailsCssPath = path.join(process.cwd(), 'app/lib/career/astrological_details/astrological_details.css');
    const disclaimerPath = path.join(process.cwd(), 'app/lib/career/disclaimer/disclaimer.html');
    const tableOfContentPath = path.join(process.cwd(), 'app/lib/career/table_of_content/table_of_content.html');
    const astrologicalDetailsPath = path.join(process.cwd(), 'app/lib/career/astrological_details/astrological_details.html');
    const imagePath = path.join(process.cwd(), 'public/coverpage.png');
    const headerImagePath = path.join(process.cwd(), 'public/header.png');

    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    let cssContent = fs.readFileSync(cssPath, 'utf-8');
    const disclaimerCss = fs.readFileSync(disclaimerCssPath, 'utf-8');
    const tableOfContentCss = fs.readFileSync(tableOfContentCssPath, 'utf-8');
    const astrologicalDetailsCss = fs.readFileSync(astrologicalDetailsCssPath, 'utf-8');
    let disclaimerContent = fs.readFileSync(disclaimerPath, 'utf-8');
    let tableOfContentContent = fs.readFileSync(tableOfContentPath, 'utf-8');
    let astrologicalDetailsContent = fs.readFileSync(astrologicalDetailsPath, 'utf-8');

    // Read and convert cover image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    // Read and convert header image to base64
    const headerImageBuffer = fs.readFileSync(headerImagePath);
    const headerImageBase64 = headerImageBuffer.toString('base64');
    const headerImageDataUrl = `data:image/png;base64,${headerImageBase64}`;

    // Expand CSS bundle with modular styles
    cssContent = cssContent.replace('../../../public/cover.png', imageDataUrl);
    cssContent = `${cssContent}\n${disclaimerCss}\n${tableOfContentCss}\n${astrologicalDetailsCss}`;

    // Replace main placeholders
    htmlContent = htmlContent
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{date_of_birth\}\}/g, dateOfBirth)
      .replace(/\{\{place_of_birth\}\}/g, placeOfBirth)
      .replace(/\{\{time_of_birth\}\}/g, timeOfBirth)
      .replace(/\{\{gender\}\}/g, gender);

    cssContent = cssContent.replace('{{cover_image}}', imageDataUrl);

    const replaceHeaderImage = (content: string) => content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

    htmlContent = replaceHeaderImage(htmlContent);
    disclaimerContent = replaceHeaderImage(disclaimerContent);
    tableOfContentContent = replaceHeaderImage(tableOfContentContent);

    if (astroDetails) {
      const staticSection = astroDetails.static ?? {};
      const dailySection = astroDetails.daily ?? {};

      const identityRows = renderKeyValueRows([
        { label: 'Ascendant', value: staticSection.ascendant },
        { label: 'Nakshatra', value: staticSection.nakshatra },
        { label: 'Nakshatra Lord', value: staticSection.nakshatraLord },
        { label: 'Nakshatra Pada', value: staticSection.nakshatraPada },
        { label: 'Kaalsarp Dosha', value: sanitizeBulletPrefix(staticSection.kaalsarpDosha) },
        { label: 'Pitra Dosha', value: staticSection.pitraDosha },
        { label: 'Mangal Dosha', value: sanitizeBulletPrefix(staticSection.mangalDosha), variant: 'astro-row--center' },
      ]);

      const dailyRows = renderKeyValueRows([
        { label: 'Lucky Color', value: dailySection.luckyColor },
        { label: 'Lucky Numbers', value: formatLuckyNumbers(dailySection.luckyNumbers) },
        {
          label: 'Current Mahadasha',
          value: dailySection.currentMahadasha ?? staticSection.mahadasha?.[0]?.Mahadasha,
        },
        { label: 'Current Antardasha', value: dailySection.currentAntardasha },
        { label: 'Current Paryantardasha', value: dailySection.currentParyantardasha },
        { label: 'Current Shooksamadasha', value: dailySection.currentShookshamadasha },
        { label: 'Current Pranadasha', value: dailySection.currentPranadasha },
        { label: 'Shani Transit', value: dailySection.shaniPeriodType },
      ]);

      const mahadashaRows = renderTimelineRows(
        Array.isArray(staticSection.mahadasha) ? staticSection.mahadasha.slice(0, 4) : undefined,
        [
          { key: 'Mahadasha', label: 'Mahadasha' },
          { key: 'Start Date', label: 'Starts' },
          { key: 'End Date', label: 'Ends' },
        ],
        'Mahadasha insights will appear here once documented.'
      );

      const antardashaRows = renderTimelineRows(
        Array.isArray(staticSection.antardasha) ? staticSection.antardasha.slice(0, 6) : undefined,
        [
          { key: 'Antardasha', label: 'Antardasha' },
          { key: 'Start Date', label: 'Starts' },
          { key: 'End Date', label: 'Ends' },
        ],
        'Antardasha timeline will appear here once documented.'
      );

      astrologicalDetailsContent = astrologicalDetailsContent
        .replace('{{core_rows}}', identityRows)
        .replace('{{daily_rows}}', dailyRows)
        .replace('{{mahadasha_rows}}', mahadashaRows)
        .replace('{{antardasha_rows}}', antardashaRows);

      const shadbalaInsights = buildShadbalaInsights(staticSection.shadBala?.total_balas);

      astrologicalDetailsContent = astrologicalDetailsContent
        .replace('{{shadbala_summary}}', escapeHtml(shadbalaInsights.summary))
        .replace('{{shadbala_peak}}', escapeHtml(shadbalaInsights.peakName))
        .replace('{{shadbala_peak_value}}', escapeHtml(shadbalaInsights.peakValue))
        .replace('{{shadbala_low}}', escapeHtml(shadbalaInsights.lowName))
        .replace('{{shadbala_low_value}}', escapeHtml(shadbalaInsights.lowValue))
        .replace('{{shadbala_average}}', escapeHtml(shadbalaInsights.averageValue))
        .replace('{{shadbala_rows}}', shadbalaInsights.pillsMarkup);

      astrologicalDetailsContent = replaceHeaderImage(astrologicalDetailsContent);
    } else {
      astrologicalDetailsContent = '';
    }

    // Inject modular pages
    htmlContent = htmlContent
      .replace(/\{\{disclaimer_content\}\}/g, disclaimerContent)
      .replace(/\{\{table_of_content\}\}/g, tableOfContentContent)
      .replace(/\{\{astrological_details\}\}/g, astrologicalDetailsContent);

    // Inline CSS into HTML
    const fullHtml = htmlContent.replace('<link rel="stylesheet" href="./pdf.css">', `<style>${cssContent}</style>`);

    // Launch Playwright browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      width: '210mm',
      height: '297mm',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `astrology_report_${timestamp}.pdf`;
    const filePath = path.join(process.cwd(), 'files', filename);

    // Save PDF to files directory
    fs.writeFileSync(filePath, pdfBuffer);

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
