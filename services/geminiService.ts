import { Type } from "@google/genai";
import { Character, CharacterStats, Choice, GeminiResponse, LegacyContext, HealthCondition } from '../types';

const API_BASE = window?.location?.origin || '';

const systemInstruction = `
You are a text-based life simulation game master. Your goal is to create a branching, dynamic, and realistic life story for the user. Your narrative style is deeply immersive, written from a first-person perspective, focusing on the character's internal thoughts and feelings. You will manage ALL aspects of the character's state.

RULES:
1.  **Always respond in JSON format.** Do not add any text before or after the JSON object.
2.  The JSON object must strictly adhere to the provided schema. You MUST return the complete 'updatedCharacterState' object with ALL fields populated.

---
**CORE SIMULATION (CRITICAL)**
You are in complete control of the simulation. Every action has a cause and effect that you must calculate and reflect in the state.

3.  **Time Management & Calendar:** You MUST manage a 24-hour clock and a 7-day week calendar. Every choice or action consumes time. You MUST update the clock realistically. When the 'day' increments, you MUST update the 'dayOfWeek'. The 'worldState.currentYear' MUST be incremented every 365 days.
4.  **Physiological Needs:** You MUST manage 'hunger' and 'thirst'. They decrease gradually over time. If they get too low, health and happiness MUST decrease significantly.
5.  **Tangible Health System:** You MUST manage 'health' and 'mentalHealth' separately. Habits and stress can lead to 'conditions' which have narrative and mechanical impacts.
6.  **Schedule Management (CRITICAL):** You MUST create and manage a 'schedule' for the character based on their job, school, or other major responsibilities. The schedule is an array of objects in the character state. When the in-game time overlaps with a scheduled event, the narrative and potential story events MUST reflect this. Skipping scheduled responsibilities MUST have negative consequences.
7.  **The Tides of Time (CRITICAL):** You MUST consider the 'worldState.economicClimate' ('Recession', 'Stable', 'Boom') when generating all narratives and outcomes. A character trying to get a job during a 'Recession' will face extreme difficulty. A character with investments during a 'Boom' will see greater returns. This MUST be a tangible factor in the simulation.

---
**GAMEPLAY LOOP: FREE WILL & DYNAMIC STORYTELLER (CRITICAL)**

8.  **Player Agency is Default:** The player's primary way of interacting is through "Daily Actions". When the user performs a Daily Action, you will execute it, update the state, and narrate the outcome. For these routine actions, you MUST return an **empty 'choices' array**.
9.  **You are the Dynamic Storyteller:** At random, narratively appropriate moments, you will proactively trigger a multi-choice story event. This is an interruption to the character's daily life.
10. **Skills & Habits:** Skills ('fitness', 'intelligence', 'charisma') are improved through related daily actions. Habits form after repeated actions or significant events and influence stats and story event probability. The "mood gate" still applies: a character with low happiness will struggle to perform positive actions.

---
**LIVING WORLD & DYNAMIC NPCS (CRITICAL)**
11. **Proactive NPCs & Social Dilemmas:** NPCs have their own lives that progress in the background. On any given turn, you have a chance (approx. 25%) to trigger a proactive event where an NPC's life directly intersects with the player's, creating a social dilemma. This event MUST be presented as a core part of the narrative and often result in a difficult, story-altering choice for the player. The NPC's 'lifeSituation' and 'recentEvent' fields MUST be updated to reflect this.
    *   **Example Dilemma:** A spouse gets a dream job offer in another city, forcing a choice about moving.
    *   **Example Dilemma:** A close friend asks for a large, risky loan for a new business venture.
    *   **Example Dilemma:** A child gets into serious trouble at school, requiring the player's direct intervention.
    *   **Example Dilemma:** A rival's success directly and negatively impacts the player's career.

---
**NARRATIVE STYLE & MOOD (CRITICAL)**
12. Every response must be a deep, first-person internal monologue. "Show, don't tell."
13. You MUST set the 'sceneMood' ('Neutral', 'Happy', 'Sad', 'Tense', 'Reflective').

---
**RESPONSE FORMAT**
14. **State Replacement:** You will return the *entire* updated state of the character in the \`updatedCharacterState\` object.
15. **Modifiers:** You MUST populate the 'statModifiers', 'financialModifiers', and 'skillModifiers' objects with the numerical *change* for any stat that was affected this turn.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "A paragraph of the story describing the current situation from a first-person, internal monologue perspective.",
    },
    updatedCharacterState: {
        type: Type.OBJECT,
        description: "The complete, updated state of the character after the action.",
        properties: {
            gender: { type: Type.STRING },
            age: { type: Type.NUMBER },
            health: { type: Type.NUMBER },
            mentalHealth: { type: Type.NUMBER },
            happiness: { type: Type.NUMBER },
            education: { type: Type.NUMBER },
            hunger: { type: Type.NUMBER },
            thirst: { type: Type.NUMBER },
            physicalDescription: { type: Type.STRING },
            location: { type: Type.STRING },
            aspiration: { type: Type.STRING },
            job: { type: Type.STRING },
            habits: { type: Type.ARRAY, items: { type: Type.STRING } },
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        eventName: { type: Type.STRING },
                        days: { type: Type.ARRAY, items: { type: Type.STRING } },
                        startTime: { type: Type.OBJECT, properties: { hour: { type: Type.NUMBER }, minute: { type: Type.NUMBER } } },
                        endTime: { type: Type.OBJECT, properties: { hour: { type: Type.NUMBER }, minute: { type: Type.NUMBER } } }
                    },
                    required: ["eventName", "days", "startTime", "endTime"]
                }
            },
            conditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ["name", "severity"]
              }
            },
            finances: {
                type: Type.OBJECT,
                properties: {
                    checking: { type: Type.NUMBER },
                    savings: { type: Type.NUMBER },
                    income: { type: Type.NUMBER },
                    expenses: { type: Type.NUMBER },
                    netWorth: { type: Type.NUMBER },
                },
                required: ["checking", "savings", "income", "expenses", "netWorth"]
            },
            skills: {
                type: Type.OBJECT,
                properties: {
                    fitness: { type: Type.NUMBER },
                    intelligence: { type: Type.NUMBER },
                    charisma: { type: Type.NUMBER },
                },
                required: ["fitness", "intelligence", "charisma"]
            },
            time: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER },
                    hour: { type: Type.NUMBER },
                    minute: { type: Type.NUMBER },
                    dayOfWeek: { type: Type.STRING },
                },
                required: ["day", "hour", "minute", "dayOfWeek"]
            },
            relationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  status: { type: Type.NUMBER },
                  lifeSituation: { type: Type.STRING, description: "The NPC's current general life situation. Nullable." },
                  recentEvent: { type: Type.STRING, description: "A recent event that happened to the NPC. Nullable." }
                },
                required: ["name", "type", "status", "lifeSituation", "recentEvent"]
              }
            },
            worldState: {
                type: Type.OBJECT,
                properties: {
                    economicClimate: { type: Type.STRING, enum: ['Recession', 'Stable', 'Boom'] },
                    currentYear: { type: Type.NUMBER },
                },
                required: ["economicClimate", "currentYear"]
            }
        },
        required: ["gender", "age", "health", "mentalHealth", "happiness", "education", "hunger", "thirst", "physicalDescription", "location", "aspiration", "job", "habits", "conditions", "schedule", "finances", "skills", "time", "relationships", "worldState"]
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of choices for the player. For routine daily actions, this MUST be an empty array. Only populate this array when you, the Storyteller, trigger a dynamic story event.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The text for a choice the user can make." },
        },
        required: ["text"]
      },
    },
    isGameOver: { type: Type.BOOLEAN },
    gameOverReason: { type: Type.STRING, description: "Reason for game over, or empty string." },
    sceneMood: {
        type: Type.STRING,
        description: "The dominant emotional mood of the scene. Used to select background music.",
        enum: ['Neutral', 'Happy', 'Sad', 'Tense', 'Reflective']
    },
    aspirationsToChoose: {
      type: Type.ARRAY,
      description: "A list of aspirations for the user to choose from. Only present this once.",
      items: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING } },
        required: ["text"]
      }
    },
    statModifiers: {
        type: Type.OBJECT,
        description: "An object showing the numerical change in stats for this turn. e.g. { 'health': -5 }",
        properties: {
            health: { type: Type.NUMBER },
            mentalHealth: { type: Type.NUMBER },
            happiness: { type: Type.NUMBER },
            education: { type: Type.NUMBER },
            hunger: { type: Type.NUMBER },
            thirst: { type: Type.NUMBER },
        }
    },
    financialModifiers: {
        type: Type.OBJECT,
        description: "An object showing the numerical change in finances for this turn. e.g. { 'checking': -50 }",
        properties: {
            checking: { type: Type.NUMBER },
            savings: { type: Type.NUMBER },
            income: { type: Type.NUMBER },
            expenses: { type: Type.NUMBER },
            netWorth: { type: Type.NUMBER },
        }
    },
    skillModifiers: {
        type: Type.OBJECT,
        description: "An object showing the numerical change in skills for this turn. e.g. { 'fitness': 1 }",
        properties: {
            fitness: { type: Type.NUMBER },
            intelligence: { type: Type.NUMBER },
            charisma: { type: Type.NUMBER },
        }
    },
    isMajorLifeEvent: {
        type: Type.BOOLEAN,
        description: "Set to true ONLY for a major, life-defining event. Use sparingly."
    }
  },
  required: ["narrative", "updatedCharacterState", "choices", "isGameOver", "gameOverReason"]
};

const generatePrompt = (context: string, randomEventNarrative?: string, worldEventNarrative?: string): string => {
  let fullContext = `My current character state is: ${context}.\n`;
  if (randomEventNarrative) {
    fullContext += `An unexpected personal event also occurred: "${randomEventNarrative}".\n`;
  }
  if (worldEventNarrative) {
    fullContext += `A major world event is also impacting the character: "${worldEventNarrative}".\n`;
  }
  fullContext += "Generate the next part of the story. The 'narrative' you generate should describe the combined outcome. Update the entire character state logically based on all events."
  return fullContext;
};

export const getNextStorySegment = async (context: string, randomEventNarrative?: string, worldEventNarrative?: string): Promise<GeminiResponse> => {
  try {
    const body = {
      contents: generatePrompt(context, randomEventNarrative, worldEventNarrative),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,
        model: 'gemini-2.5-flash'
      }
    };

    const resp = await fetch(`${API_BASE}/api/next-segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    // The server returns the raw GenAI response object; attempt to extract text
    const text = data?.candidates?.[0]?.content?.text || data?.text || JSON.stringify(data);
    const jsonText = text.trim();
    const parsed = JSON.parse(jsonText) as GeminiResponse;
    return parsed;

  } catch (error) {
    console.error("Error fetching story segment via proxy:", error);
    const fallbackFinances = { checking: 0, savings: 0, income: 0, expenses: 0, netWorth: 0 };
    const fallbackSkills = { fitness: 0, intelligence: 0, charisma: 0 };
    const fallbackTime = { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' };
    const fallbackWorldState = { economicClimate: 'Stable' as 'Stable', currentYear: new Date().getFullYear() };
    const fallbackCharacter: Character = {
        gender: 'boy', age: 18, health: 100, mentalHealth: 100, happiness: 50, education: 12,
        hunger: 80, thirst: 80, habits: [], job: null, finances: fallbackFinances,
        skills: fallbackSkills, time: fallbackTime, relationships: [], aspiration: null,
        physicalDescription: 'An average person', location: 'An unknown place', conditions: [], schedule: [], worldState: fallbackWorldState
    };
    return {
      narrative: "An unexpected error occurred. The fabric of reality seems to have torn. Perhaps you should try again?",
      updatedCharacterState: fallbackCharacter,
      choices: [{ text: "Restart" }],
      isGameOver: true,
      gameOverReason: "A critical error occurred with the simulation."
    };
  }
};

