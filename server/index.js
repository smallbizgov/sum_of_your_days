import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

// Load .env.local first if it exists (user provided). Otherwise load default .env.
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('Loaded environment from .env.local');
} else {
  dotenv.config();
  console.log('Loaded environment from .env');
}

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '1mb' }));

// Simple rate limiter: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple API key auth for proxy endpoints. Clients must provide x-proxy-key header.
const PROXY_API_KEY = process.env.PROXY_API_KEY;
const requireProxyKey = (req, res, next) => {
  if (!PROXY_API_KEY) return next(); // if not set, allow for local dev (but warn)
  const key = req.headers['x-proxy-key'] || req.query?.proxy_key;
  if (!key || key !== PROXY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-proxy-key header.' });
  }
  next();
};

const GENAI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!GENAI_API_KEY) {
  console.error('GEMINI_API_KEY not set in server environment.');
}

const GENAI_BASE = 'https://api.generativeai.googleapis.com/v1';

app.post('/api/next-segment', requireProxyKey, async (req, res) => {
  try {
    const { contents, config } = req.body;
    const response = await fetch(`${GENAI_BASE}/models:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config?.model || 'gemini-2.5-flash',
        contents,
        config: config || {},
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in /api/next-segment', error);
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/create-character', requireProxyKey, async (req, res) => {
  try {
    const { contents, config } = req.body;
    const response = await fetch(`${GENAI_BASE}/models:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config?.model || 'gemini-2.5-flash',
        contents,
        config: config || {},
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in /api/create-character', error);
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/generate-image', requireProxyKey, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    // If no IMAGE_API_KEY configured, return 204 so client falls back.
    const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
    if (!IMAGE_API_KEY) {
      return res.status(204).end();
    }

    // Call OpenAI Images API (response_format=b64_json) if configured.
    const imageResp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IMAGE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x576',
        response_format: 'b64_json'
      }),
    });

    if (!imageResp.ok) {
      const txt = await imageResp.text();
      console.error('Image provider error:', txt);
      return res.status(502).json({ error: 'Image provider error', detail: txt });
    }

    const json = await imageResp.json();
    // OpenAI returns { data: [{ b64_json: '<base64>' }] }
    if (json?.data && json.data[0]?.b64_json) {
      return res.json({ imageBase64: json.data[0].b64_json });
    }

    // Some providers may return a URL
    if (json?.data && json.data[0]?.url) {
      return res.json({ url: json.data[0].url });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in /api/generate-image', error);
    res.status(500).json({ error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`API proxy server listening on http://localhost:${port}`);
});
