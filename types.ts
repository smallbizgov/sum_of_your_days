export enum GameState {
  TITLE_SCREEN,
  PLAYING,
  GAME_OVER,
}

export interface FinancialStats {
  checking: number;
  savings: number;
  income: number; // monthly
  expenses: number; // monthly
  netWorth: number;
}

export interface CharacterSkills {
  fitness: number;    // 0-100
  intelligence: number; // 0-100
  charisma: number;     // 0-100
}

export interface TimeStats {
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: string; // e.g., "Monday"
}

export interface HealthCondition {
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface ScheduledEvent {
    eventName: string;
    days: string[]; // e.g., ["Monday", "Tuesday", "Wednesday"]
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
}

export interface WorldState {
    economicClimate: 'Recession' | 'Stable' | 'Boom';
    currentYear: number;
}

export interface CharacterStats {
  age: number;
  health: number;    // 0-100
  mentalHealth: number; // 0-100
  happiness: number; // 0-100
  education: number;
  hunger: number;    // 0-100 (100 is full)
  thirst: number;    // 0-100 (100 is full)
  habits: string[];
  job: string | null;
  finances: FinancialStats;
  skills: CharacterSkills;
  time: TimeStats;
  conditions: HealthCondition[];
  schedule: ScheduledEvent[];
  worldState: WorldState;
}

export interface Relationship {
  name: string;
  type: 'Family' | 'Friend' | 'Romantic' | 'Rival' | 'Spouse' | 'Child' | 'Other';
  status: number; // -100 (Hate) to 100 (Love)
  lifeSituation: string | null; // e.g., "Successful Lawyer", "Struggling Artist"
  recentEvent: string | null;   // e.g., "Just got a promotion", "Feeling neglected"
}

export interface Character extends CharacterStats {
  gender: 'boy' | 'girl' | null;
  relationships: Relationship[];
  aspiration: string | null;
  physicalDescription: string | null;
  location: string | null;
}

export interface Choice {
  text: string;
}

export interface StorySegment {
  narrative: string;
  choices: Choice[];
  imageUrl?: string;
  randomEventNarrative?: string;
  worldEventNarrative?: string;
  worldEventSources?: any[];
  age: number;
  isMajorLifeEvent?: boolean;
}

export interface LegacyContext {
    parent: Character;
    child: Relationship;
}

// Represents the change in stats for a given turn
export type StatModifiers = Partial<Pick<CharacterStats, 'health' | 'happiness' | 'education' | 'hunger' | 'thirst' | 'mentalHealth'>>;
export type FinancialModifiers = Partial<FinancialStats>;
export type SkillModifiers = Partial<CharacterSkills>;
export type SceneMood = 'Neutral' | 'Happy' | 'Sad' | 'Tense' | 'Reflective';

export interface GeminiResponse {
  narrative: string;
  updatedCharacterState: Character; // The entire updated state of the character
  choices: Choice[];
  isGameOver: boolean;
  gameOverReason: string;
  sceneMood?: SceneMood;
  aspirationsToChoose?: Choice[];
  statModifiers?: StatModifiers;
  financialModifiers?: FinancialModifiers;
  skillModifiers?: SkillModifiers;
  isMajorLifeEvent?: boolean;
}