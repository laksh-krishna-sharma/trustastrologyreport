import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { toDataUrl } from './lib/io';
import { assemblePages, PageData } from './lib/pages';

type JsonRecord = Record<string, any>;

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
  const chartImages: Record<string, string> = (astroDetails?.charts ?? payload.chart_images ?? {}) as Record<string, string>;
  const astavargaChartImage = (astroDetails?.astavarga_chart_image ?? payload.astavarga_chart_image) as string | undefined;

    const name = resolvedFields.name as string;
    const dateOfBirth = resolvedFields.date_of_birth as string;
    const placeOfBirth = resolvedFields.place_of_birth as string;
    const timeOfBirth = resolvedFields.time_of_birth as string;
    const gender = resolvedFields.gender as string;

    const pageData: PageData = {
      name,
      dateOfBirth,
      placeOfBirth,
      timeOfBirth,
      gender,
      astroDetails,
      chartImages,
      astavargaChartImage,
    };

    const coverImageDataUrl = await toDataUrl('public/coverpage.png');
    const headerImageDataUrl = await toDataUrl('public/header.png');

    const birthImprintModule = await import('../../agent/career/birth_imprint_agent');
    const birthImprintHtml = (birthImprintModule.default ?? '') as string;

    const { html: fullHtml, css: cssContent } = assemblePages(
      pageData,
      headerImageDataUrl,
      coverImageDataUrl,
      chartImages,
      birthImprintHtml
    );

    // Inline CSS into HTML
    const finalHtml = fullHtml.replace('<link rel="stylesheet" href="./pdf.css">', `<style>${cssContent}</style>`);

    // Launch Playwright browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(finalHtml, { waitUntil: 'networkidle' });

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