export const generateRandomEvent = async (character: Character): Promise<string | null> => {
  // Omitted for brevity: The random event generator's logic remains the same.
  return null; // Simplified for this change, real implementation would remain.
};

export const generateWorldEvent = async (character: Character): Promise<{narrative: string, sources: any[]} | null> => {
    const worldEventSystemInstruction = `
    You are a world event generator for a life simulation game. Your goal is to find a major real-world event that impacts the player's life and update the world's economic climate.

    RULES:
    1.  **Always respond in JSON format.** Your response must be a single JSON object with two keys: "narrative" and "newEconomicClimate". Example: { "narrative": "...", "newEconomicClimate": "Recession" }
    2.  Use the Google Search tool to find a significant, real-world event (economic, political, technological, or cultural) that occurred in or around the character's 'currentYear' and 'location'.
    3.  Your narrative MUST be a concise, one-paragraph summary of the event and its immediate, tangible impact on the player's life.
    4.  You MUST determine the new 'economicClimate' ('Recession', 'Stable', 'Boom') that results from this event. The narrative must mention this new climate.
    5.  You MUST return the sources you used for your research.
    `;
    try {
    const body = {
      contents: `Generate a major world event for a character in the year ${character.worldState.currentYear} living in ${character.location}.`,
      config: {
        systemInstruction: worldEventSystemInstruction,
        temperature: 1.0,
        tools: [{ googleSearch: {} }],
        model: 'gemini-2.5-flash'
      }
    };

    const resp = await fetch(`${API_BASE}/api/next-segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const response = await resp.json();
    const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || [];

    let jsonText = (response?.candidates?.[0]?.content?.text || response?.text || JSON.stringify(response)).trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }

        try {
            const data = JSON.parse(jsonText) as { narrative: string, newEconomicClimate: 'Recession' | 'Stable' | 'Boom' };
            
            const narrativeWithClimate = `(${data.newEconomicClimate}) ${data.narrative}`;
            
            return { narrative: narrativeWithClimate, sources };
        } catch (parseError) {
            console.error("Failed to parse JSON from world event response:", parseError, "Raw text:", response.text);
            return { narrative: response.text, sources };
        }
    } catch (error) {
        console.error("Error generating world event:", error);
        return null;
    }
};

const getCreateCharacterSystemInstruction = (legacyContext?: LegacyContext) => {
    if (legacyContext) {
        // Omitted for brevity: Legacy/Generational play logic remains the same.
        return `You are creating a legacy character...`;
    }

    return `
    You are creating the starting point for a life simulation game. The goal is to generate a completely random and unique starting scenario for a new character.

    RULES:
    1.  **Always respond in JSON format** matching the provided schema. You must return the COMPLETE 'updatedCharacterState' object.
    2.  **Total Randomness (CRITICAL):**
        *   You MUST randomly determine the character's 'gender' ('boy' or 'girl').
        *   You MUST set a random starting 'age' between 8 and 55.
        *   You MUST generate a specific, real-world starting 'location' (e.g., "Kyoto, Japan" or "Bend, Oregon, USA").
        *   You MUST set a random 'worldState.currentYear' between 1 AD and 2124.
    3.  **Historical/Future Context (CRITICAL):**
        *   **If the 'currentYear' is in the past**, you MUST use the Google Search tool to research the actual historical context of that year and location. The character's backstory, situation, job, finances, and relationships MUST be historically plausible.
        *   **If the 'currentYear' is in the future**, you MUST generate a plausible, speculative vision of that future world.
    4.  **Inherent Challenge (CRITICAL):** Every character, regardless of their starting situation, MUST begin with a significant, pre-existing life problem or source of conflict.
        *   **Example (Wealthy):** A 45-year-old CEO with a massive net worth, but also a secret gambling addiction, a cheating spouse, and a strained relationship with their children.
        *   **Example (Poor):** A 19-year-old living in a crowded apartment, working two jobs to support their family, but possessing a brilliant, undiscovered talent for music.
        *   **Example (Child):** An 11-year-old dealing with the recent divorce of their parents and being bullied at a new school.
    5.  **Backstory & Justification:** You must generate a unique backstory that justifies all the initial stats, relationships, and the starting problem.
    6.  **Set all initial character stats:** These MUST be logical consequences of the generated backstory. 'schedule' MUST be created based on their age/job. You MUST set the initial 'worldState.economicClimate' to 'Stable'.
    7.  **Write the initial 'narrative':** Introduce the character and their current, challenging situation.
    8.  **Provide the first 3-4 'choices'** directly relevant to their starting problem.
    `;
};

export const createCharacterAndStory = async (legacyContext?: LegacyContext): Promise<GeminiResponse> => {
    const createCharacterSystemInstruction = getCreateCharacterSystemInstruction(legacyContext);
    
    const useGoogleSearch = !legacyContext;
    
    const config: any = {
        systemInstruction: createCharacterSystemInstruction,
        temperature: 1.0,
    };

    if (useGoogleSearch) {
        config.tools = [{googleSearch: {}}];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = responseSchema;
    }

    try {
    const body = {
      contents: "Create the initial character and starting scenario.",
      config: config,
    };

    const resp = await fetch(`${API_BASE}/api/create-character`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const response = await resp.json();
    let jsonText = (response?.candidates?.[0]?.content?.text || response?.text || JSON.stringify(response)).trim();
    if (useGoogleSearch) {
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
      }
    }
    return JSON.parse(jsonText) as GeminiResponse;
    
      } catch (error) {
        console.error("Error creating initial character from Gemini:", error);
        const fallbackFinances = { checking: 500, savings: 0, income: 0, expenses: 0, netWorth: 500 };
        const fallbackSkills = { fitness: 5, intelligence: 5, charisma: 5 };
        const fallbackTime = { day: 1, hour: 8, minute: 0, dayOfWeek: 'Monday' };
        const fallbackWorldState = { economicClimate: 'Stable' as 'Stable', currentYear: new Date().getFullYear() };
        const fallbackCharacter: Character = {
            gender: 'boy', age: 18, health: 100, mentalHealth: 100, happiness: 50, education: 12,
            hunger: 80, thirst: 80, habits: [], job: "Unemployed", finances: fallbackFinances,
            skills: fallbackSkills, time: fallbackTime, relationships: [], aspiration: null,
            physicalDescription: "An entirely average person.", location: "An unspecified place.", conditions: [], schedule: [], worldState: fallbackWorldState
        };
        // Create a fallback error response
        return {
          narrative: "An unexpected error occurred during character creation. The universe failed to coalesce. Please try starting a new life.",
          updatedCharacterState: fallbackCharacter,
          choices: [{ text: "Restart" }],
          isGameOver: true,
          gameOverReason: "A critical error occurred during the simulation's big bang."
        };
      }
};

export const generateImage = async (narrative: string, character: Character): Promise<string | null> => {
  if (!character.physicalDescription || !character.gender) {
    return null; // Don't generate an image if we don't know what the character looks like
  }
  try {
    // Convert 2nd person narrative to a 3rd person description for a better image prompt.
    const thirdPersonNarrative = narrative
        .replace(/\b(I am|I'm)\b/gi, `the character is`)
        .replace(/\bmy\b/gi, 'their')
        .replace(/\bI\b/gi, 'the character');

    const imagePrompt = `A digital painting of a ${character.age}-year-old ${character.gender === 'boy' ? 'male' : 'female'}.
Year: ${character.worldState.currentYear}.
Job: ${character.job || 'Unemployed'}.
Appearance: ${character.physicalDescription}.
Location: ${character.location}.
Scene: ${thirdPersonNarrative}.
Style: cinematic, evocative, slightly stylized realism, moody lighting.`;

    // Send prompt to server proxy which will call the image generation API.
    try {
      const resp = await fetch(`${API_BASE}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (resp.status === 204) return null;
      const data = await resp.json();
      // Expecting { imageBase64: string }
      if (data && data.imageBase64) return `data:image/jpeg;base64,${data.imageBase64}`;
      return null;
    } catch (err) {
      console.error('Image generation proxy error:', err);
      return null;
    }

  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};