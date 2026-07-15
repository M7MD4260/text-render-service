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
    font-family: 'Noto Sans';
    src: url('file://${process.cwd()}/fonts/NotoSans-Regular.ttf');
  }
  
  @font-face {
    font-family: 'Noto Sans Arabic';
    src: url('file://${process.cwd()}/fonts/NotoNaskhArabic-Regular.ttf');
  }

  @font-face {
  font-family: 'Noto Naskh Arabic';
  src: url('file://${process.cwd()}/fonts/NotoNaskhArabic-Regular.ttf');
}

@font-face {
  font-family: 'Noto Sans CJK TC';
  src: url('file://${process.cwd()}/fonts/NotoSansCJKtc-Regular.ttf');
}
  
  @font-face {
    font-family: 'Noto Sans JP';
    src: url('file://${process.cwd()}/fonts/NotoSansCJKtc-Regular.ttf');
  }
  
  @font-face {
    font-family: 'Noto Color Emoji';
    src: url('file://${process.cwd()}/fonts/NotoColorEmoji-Regular.ttf');
  }
  
  @font-face {
    font-family: 'Noto Sans Symbols 2';
    src: url('file://${process.cwd()}/fonts/NotoSansSymbols2-Regular.ttf');
  }

  @font-face {
    font-family: 'Noto Sans Symbols';
    src: url('file://${process.cwd()}/fonts/NotoSansSymbols2-Regular.ttf');
  }
  
  @font-face {
    font-family: 'Noto Sans Math';
    src: url('file://${process.cwd()}/fonts/NotoSansMath-Regular.ttf');
  }
  
  body {
    margin: 0;
    background: transparent;
  }
  
  #name {
    font-family:
      "Noto Sans",
      "Noto Naskh Arabic",
      "Noto Sans CJK TC",
      "Noto Color Emoji",
      "Noto Sans Symbols",
      "Noto Sans Symbols 2",
      "Noto Sans Math",
      "Noto Sans Armenian",
      "Noto Sans Balinese",
      "Noto Sans Bengali",
      "Noto Sans Devanagari",
      "Noto Sans Ethiopic",
      "Noto Sans Georgian",
      "Noto Sans Gujarati",
      "Noto Sans Gurmukhi",
      "Noto Sans Hebrew",
      "Noto Sans Javanese",
      "Noto Sans Kannada",
      "Noto Sans Khmer",
      "Noto Sans Lao",
      "Noto Sans Mongolian",
      "Noto Sans Myanmar",
      "Noto Sans Oriya",
      "Noto Sans Sinhala",
      "Noto Sans Tamil",
      "Noto Sans Thai",
      "Noto Sans Tibetan",
      "Noto Sans Tifinagh",
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
