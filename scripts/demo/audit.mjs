// Lab observations, deliberately not called field INP or real-user heatmaps.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const origin = process.env.NEXO_PREVIEW_URL || 'http://127.0.0.1:4194';
const results = [];
for (const config of [{ name: 'desktop', width: 1440, height: 1000, cpu: 1 }, { name: 'mobile-4x', width: 390, height: 844, cpu: 4 }]) {
  const context = await browser.newContext({ viewport: { width: config.width, height: config.height } });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: config.cpu });
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
  await page.addInitScript(() => {
    window.__audit = { lcp: 0, shifts: [], longTasks: [], events: [] };
    for (const [type, callback] of [
      ['largest-contentful-paint', entry => { window.__audit.lcp = entry.startTime; }],
      ['layout-shift', entry => { if (!entry.hadRecentInput) window.__audit.shifts.push({ value: entry.value, time: entry.startTime }); }],
      ['longtask', entry => window.__audit.longTasks.push(entry.duration)],
      ['event', entry => { if (entry.interactionId) window.__audit.events.push(entry.duration); }],
    ]) {
      if (PerformanceObserver.supportedEntryTypes.includes(type)) new PerformanceObserver(list => list.getEntries().forEach(callback)).observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) });
    }
  });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  const initial = await page.evaluate(() => ({ ...window.__audit, bytes: performance.getEntriesByType('resource').reduce((n, resource) => n + resource.transferSize, 0), requests: performance.getEntriesByType('resource').map(resource => resource.name) }));
  await page.locator('#story-play').click();
  const frames = await page.evaluate(() => new Promise(resolve => {
    const stamps = []; const start = performance.now();
    const frame = time => { stamps.push(time); if (time - start < 3300) requestAnimationFrame(frame); else resolve(stamps.slice(1).map((time, i) => time - stamps[i])); }; requestAnimationFrame(frame);
  }));
  await page.locator('[data-open-example]').click();
  await page.locator('[data-doc="EQ-024-mantenimiento"]').click();
  await page.locator('.document-back').click(); await page.keyboard.press('Escape');
  const final = await page.evaluate(() => window.__audit);
  frames.sort((a, b) => a - b);
  results.push({ config, initial: { lcpMs: Math.round(initial.lcp), resourceBytes: initial.bytes, resourceRequests: initial.requests.length, videoRequested: initial.requests.some(url => url.endsWith('.mp4')) }, lab: { totalLayoutShiftWithoutRecentInput: final.shifts.reduce((n, shift) => n + shift.value, 0), longTaskCount: final.longTasks.length, longestTaskMs: Math.round(Math.max(0, ...final.longTasks)), longestObservedEventMs: Math.max(0, ...final.events), frameIntervalP95Ms: Math.round(frames[Math.floor(frames.length * .95)] * 10) / 10, frameIntervalsOver50ms: frames.filter(value => value > 50).length, frameSamples: frames.length }, errors });
  await context.close();
}
await browser.close();
writeFileSync('docs/rendimiento-laboratorio-v4.json', JSON.stringify({ capturedAt: new Date().toISOString(), environment: 'Chromium local headless; network simulation 1.6 Mbps/100 ms; no real-user telemetry. Frame intervals are rAF scheduling, not compositor dropped-frame counts.', results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
