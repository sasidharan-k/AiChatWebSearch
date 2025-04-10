const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require('body-parser');
const FormData = require('form-data');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = 5000;
const apiKey=process.env.OPENAI_API_KEY;


app.use(express.json({ limit: '50mb' }));  // Increase JSON payload limit to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());

app.post("/screenshot", async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto("https://www.flipkart.com", { waitUntil: "networkidle2" });

    try {

      await page.waitForSelector("button._2KpZ6l._2doB4z", { timeout: 5000 });
      await page.click("button._2KpZ6l._2doB4z");

    } catch (popupErr) {

      console.log("Popup not found or already closed:", popupErr.message);
    }

    await page.type('input[name="q"]', query);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Waiting for results to load...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const screenshotPath = path.join(__dirname, "screenshot.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();

    console.log("Screenshot captured successfully");
    res.sendFile(screenshotPath);
  } catch (err) {
    console.error("ERROR in Puppeteer:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

app.post('/upload-image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Please capture a screenshot first.' });
  }

  try {

    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');


    const formData = new FormData();
    formData.append('file', buffer, { filename: 'screenshot.jpg', contentType: 'image/jpeg' });


    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Summarize the content of this image.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response from OpenAI:', response.data);
    res.json(response.data.choices[0].message.content);

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image or communicating with OpenAI API.' });
  }
});

app.listen(PORT, () =>
  console.log(` Server running at http://localhost:${PORT}`)
);
