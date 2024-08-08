const puppeteer = require('puppeteer');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const captureFrames = async (url, numFrames, delay) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const { width, height } = await page.evaluate(() => {
      return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    });

    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream('animation.gif'));
    encoder.start();
    encoder.setRepeat(0); // 0 = loop indefinitely
    encoder.setDelay(delay); // delay in ms
    encoder.setQuality(10); // image quality. 10 is default

    console.log('Starting GIF creation');

    for (let i = 0; i < numFrames; i++) {
      console.log('Capturing frame', i);
      const screenshotBuffer = await page.screenshot();
      console.log('Screenshot taken');

      const img = await loadImage(screenshotBuffer);
      console.log('Image loaded');

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      console.log('Image drawn on canvas');

      encoder.addFrame(ctx);
      console.log('Frame added to GIF encoder');

      await page.waitForTimeout(delay);
      console.log('Delay complete');
    }

    console.log('Finishing GIF creation');
    encoder.finish();
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

captureFrames('https://www.wetteronline.de/regenradar/berlin-bundesland?wro=true', 3, 1); // 20 frames, 100ms delay between frames
