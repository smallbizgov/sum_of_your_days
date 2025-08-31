// A service to manage dynamic, mood-based music and sound effects.
import { SceneMood } from '../types';

type SoundEffect = 'click' | 'gameOver';
type MusicMood = SceneMood;

class AudioService {
  private musicTracks: { [key in MusicMood]?: HTMLAudioElement } = {};
  private soundEffects: { [key in SoundEffect]?: HTMLAudioElement } = {};
  private currentTrack: HTMLAudioElement | null = null;
  private isLoaded = false;
  private isMuted = false;

  private readonly audioSources = {
    // Music tracks for different moods
    Reflective: 'https://www.chosic.com/wp-content/uploads/2021/04/And-So-It-Begins-Inspired-By-Crush-Sometimes.mp3',
    Neutral: 'https://www.chosic.com/wp-content/uploads/2022/08/purrple-cat-lost-and-found.mp3',
    Happy: 'https://www.chosic.com/wp-content/uploads/2021/07/purrple-cat-wondering.mp3',
    Sad: 'https://www.chosic.com/wp-content/uploads/2020/09/Keys-of-Moon-A-Little-Story.mp3',
    Tense: 'https://www.chosic.com/wp-content/uploads/2021/05/Dark-Tranquility-by-An-Jone.mp3',
    
    // Sound effects
    click: 'https://soundbible.com/mp3/Tick-DeepFrozenApps-397275646.mp3',
    gameOver: 'https://www.chosic.com/wp-content/uploads/2022/02/The-Last-Goodbye.mp3',
  };

  public loadSounds(): void {
    if (this.isLoaded) return;

    // Load Music
    (Object.keys(this.audioSources) as Array<keyof typeof this.audioSources>).forEach(key => {
      const mood = key as MusicMood;
      if (['Neutral', 'Happy', 'Sad', 'Tense', 'Reflective'].includes(mood)) {
        const audio = new Audio(this.audioSources[mood]);
        audio.loop = true;
        audio.volume = 0.3;
        this.musicTracks[mood] = audio;
      }
    });

    // Load Sound Effects
    this.soundEffects.click = new Audio(this.audioSources.click);
    this.soundEffects.click.volume = 0.5;
    this.soundEffects.gameOver = new Audio(this.audioSources.gameOver);
    this.soundEffects.gameOver.volume = 0.4;
    
    this.isLoaded = true;
  }

  public setMusicByMood(mood: MusicMood): void {
    if (this.isMuted) return;

    const newTrack = this.musicTracks[mood];
    if (!newTrack) {
        console.warn(`Music for mood "${mood}" not found.`);
        return;
    }

    if (this.currentTrack === newTrack && !this.currentTrack.paused) {
      return; // Already playing the correct track
    }

    // Stop current track
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
    }

    // Play new track
    this.currentTrack = newTrack;
    this.currentTrack.play().catch(error => console.error(`Music playback for mood "${mood}" failed:`, error));
  }
  
  public playMusic(mood: MusicMood): void {
      this.setMusicByMood(mood);
  }

  public stopMusic(): void {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }
  }

  public playEffect(effect: SoundEffect): void {
    if (this.isMuted) return;
    const sound = this.soundEffects[effect];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error(`Sound effect '${effect}' playback failed:`, error));
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
        if (this.currentTrack) {
            this.currentTrack.pause();
        }
    } else {
        if (this.currentTrack) {
            this.currentTrack.play().catch(error => console.error("Music restart failed after unmuting:", error));
        }
    }
  }
}

// Export a singleton instance
const audioService = new AudioService();
export default audioService;