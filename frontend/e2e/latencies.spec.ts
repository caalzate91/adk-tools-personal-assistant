import { test, expect } from '@playwright/test';

// SC-001: P95 Latency guarantee (< 10 seconds)
test('Validation of response times under 10 seconds', async ({ page }) => {
  // Overrides standard timeout to verify response network behavior
  test.setTimeout(30000);

  // Baseline load test
  const startTime = Date.now();
  await page.goto('/');
  const endTime = Date.now();

  const loadTimeMs = endTime - startTime;
  console.log(`Page Load Latency: ${loadTimeMs} ms`);

  // Assertion for generic base UI
  expect(loadTimeMs).toBeLessThan(10000);
});
