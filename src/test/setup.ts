import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Audio API
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock Audio constructor
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockImplementation(() => Promise.resolve()),
  pause: vi.fn(),
  volume: 1,
  currentTime: 0,
}));