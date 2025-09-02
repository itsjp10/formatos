export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const urlObj = new URL(req.url);
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${urlObj.protocol}//${urlObj.host}`;

    const targetUrl = `${base}/formato/print/${id}`;

    const browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Sube un pelín el viewport si lo necesitas
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 1 });

    // Si necesitas cookies/sesión, puedes inyectarlas aquí con page.setCookie(...)
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 90_000 });

    // Espera a que las fuentes y las imágenes terminen
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      landscape: true,
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      // preferCSSPageSize: true, // si defines @page en CSS
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="formato-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
