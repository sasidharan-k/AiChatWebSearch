
const OpenAI = require('openai')
const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshotPath = path.join(__dirname, 'screenshot.png');
    await page.screenshot({ path: screenshotPath });
    await browser.close();
    res.sendFile(screenshotPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error capturing screenshot' });
  }
});

app.post('/upload', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {

    const buffer = Buffer.from(image, 'base64');
    const imageInstance = await loadImage(buffer);
    const canvas = createCanvas(imageInstance.width, imageInstance.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageInstance, 0, 0);
    const pngBuffer = canvas.toBuffer('image/png');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Summarize the content of this image.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${pngBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    // Send the analysis response
    const analysis = response.choices[0].message.content;
    res.json({ analysis });

  } catch (error) {
    console.error('Error during image analysis:', error);
    res.status(500).send('Error analyzing image.');
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
