export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(req, ctx) {
  const { id } = await ctx.params; 

  try {
    // Obtén una URL absoluta (en dev y en prod)
    // a) preferimos NEXT_PUBLIC_APP_URL si existe
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      // b) si no, construimos desde el request
      (() => {
        const url = new URL(req.url);
        return `${url.protocol}//${url.host}`;
      })();

    const targetUrl = `${base}/formato/print/${id}`;

    const browser = await puppeteer.launch({
      // Si algo falla: args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();

    // Sube un pelín el viewport si lo necesitas
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 1 });

    // Si necesitas cookies/sesión, puedes inyectarlas aquí con page.setCookie(...)
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 90_000 });

    // Espera a que las fuentes y las imágenes terminen
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
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
