const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

// Mock external dependencies
jest.mock('node-fetch', () => jest.fn());
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const fetch = require('node-fetch');

// Create a test app instance
const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

// Simple rate limiter for testing
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Mock environment variables
process.env.PROXY_API_KEY = 'test-api-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.IMAGE_API_KEY = 'test-image-key';
process.env.PORT = '3001';

// Mock API key auth middleware
const requireProxyKey = (req, res, next) => {
  const key = req.headers['x-proxy-key'] || req.query?.proxy_key;
  if (!key || key !== process.env.PROXY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-proxy-key header.' });
  }
  next();
};

// Routes (simplified for testing)
app.post('/api/next-segment', requireProxyKey, async (req, res) => {
  try {
    const { contents, config } = req.body;

    // Mock successful response
    const mockResponse = {
      candidates: [{
        content: {
          text: JSON.stringify({
            narrative: 'Test narrative response',
            updatedCharacterState: {
              gender: 'boy',
              age: 18,
              health: 100,
              mentalHealth: 100,
              happiness: 50,
              education: 12,
              hunger: 80,
              thirst: 80,
              physicalDescription: 'Test description',
              location: 'Test location',
              aspiration: null,
              job: null,
              habits: [],
              schedule: [],
              conditions: [],
              finances: { checking: 0, savings: 0, income: 0, expenses: 0, netWorth: 0 },
              skills: { fitness: 0, intelligence: 0, charisma: 0 },
              time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
              relationships: [],
              worldState: { economicClimate: 'Stable', currentYear: 2024 }
            },
            choices: [],
            isGameOver: false,
            gameOverReason: ''
          })
        }
      }]
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    // Simulate the actual endpoint logic
    const response = await fetch('https://api.generativeai.googleapis.com/v1/models:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: config?.model || 'gemini-2.5-flash',
        contents,
        config: config || {}
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.text || data?.text || JSON.stringify(data);
    const jsonText = text.trim();
    const parsed = JSON.parse(jsonText);

    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/next-segment', error);
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/create-character', requireProxyKey, async (req, res) => {
  try {
    const { contents, config } = req.body;

    const mockResponse = {
      candidates: [{
        content: {
          text: JSON.stringify({
            narrative: 'Character created successfully',
            updatedCharacterState: {
              gender: 'girl',
              age: 25,
              health: 100,
              mentalHealth: 100,
              happiness: 50,
              education: 16,
              hunger: 80,
              thirst: 80,
              physicalDescription: 'Beautiful young woman',
              location: 'New York City',
              aspiration: 'Become a doctor',
              job: 'Medical Student',
              habits: [],
              schedule: [],
              conditions: [],
              finances: { checking: 2000, savings: 5000, income: 15000, expenses: 1000, netWorth: 7000 },
              skills: { fitness: 5, intelligence: 8, charisma: 7 },
              time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
              relationships: [],
              worldState: { economicClimate: 'Stable', currentYear: 2024 }
            },
            choices: [{ text: 'Start medical school' }, { text: 'Take a gap year' }],
            isGameOver: false,
            gameOverReason: ''
          })
        }
      }]
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    const response = await fetch('https://api.generativeai.googleapis.com/v1/models:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: config?.model || 'gemini-2.5-flash',
        contents,
        config: config || {}
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.text || data?.text || JSON.stringify(data);
    const jsonText = text.trim();
    const parsed = JSON.parse(jsonText);

    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/create-character', error);
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/generate-image', requireProxyKey, async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!process.env.IMAGE_API_KEY) {
      return res.status(204).end();
    }

    const mockImageResponse = {
      data: [{
        b64_json: 'mockBase64ImageData'
      }]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockImageResponse)
    });

    const imageResp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x576',
        response_format: 'b64_json'
      })
    });

    if (!imageResp.ok) {
      return res.status(502).json({ error: 'Image provider error' });
    }

    const json = await imageResp.json();
    if (json?.data && json.data[0]?.b64_json) {
      return res.json({ imageBase64: json.data[0].b64_json });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in /api/generate-image', error);
    res.status(500).json({ error: String(error) });
  }
});

describe('Server API Endpoints', () => {
  describe('POST /api/next-segment', () => {
    it('should return story segment with valid API key', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'test-api-key')
        .send({
          contents: 'Test story context',
          config: { temperature: 0.9, model: 'gemini-2.5-flash' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('narrative');
      expect(response.body).toHaveProperty('updatedCharacterState');
      expect(response.body).toHaveProperty('choices');
      expect(response.body.narrative).toBe('Test narrative response');
    });

    it('should reject requests without API key', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .send({
          contents: 'Test story context',
          config: { temperature: 0.9 }
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'invalid-key')
        .send({
          contents: 'Test story context',
          config: { temperature: 0.9 }
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'test-api-key')
        .send({
          contents: 'Test story context',
          config: { temperature: 0.9 }
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/create-character', () => {
    it('should create character with valid API key', async () => {
      const response = await request(app)
        .post('/api/create-character')
        .set('x-proxy-key', 'test-api-key')
        .send({
          contents: 'Create initial character',
          config: { temperature: 1.0, model: 'gemini-2.5-flash' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('narrative');
      expect(response.body).toHaveProperty('updatedCharacterState');
      expect(response.body).toHaveProperty('choices');
      expect(response.body.narrative).toBe('Character created successfully');
      expect(response.body.updatedCharacterState.job).toBe('Medical Student');
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/create-character')
        .send({
          contents: 'Create initial character',
          config: { temperature: 1.0 }
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/generate-image', () => {
    it('should generate image with valid API key and image key configured', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .set('x-proxy-key', 'test-api-key')
        .send({ prompt: 'A beautiful landscape' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imageBase64');
      expect(response.body.imageBase64).toBe('mockBase64ImageData');
    });

    it('should return 204 when image API key is not configured', async () => {
      // Temporarily remove image API key
      const originalKey = process.env.IMAGE_API_KEY;
      delete process.env.IMAGE_API_KEY;

      const response = await request(app)
        .post('/api/generate-image')
        .set('x-proxy-key', 'test-api-key')
        .send({ prompt: 'A beautiful landscape' });

      expect(response.status).toBe(204);

      // Restore the key
      process.env.IMAGE_API_KEY = originalKey;
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({ prompt: 'A beautiful landscape' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle image API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Image API Error')
      });

      const response = await request(app)
        .post('/api/generate-image')
        .set('x-proxy-key', 'test-api-key')
        .send({ prompt: 'A beautiful landscape' });

      expect(response.status).toBe(502);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'test-api-key')
        .send({
          contents: 'Test within limit',
          config: { temperature: 0.9 }
        });

      expect(response.status).toBe(200);
    });

    // Note: Testing rate limiting would require more complex setup
    // as it depends on the rate limit middleware configuration
  });

  describe('Request Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'test-api-key')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400); // Express should handle this
    });

    it('should handle missing request body', async () => {
      const response = await request(app)
        .post('/api/next-segment')
        .set('x-proxy-key', 'test-api-key')
        .send();

      expect(response.status).toBe(500); // Our code expects contents in body
    });
  });
});