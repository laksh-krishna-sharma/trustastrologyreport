import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'date_of_birth', 'place_of_birth', 'time_of_birth', 'gender'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Read HTML template
    const htmlPath = path.join(process.cwd(), 'app/lib/career/pdf.html');
    const cssPath = path.join(process.cwd(), 'app/lib/career/pdf.css');
    const imagePath = path.join(process.cwd(), 'public/coverpage.png');
    const headerImagePath = path.join(process.cwd(), 'public/header.png');

    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    let cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Read and convert cover image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    // Read and convert header image to base64
    const headerImageBuffer = fs.readFileSync(headerImagePath);
    const headerImageBase64 = headerImageBuffer.toString('base64');
    const headerImageDataUrl = `data:image/png;base64,${headerImageBase64}`;

    // Replace the background image path in CSS with data URL
    cssContent = cssContent.replace('../../../public/cover.png', imageDataUrl);

    // Function to format text content with paragraphs
    const formatContent = (text: string) => {
      if (!text) return '';
      // Replace double newlines with paragraph breaks
      return '<p>' + text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    };

    // Replace placeholders with actual data
    htmlContent = htmlContent.replace(/\{\{name\}\}/g, data.name);
    htmlContent = htmlContent.replace(/\{\{date_of_birth\}\}/g, data.date_of_birth);
    htmlContent = htmlContent.replace(/\{\{place_of_birth\}\}/g, data.place_of_birth);
    htmlContent = htmlContent.replace(/\{\{time_of_birth\}\}/g, data.time_of_birth);
    htmlContent = htmlContent.replace(/\{\{gender\}\}/g, data.gender);

    // Replace cover image placeholder in CSS
    cssContent = cssContent.replace('{{cover_image}}', imageDataUrl);

    // Replace header image placeholder in HTML
    htmlContent = htmlContent.replace(/\{\{header_image\}\}/g, headerImageDataUrl);

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
        left: '0mm'
      }
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
