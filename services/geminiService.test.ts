import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNextStorySegment,
  createCharacterAndStory,
  generateImage,
  generateRandomEvent,
  generateWorldEvent
} from './geminiService';
import { Character } from '../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin for API_BASE
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNextStorySegment', () => {
    it('successfully fetches and parses story segment', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            text: JSON.stringify({
              narrative: 'Test narrative',
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getNextStorySegment('Test context');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/next-segment',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );

      expect(result.narrative).toBe('Test narrative');
      expect(result.isGameOver).toBe(false);
    });

    it('handles API errors gracefully with fallback response', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getNextStorySegment('Test context');

      expect(result.narrative).toContain('unexpected error occurred');
      expect(result.isGameOver).toBe(true);
      expect(result.gameOverReason).toContain('critical error');
      expect(result.choices).toEqual([{ text: 'Restart' }]);
    });

    it('includes random event narrative in prompt when provided', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            text: JSON.stringify({
              narrative: 'Test with random event',
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await getNextStorySegment('Test context', 'Random event occurred');

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.contents).toContain('Random event occurred');
    });

    it('includes world event narrative in prompt when provided', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            text: JSON.stringify({
              narrative: 'Test with world event',
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await getNextStorySegment('Test context', undefined, 'World event occurred');

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.contents).toContain('World event occurred');
    });
  });

  describe('createCharacterAndStory', () => {
    it('successfully creates initial character', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            text: JSON.stringify({
              narrative: 'Initial character created',
              updatedCharacterState: {
                gender: 'girl',
                age: 25,
                health: 100,
                mentalHealth: 100,
                happiness: 50,
                education: 16,
                hunger: 80,
                thirst: 80,
                physicalDescription: 'Test description',
                location: 'Test City, USA',
                aspiration: null,
                job: 'Software Engineer',
                habits: [],
                schedule: [],
                conditions: [],
                finances: { checking: 2000, savings: 5000, income: 60000, expenses: 3000, netWorth: 7000 },
                skills: { fitness: 5, intelligence: 8, charisma: 6 },
                time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
                relationships: [],
                worldState: { economicClimate: 'Stable', currentYear: 2024 }
              },
              choices: [{ text: 'Start working' }, { text: 'Take a day off' }],
              isGameOver: false,
              gameOverReason: ''
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await createCharacterAndStory();

      expect(result.narrative).toBe('Initial character created');
      expect(result.updatedCharacterState.age).toBe(25);
      expect(result.updatedCharacterState.job).toBe('Software Engineer');
      expect(result.choices).toHaveLength(2);
    });

    it('handles creation errors with fallback character', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Creation failed'));

      const result = await createCharacterAndStory();

      expect(result.narrative).toContain('unexpected error occurred');
      expect(result.isGameOver).toBe(true);
      expect(result.updatedCharacterState.age).toBe(18);
      expect(result.updatedCharacterState.job).toBe('Unemployed');
    });
  });

  describe('generateImage', () => {
    it('successfully generates image URL', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ imageBase64: 'testBase64Data' })
      });

      const result = await generateImage('Test narrative', mockCharacter);

      expect(result).toBe('data:image/jpeg;base64,testBase64Data');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/generate-image',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('returns null when character lacks required description', async () => {
      const mockCharacter: Character = {
        gender: null,
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: null,
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      const result = await generateImage('Test narrative', mockCharacter);

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns null when API returns 204 status', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      mockFetch.mockResolvedValueOnce({
        status: 204
      });

      const result = await generateImage('Test narrative', mockCharacter);

      expect(result).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      mockFetch.mockRejectedValueOnce(new Error('Image API failed'));

      const result = await generateImage('Test narrative', mockCharacter);

      expect(result).toBeNull();
    });
  });

  describe('generateRandomEvent', () => {
    it('returns null (simplified implementation)', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      const result = await generateRandomEvent(mockCharacter);

      expect(result).toBeNull();
    });
  });

  describe('generateWorldEvent', () => {
    it('successfully generates world event with sources', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      const mockResponse = {
        candidates: [{
          content: {
            text: JSON.stringify({
              narrative: 'A major economic event occurred',
              newEconomicClimate: 'Recession'
            })
          },
          groundingMetadata: {
            groundingChunks: [
              { web: { title: 'Economic News', url: 'https://example.com' } }
            ]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateWorldEvent(mockCharacter);

      expect(result).toEqual({
        narrative: '(Recession) A major economic event occurred',
        sources: [{ title: 'Economic News', url: 'https://example.com' }]
      });
    });

    it('handles API errors gracefully', async () => {
      const mockCharacter: Character = {
        gender: 'boy',
        age: 25,
        health: 100,
        mentalHealth: 100,
        happiness: 50,
        education: 16,
        hunger: 80,
        thirst: 80,
        physicalDescription: 'Tall with brown hair',
        location: 'New York City',
        aspiration: null,
        job: 'Engineer',
        habits: [],
        schedule: [],
        conditions: [],
        finances: { checking: 1000, savings: 5000, income: 50000, expenses: 2000, netWorth: 6000 },
        skills: { fitness: 5, intelligence: 8, charisma: 6 },
        time: { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' },
        relationships: [],
        worldState: { economicClimate: 'Stable', currentYear: 2024 }
      };

      mockFetch.mockRejectedValueOnce(new Error('World event API failed'));

      const result = await generateWorldEvent(mockCharacter);

      expect(result).toBeNull();
    });
  });
});