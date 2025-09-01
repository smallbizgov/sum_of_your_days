import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import audioService from './audioService';
import { SceneMood } from '../types';

// Mock Audio constructor and its methods
const mockPlay = vi.fn().mockImplementation(() => Promise.resolve());
const mockPause = vi.fn();
const mockAudioConstructor = vi.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: mockPause,
  loop: false,
  volume: 1,
  currentTime: 0,
}));

global.Audio = mockAudioConstructor as any;

describe('AudioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the service state by creating a new instance
    // Since it's a singleton, we need to reset its internal state
    (audioService as any).isLoaded = false;
    (audioService as any).currentTrack = null;
    (audioService as any).isMuted = false;
    (audioService as any).musicTracks = {};
    (audioService as any).soundEffects = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadSounds', () => {
    it('loads music tracks and sound effects on first call', () => {
      audioService.loadSounds();

      expect(mockAudioConstructor).toHaveBeenCalledTimes(7); // 5 music + 2 effects
      expect((audioService as any).isLoaded).toBe(true);
    });

    it('does not reload sounds if already loaded', () => {
      audioService.loadSounds();
      audioService.loadSounds(); // Second call

      expect(mockAudioConstructor).toHaveBeenCalledTimes(7); // Should not increase
    });

    it('sets correct properties for music tracks', () => {
      audioService.loadSounds();

      const musicCalls = mockAudioConstructor.mock.calls.slice(0, 5);
      musicCalls.forEach((call, index) => {
        const audioInstance = call[0];
        expect(audioInstance.loop).toBe(true);
        expect(audioInstance.volume).toBe(0.3);
      });
    });

    it('sets correct properties for sound effects', () => {
      audioService.loadSounds();

      const effectCalls = mockAudioConstructor.mock.calls.slice(5);
      expect(effectCalls[0][0].volume).toBe(0.5); // click
      expect(effectCalls[1][0].volume).toBe(0.4); // gameOver
    });
  });

  describe('setMusicByMood', () => {
    beforeEach(() => {
      audioService.loadSounds();
    });

    it('plays music for valid mood', async () => {
      audioService.setMusicByMood('Neutral');

      expect(mockPlay).toHaveBeenCalled();
    });

    it('does not play music when muted', () => {
      (audioService as any).isMuted = true;

      audioService.setMusicByMood('Happy');

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('stops current track before playing new one', () => {
      // First play a track
      audioService.setMusicByMood('Neutral');
      expect(mockPause).not.toHaveBeenCalled();

      // Play a different track
      audioService.setMusicByMood('Happy');

      expect(mockPause).toHaveBeenCalled();
    });

    it('does not restart same track if already playing', () => {
      audioService.setMusicByMood('Neutral');
      mockPlay.mockClear();

      audioService.setMusicByMood('Neutral');

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('handles invalid mood gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      audioService.setMusicByMood('InvalidMood' as SceneMood);

      expect(consoleSpy).toHaveBeenCalledWith('Music for mood "InvalidMood" not found.');
      expect(mockPlay).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('playMusic', () => {
    it('delegates to setMusicByMood', () => {
      const spy = vi.spyOn(audioService as any, 'setMusicByMood');

      audioService.playMusic('Reflective');

      expect(spy).toHaveBeenCalledWith('Reflective');
    });
  });

  describe('stopMusic', () => {
    it('stops current track and resets state', () => {
      audioService.loadSounds();
      audioService.setMusicByMood('Neutral');

      audioService.stopMusic();

      expect(mockPause).toHaveBeenCalled();
      expect((audioService as any).currentTrack).toBeNull();
    });

    it('handles no current track gracefully', () => {
      audioService.stopMusic();

      expect(mockPause).not.toHaveBeenCalled();
    });
  });

  describe('playEffect', () => {
    beforeEach(() => {
      audioService.loadSounds();
    });

    it('plays valid sound effect', () => {
      audioService.playEffect('click');

      expect(mockPlay).toHaveBeenCalled();
    });

    it('resets currentTime before playing effect', () => {
      audioService.playEffect('click');

      const audioInstance = mockAudioConstructor.mock.results[5].value; // click effect
      expect(audioInstance.currentTime).toBe(0);
    });

    it('does not play effects when muted', () => {
      (audioService as any).isMuted = true;

      audioService.playEffect('gameOver');

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('handles invalid effect gracefully', () => {
      audioService.playEffect('invalidEffect' as any);

      expect(mockPlay).not.toHaveBeenCalled();
    });
  });

  describe('setMuted', () => {
    beforeEach(() => {
      audioService.loadSounds();
    });

    it('mutes and pauses current track', () => {
      audioService.setMusicByMood('Neutral');
      mockPlay.mockClear();

      audioService.setMuted(true);

      expect((audioService as any).isMuted).toBe(true);
      expect(mockPause).toHaveBeenCalled();
    });

    it('unmutes and resumes current track', async () => {
      audioService.setMusicByMood('Neutral');
      audioService.setMuted(true);
      mockPlay.mockClear();

      audioService.setMuted(false);

      expect((audioService as any).isMuted).toBe(false);
      expect(mockPlay).toHaveBeenCalled();
    });

    it('handles unmuting with no current track', () => {
      audioService.setMuted(false);

      expect((audioService as any).isMuted).toBe(false);
      expect(mockPlay).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles play promise rejection for music', async () => {
      mockPlay.mockRejectedValueOnce(new Error('Playback failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      audioService.loadSounds();
      audioService.setMusicByMood('Neutral');

      expect(consoleSpy).toHaveBeenCalledWith('Music playback for mood "Neutral" failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles play promise rejection for effects', async () => {
      mockPlay.mockRejectedValueOnce(new Error('Effect playback failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      audioService.loadSounds();
      audioService.playEffect('click');

      expect(consoleSpy).toHaveBeenCalledWith("Sound effect 'click' playback failed:", expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles unmuting playback failure', async () => {
      mockPlay.mockRejectedValueOnce(new Error('Resume failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      audioService.loadSounds();
      audioService.setMusicByMood('Neutral');
      audioService.setMuted(true);
      audioService.setMuted(false);

      expect(consoleSpy).toHaveBeenCalledWith("Music restart failed after unmuting:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});