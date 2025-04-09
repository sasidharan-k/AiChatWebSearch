const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


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
    const completionResponse = await axios.post('https://api.openai.com/v1/completions', {
      model: 'gpt-4-vision',
      prompt: 'tell me about image',
      input_image: image,
    }, {
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
    });


    const analysis = openaiResponse.data.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error('Error during image analysis:', error.response ? error.response.data : error.message);
    res.status(500).send('Error analyzing image.');
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
