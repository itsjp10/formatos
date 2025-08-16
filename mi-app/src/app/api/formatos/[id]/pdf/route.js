export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getBrowser } from '@/lib/puppeteer-singleton';

export async function GET(req, ctx) {
  const { id } = await ctx.params;

  try {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (() => {
        const url = new URL(req.url);
        return `${url.protocol}//${url.host}`;
      })();

    const targetUrl = `${base}/formato/print/${id}`;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 1 });

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Espera fuentes (si es necesario)
    try {
      await page.evaluateHandle('document.fonts.ready');
    } catch {
      /* si falla fonts.ready no bloquea */
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '16mm', left: '12mm' },
    });

    await page.close();

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
