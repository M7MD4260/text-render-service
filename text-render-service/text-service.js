const ArabicReshaper = require("arabic-reshaper");

const fs = require("fs");
const path = require("path");

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/render", async (req, res) => {
  const text = req.body.text || "";

  // تشكيل النص العربي ليظهر الحروف متصلة
  let renderedText = text;

if (/[\u0600-\u06FF]/.test(text)) {
  renderedText =
    (ArabicReshaper.reshape && ArabicReshaper.reshape(text)) ||
    (typeof ArabicReshaper === "function" && ArabicReshaper(text)) ||
    text;

  // عكس النص بعد التشكيل ليظهر متصلًا بشكل صحيح
  renderedText = renderedText.split("").reverse().join("");
}

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

      body {
        margin: 0;
        background: transparent;
      }

      #name {
        font-family:
          'NotoMath',
          'NotoSymbols2',
          'NotoArabic',
          'NotoSans',
          sans-serif;

        font-size: 60px;
        font-weight: 600;
        color: black;
        white-space: nowrap;
        display: inline-block;
      }
    </style>
    </head>

    <body>
      <div id="name">${renderedText}</div>
    </body>
    </html>
  `);

  // الانتظار حتى يتم تحميل الخطوط
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const element = await page.$("#name");

  const buffer = await element.screenshot({
    omitBackground: true
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(buffer);
});

app.listen(process.env.PORT || 8080);
