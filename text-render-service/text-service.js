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

  await page.setContent(`
    <html>
    <head>
    <style>
    @font-face {
      font-family: 'NotoSans';
      src: url('file://${process.cwd()}/fonts/NotoSans-Regular.ttf');
    }
    
    @font-face {
      font-family: 'NotoArabic';
      src: url('file://${process.cwd()}/fonts/NotoNaskhArabic-Regular.ttf');
    }
    
    @font-face {
      font-family: 'NotoCJK';
      src: url('file://${process.cwd()}/fonts/NotoSansCJKtc-Regular.ttf');
    }
    
    @font-face {
      font-family: 'NotoSymbols2';
      src: url('file://${process.cwd()}/fonts/NotoSansSymbols2-Regular.ttf');
    }
    
    @font-face {
      font-family: 'NotoMath';
      src: url('file://${process.cwd()}/fonts/NotoSansMath-Regular.ttf');
    }
    
    body {
      margin: 0;
      background: transparent;
    }
    
    #name {
      font-family:
        'NotoSans',
        'NotoArabic',
        'NotoCJK',
        'NotoSymbols2',
        'NotoMath',
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
      <div id="name">${text}</div>
    </body>
    </html>
    `);

  const element = await page.$("#name");

  const buffer = await element.screenshot({
    omitBackground: true
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(buffer);
});

app.listen(process.env.PORT || 8080);
