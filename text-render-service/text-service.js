const ArabicReshaper = require("arabic-reshaper");

const fs = require("fs");
const path = require("path");

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

// دالة لحماية النص داخل HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.post("/render", async (req, res) => {
  const text = req.body.text || "";

  // تشكيل النص العربي ليظهر الحروف متصلة
  let renderedText = text;

  if (/[\u0600-\u06FF]/.test(text)) {
    renderedText =
      (ArabicReshaper.reshape && ArabicReshaper.reshape(text)) ||
      (typeof ArabicReshaper === "function" && ArabicReshaper(text)) ||
      text;
  }

  // حماية النص قبل إدخاله في HTML
  const safeText = escapeHtml(renderedText);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  // تحميل الخطوط وتحويلها Base64
  const arabicFont = fs
    .readFileSync(path.join(__dirname, "fonts", "NotoNaskhArabic-Regular.ttf"))
    .toString("base64");

  const sansFont = fs
    .readFileSync(path.join(__dirname, "fonts", "NotoSans-Regular.ttf"))
    .toString("base64");

  const symbolsFont = fs
    .readFileSync(path.join(__dirname, "fonts", "NotoSansSymbols2-Regular.ttf"))
    .toString("base64");

  const mathFont = fs
    .readFileSync(path.join(__dirname, "fonts", "NotoSansMath-Regular.ttf"))
    .toString("base64");

  const jpFont = fs
  .readFileSync(path.join(__dirname, "fonts", "NotoSansJP-Regular.otf"))
  .toString("base64");

  const tibetanFont = fs
  .readFileSync(path.join(__dirname, "fonts", "NotoSansTibetan-Regular.ttf"))
  .toString("base64");

  const symbols1Font = fs
    .readFileSync(path.join(__dirname, "fonts", "NotoSansSymbols-Regular.ttf"))
    .toString("base64");

  await page.setContent(`
    <html>
    <head>
    <meta charset="UTF-8">
    <style>
      @font-face {
        font-family: 'NotoSans';
        src: url(data:font/ttf;base64,${sansFont}) format('truetype');
      }

      @font-face {
        font-family: 'NotoArabic';
        src: url(data:font/ttf;base64,${arabicFont}) format('truetype');
      }

      @font-face {
        font-family: 'NotoSymbols2';
        src: url(data:font/ttf;base64,${symbolsFont}) format('truetype');
      }

      @font-face {
        font-family: 'NotoMath';
        src: url(data:font/ttf;base64,${mathFont}) format('truetype');
      }

      @font-face {
        font-family: 'NotoJP';
        src: url(data:font/otf;base64,${jpFont}) format('opentype');
      }

      @font-face {
        font-family: 'NotoTibetan';
        src: url(data:font/ttf;base64,${tibetanFont}) format('truetype');
      }

      @font-face {
        font-family: 'NotoSymbols1';
        src: url(data:font/ttf;base64,${symbols1Font}) format('truetype');
      }

      body {
        margin: 0;
        background: transparent;
      }

      #name {
        font-family:
          'NotoJP',
          'NotoSymbols1',
          'NotoArabic',
          'NotoMath',
          'NotoSymbols2',
          'NotoTibetan',
          'NotoSans',
          sans-serif;

        font-size: 60px;
        font-weight: 600;
        color: black;

        white-space: nowrap;
        display: inline-block;

        direction: rtl;
        text-align: right;

        font-variant-ligatures: normal;
        font-feature-settings: "liga" 1, "calt" 1;
      }
    </style>
    </head>

    <body>
      <div id="name" dir="rtl">${safeText}</div>
    </body>
    </html>
  `);

  // الانتظار حتى يتم تحميل الخطوط
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const element = await page.$("#name");

  // لو العنصر لم يتم إنشاؤه
  if (!element) {
    await browser.close();
    return res.status(500).send("Failed to render text element");
  }

  const buffer = await element.screenshot({
    omitBackground: true
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(buffer);
});

app.listen(process.env.PORT || 8080);
