import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

// Load local env if present
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const PROXY_KEY = process.env.PROXY_API_KEY;

async function run() {
  const url = 'http://localhost:3001/api/create-character';
  const headers = { 'Content-Type': 'application/json' };
  if (PROXY_KEY) headers['x-proxy-key'] = PROXY_KEY;

  const body = {
    contents: 'Smoke test: create character',
    config: { temperature: 0.1, model: 'gemini-2.5-flash' }
  };

  const maxRetries = 12;
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: POST ${url} (x-proxy-key present? ${!!PROXY_KEY})`);
      const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      console.log('Status:', resp.status);
      const text = await resp.text();
      console.log('Body (truncated):', text.substring(0, 2000));

      // Then try image generation
      const imgUrl = 'http://localhost:3001/api/generate-image';
      const imgHeaders = { 'Content-Type': 'application/json' };
      if (PROXY_KEY) imgHeaders['x-proxy-key'] = PROXY_KEY;
      console.log(`Calling ${imgUrl}`);
      const imgResp = await fetch(imgUrl, { method: 'POST', headers: imgHeaders, body: JSON.stringify({ prompt: 'A portrait' }) });
      console.log('/api/generate-image status:', imgResp.status);
      if (imgResp.status !== 204) {
        const imgText = await imgResp.text();
        console.log('Image body (truncated):', imgText.substring(0, 2000));
      }

      process.exit(0);
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.code || err.message || err);
      if (attempt < maxRetries) {
        console.log('Waiting 1s before retrying...');
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      console.error('All attempts failed.');
      process.exit(2);
    }
  }
}

run();
