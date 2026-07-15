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
    <body style="margin:0;background:transparent">
      <div id="name" style="
        font-family:'Noto Sans','Noto Sans Arabic','Noto Sans JP','Noto Color Emoji';
        font-size:60px;
        font-weight:600;
        color:black;
        white-space:nowrap;
      ">${text}</div>
    </body>
  `);

  const element = await page.$("#name");

  const buffer = await element.screenshot({
    omitBackground: true
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(buffer);
});

app.listen(process.env.PORT || 3000);