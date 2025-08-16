// src/lib/puppeteer-singleton.js
import puppeteer from 'puppeteer';

const g = globalThis;
if (!g.__puppeteer_browser) g.__puppeteer_browser = null;

export async function getBrowser() {
  if (g.__puppeteer_browser) {
    try {
      await g.__puppeteer_browser.version(); // comprueba que sigue vivo
      return g.__puppeteer_browser;
    } catch {
      g.__puppeteer_browser = null;
    }
  }
  g.__puppeteer_browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  return g.__puppeteer_browser;
}

/** Precarga (solo registra una vez) */
export async function warmupPuppeteer() {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.close();
    console.log('[Puppeteer] Warmed up ✅');
  } catch (e) {
    console.error('[Puppeteer] Warmup error:', e);
  }
}
