import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import * as playwright from 'playwright';

test('Lighthouse accessibility and performance scores', async () => {
  // We need to launch a browser with a remote debugging port for lighthouse
  const browser = await playwright.chromium.launch({
    args: ['--remote-debugging-port=9222'],
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/');

  await playAudit({
    page: page,
    thresholds: {
      performance: 50,
      accessibility: 90,
      'best-practices': 90,
      seo: 90,
    },
    port: 9222,
    reports: {
      formats: {
        html: true,
      },
      name: 'lighthouse-report',
      directory: './playwright-report',
    }
  });

  await browser.close();
});
