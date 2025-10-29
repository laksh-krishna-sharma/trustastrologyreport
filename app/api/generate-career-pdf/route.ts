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

    const coverImageDataUrl = toDataUrl('public/coverpage.png');
    const headerImageDataUrl = toDataUrl('public/header.png');
    const [
      birthImprintModule,
      karmicTraitsModule,
      lifeTimelineModule,
      planetaryCyclesModule,
      majorLifeShiftsModule,
      keyCareerHousesModule,
      guidingPlanetsModule,
      professionalKarmaFocusModule
    ] = await Promise.all([
      import('../../agent/career/birth_imprint_agent'),
      import('../../agent/career/karmic_traits_agent'),
      import('../../agent/career/life_timeline_agent'),
      import('../../agent/career/planetary_cycles_agent'),
      import('../../agent/career/major_life_shifts_agent'),
      import('../../agent/career/key_career_houses_agent'),
      import('../../agent/career/guiding_planets_agent'),
      import('../../agent/career/professional_karma_focus_agent')
    ]);

    const birthImprintHtml = (birthImprintModule.default ?? '') as string;
    const karmicTraitsHtml = (karmicTraitsModule.default ?? '') as string;
    const lifeTimelineHtml = (lifeTimelineModule.default ?? '') as string;
    const planetryCyclesHtml = (planetaryCyclesModule.default ?? '') as string;
    const majorLifeShiftsHtml = (majorLifeShiftsModule.default ?? '') as string;
    const keyCareerHousesHtml = (keyCareerHousesModule.default ?? '') as string;
    const guidingPlanetsHtml = (guidingPlanetsModule.default ?? '') as string;
    const professionalKarmaFocusHtml = (professionalKarmaFocusModule.default ?? '') as string;


    const { html: fullHtml, css: cssContent } = assemblePages(
      pageData,
      headerImageDataUrl,
      coverImageDataUrl,
      chartImages,
      birthImprintHtml,
      karmicTraitsHtml,
      lifeTimelineHtml,
      planetryCyclesHtml,
      majorLifeShiftsHtml,
      keyCareerHousesHtml,
      guidingPlanetsHtml,
      professionalKarmaFocusHtml
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
