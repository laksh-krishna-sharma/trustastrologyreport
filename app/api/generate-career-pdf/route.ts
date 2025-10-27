import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'date_of_birth', 'place_of_birth', 'time_of_birth', 'gender', 'description', 'additional_info', 'conclusion', 'final_notes', 'image'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Read HTML template
    const htmlPath = path.join(process.cwd(), 'app/lib/career/pdf.html');
    const cssPath = path.join(process.cwd(), 'app/lib/career/pdf.css');

    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

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
    htmlContent = htmlContent.replace(/\{\{description\}\}/g, formatContent(data.description));
    htmlContent = htmlContent.replace(/\{\{additional_info\}\}/g, formatContent(data.additional_info));
    htmlContent = htmlContent.replace(/\{\{conclusion\}\}/g, formatContent(data.conclusion));
    htmlContent = htmlContent.replace(/\{\{final_notes\}\}/g, formatContent(data.final_notes));
    htmlContent = htmlContent.replace(/\{\{image\}\}/g, data.image);

    // Inline CSS into HTML
    const fullHtml = htmlContent.replace('<link rel="stylesheet" href="./pdf.css">', `<style>${cssContent}</style>`);

    // Launch Playwright browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
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
