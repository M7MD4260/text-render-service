const fs = require("fs");
const path = require("path");

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/render", async (req, res) => {
  const text = req.body.text || "";

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  const arabicFont = fs.readFileSync(
  path.join(__dirname, "fonts", "NotoNaskhArabic-Regular.ttf")
).toString("base64");

const sansFont = fs.readFileSync(
  path.join(__dirname, "fonts", "NotoSans-Regular.ttf")
).toString("base64");

const symbolsFont = fs.readFileSync(
  path.join(__dirname, "fonts", "NotoSansSymbols2-Regular.ttf")
).toString("base64");

const mathFont = fs.readFileSync(
  path.join(__dirname, "fonts", "NotoSansMath-Regular.ttf")
).toString("base64");

  const isArabic = /[\u0600-\u06FF]/.test(text);
  
  await page.setContent(`
    <html>
    <head>
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

  display: inline;

  direction: rtl;
  unicode-bidi: plaintext;
}
    </style>
    </head>
    
    <body>
      <div id="name">${text}</div>
    </body>
    </html>
    `);

  // مهم جدًا
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
