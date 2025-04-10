require('dotenv').config();
const XLSX = require('xlsx');
const fs = require('fs');
const axios = require('axios');

const apiKey = process.env.OPENAI_API_KEY;

async function analyzeCSV() {

  if (!apiKey) {
    console.error('API key is missing!');
    return;
  }

  console.log('Using API Key:', apiKey);

  const workbook = XLSX.readFile('Sample-Employee-Data.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(data);

  fs.writeFileSync('output.json', JSON.stringify(data, null, 2));

  const csvData = JSON.stringify(data);

  try {

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Here is the employee data in JSON format: \n\n ${csvData} \n\nCan you analyze this data and give me insights?`
          }
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('API Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling the OpenAI API:', error.response ? error.response.data : error.message);
  }
}

analyzeCSV();
