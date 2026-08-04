import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

export async function captureScreenshot(page, name = 'screenshot', options = {}) {
  try {
    // Check if page is still usable
    if (!page || page.isClosed()) {
      console.warn(`  Screenshot "${name}" skipped: page is closed`);
      return;
    }

    // Wait for page to be stable before screenshot
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    } catch {
      // Page might be navigating, continue anyway
    }

    // Inject timestamp watermark overlay
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
    
    try {
      await page.evaluate((ts) => {
        const existing = document.getElementById('forcemind-watermark');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.id = 'forcemind-watermark';
        div.textContent = ts;
        div.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:999999;padding:6px 14px;font-size:13px;font-family:Consolas,monospace;color:#fff;background:rgba(0,0,0,0.65);border-radius:4px;pointer-events:none;letter-spacing:0.3px;';
        document.body.appendChild(div);
      }, timestamp);
    } catch {
      // Page might be in a broken state, take screenshot without watermark
    }

    const screenshot = await page.screenshot({ 
      fullPage: false,  // Use viewport only - more reliable
      timeout: 10000 
    });

    // Remove watermark overlay
    try {
      await page.evaluate(() => {
        const el = document.getElementById('forcemind-watermark');
        if (el) el.remove();
      });
    } catch {
      // Ignore cleanup errors
    }

    const attachmentName = name.replace(/\s+/g, '-').toLowerCase();

    const info = options.testInfo || test.info();
    await info.attach(attachmentName, {
      body: screenshot,
      contentType: 'image/png',
    });

    await allure.attachment(attachmentName, screenshot, { contentType: 'image/png' });

    if (options.writeToFile) {
      const fileName = `${attachmentName}.png`;
      const filePath = path.join(screenshotDir, fileName);
      fs.writeFileSync(filePath, screenshot);
    }
  } catch (err) {
    console.warn(`  Screenshot "${name}" failed:`, err.message);
  }
}

export async function attachVideoOnFailure(page, testInfo) {
  if (testInfo.status !== 'passed' && testInfo.video) {
    try {
      const videoPath = await testInfo.video.path();
      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);
        const attachmentName = `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-video`;
        await testInfo.attach(attachmentName, {
          body: videoBuffer,
          contentType: 'video/webm',
        });
        await allure.attachment(attachmentName, videoBuffer, { contentType: 'video/webm' });
      }
    } catch (err) {
      console.warn(`  Video attach failed:`, err.message);
    }
  }
}

// Screencast-based video recording for more reliable capture
let activeScreencast = null;

export async function startScreencast(page, testInfo) {
  try {
    const videoDir = path.join(process.cwd(), 'reports', 'videos');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    
    const videoPath = path.join(videoDir, `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}.webm`);
    
    activeScreencast = await page.screencast.start({
      path: videoPath,
      size: { width: 1920, height: 1080 },
      quality: 80,
    });
    
    return videoPath;
  } catch (err) {
    console.warn(`  Screencast start failed:`, err.message);
    return null;
  }
}

export async function stopScreencast(page, testInfo, shouldAttach = false) {
  try {
    if (activeScreencast) {
      await page.screencast.stop();
      activeScreencast = null;
      
      // Always attach video to report
      const videoPath = path.join(
        process.cwd(), 'reports', 'videos', 
        `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}.webm`
      );
      
      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);
        const attachmentName = `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-video`;
        await testInfo.attach(attachmentName, {
          body: videoBuffer,
          contentType: 'video/webm',
        });
        await allure.attachment(attachmentName, videoBuffer, { contentType: 'video/webm' });
      }
    }
  } catch (err) {
    console.warn(`  Screencast stop failed:`, err.message);
  }
}

export async function sfStep(name, page, fn) {
  return allure.step(name, async () => {
    await fn();
  });
}

export async function setAllureMeta({ epic, feature, story, severity = 'normal' }) {
  await allure.epic(epic);
  await allure.feature(feature);
  await allure.story(story);
  await allure.severity(severity);
}

export async function attachJson(name, data) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  await allure.attachment(name, json, { contentType: 'application/json' });
}

export async function apiStep(name, fn) {
  return allure.step(name, fn);
}

export async function logApiCall(operation, details) {
  await allure.logStep(`${operation}: ${JSON.stringify(details, null, 2)}`);
}
