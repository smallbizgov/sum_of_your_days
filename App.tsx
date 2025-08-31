import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Character, Choice, StorySegment, GeminiResponse, StatModifiers, FinancialModifiers, SkillModifiers, Relationship, SceneMood } from './types';
import { getNextStorySegment, createCharacterAndStory, generateImage, generateRandomEvent, generateWorldEvent } from './services/geminiService';
import audioService from './services/audioService';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import TimelineScreen from './components/TimelineScreen';

const initialCharacterState: Character = {
  gender: null,
  age: 0,
  health: 0,
  mentalHealth: 0,
  happiness: 0,
  education: 0,
  hunger: 0,
  thirst: 0,
  finances: { checking: 0, savings: 0, income: 0, expenses: 0, netWorth: 0 },
  skills: { fitness: 0, intelligence: 0, charisma: 0 },
  time: { day: 0, hour: 0, minute: 0, dayOfWeek: 'Monday' },
  relationships: [],
  aspiration: null,
  habits: [],
  physicalDescription: null,
  location: null,
  job: null,
  conditions: [],
  schedule: [],
  worldState: { economicClimate: 'Stable', currentYear: 2024 },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE_SCREEN);
  const [character, setCharacter] = useState<Character>(initialCharacterState);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [aspirationsToChoose, setAspirationsToChoose] = useState<Choice[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [statModifiers, setStatModifiers] = useState<StatModifiers>({});
  const [financialModifiers, setFinancialModifiers] = useState<FinancialModifiers>({});
  const [skillModifiers, setSkillModifiers] = useState<SkillModifiers>({});
  const [isTimelineVisible, setIsTimelineVisible] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastWorldEventAge, setLastWorldEventAge] = useState<number>(0);

  useEffect(() => {
    audioService.loadSounds();
  }, []);

  const generateAndSetImage = async (narrative: string, historyIndex: number, char: Character) => {
    const imageUrl = await generateImage(narrative, char);
    if (imageUrl) {
        setStoryHistory(prevHistory => {
            const updatedHistory = [...prevHistory];
            if (updatedHistory[historyIndex]) {
                updatedHistory[historyIndex] = { ...updatedHistory[historyIndex], imageUrl };
            }
            return updatedHistory;
        });
    }
  };
  
  const handleApiResponse = (response: GeminiResponse, randomEventNarrative?: string, worldEvent?: { narrative: string, sources: any[] } | null) => {
      const { 
        narrative, updatedCharacterState, choices, isGameOver, 
        gameOverReason, aspirationsToChoose, statModifiers, 
        financialModifiers, skillModifiers, isMajorLifeEvent, sceneMood
      } = response;
      
      setCharacter(updatedCharacterState);

      if (sceneMood) {
        audioService.setMusicByMood(sceneMood);
      }

      if (statModifiers) {
        setStatModifiers(statModifiers);
        setTimeout(() => setStatModifiers({}), 3000);
      }
      if (financialModifiers) {
        setFinancialModifiers(financialModifiers);
        setTimeout(() => setFinancialModifiers({}), 3000);
      }
      if (skillModifiers) {
        setSkillModifiers(skillModifiers);
        setTimeout(() => setSkillModifiers({}), 3000);
      }

      const newSegment: StorySegment = { 
          narrative, 
          choices,
          randomEventNarrative,
          worldEventNarrative: worldEvent?.narrative,
          worldEventSources: worldEvent?.sources,
          age: updatedCharacterState.age,
          isMajorLifeEvent: isMajorLifeEvent || false,
      };
      setStoryHistory(prev => {
        const newHistory = [...prev, newSegment];
        if(!isGameOver) {
          generateAndSetImage(narrative, newHistory.length - 1, updatedCharacterState);
        }
        return newHistory;
      });

      if (aspirationsToChoose && aspirationsToChoose.length > 0) {
        setAspirationsToChoose(aspirationsToChoose);
        setCurrentChoices([]);
      } else {
        setAspirationsToChoose(null);
        setCurrentChoices(choices);
      }
      
      if (isGameOver) {
          audioService.stopMusic();
          audioService.playEffect('gameOver');
          setGameOverReason(gameOverReason);
          setGameState(GameState.GAME_OVER);
      }
  };

  const handleBegin = async () => {
    audioService.playMusic('Reflective');
    audioService.playEffect('click');
    setIsLoading(true);
    setGameState(GameState.PLAYING);
    setStoryHistory([]);
    setLastWorldEventAge(0);
    
    const response = await createCharacterAndStory();
    
    handleApiResponse(response);
    setIsLoading(false);
  };

  const handleContinueAsChild = useCallback(async (child: Relationship) => {
    audioService.playEffect('click');
    setIsLoading(true);
    setGameState(GameState.PLAYING);
    setStoryHistory([]);
    setLastWorldEventAge(0);
    
    const response = await createCharacterAndStory({
        parent: character,
        child: child,
    });
    
    handleApiResponse(response);
    setIsLoading(false);
    audioService.playMusic('Reflective');
  }, [character]);

  const getFullContext = (choiceText: string) => {
    const lastNarrative = storyHistory.length > 0 ? storyHistory[storyHistory.length - 1].narrative : "This is the beginning of my life.";
    return `My current character state is: ${JSON.stringify(character)}.
    The last thing that happened was: "${lastNarrative}". 
    I chose to: "${choiceText}". 
    What happens next? Calculate the new state.`;
  };

  const executeTurn = useCallback(async (context: string) => {
    setIsLoading(true);
    setCurrentChoices([]);

    let randomEventNarrative: string | null = null;
    if (Math.random() < 0.25 && storyHistory.length > 0) {
        randomEventNarrative = await generateRandomEvent(character);
    }
    
    let worldEventResult: { narrative: string; sources: any[]; } | null = null;
    const characterAge = character.age;
    // Trigger a world event roughly every 7 years, after age 18, and only once per age.
    if (characterAge > 18 && characterAge % 7 === 0 && characterAge !== lastWorldEventAge) {
        worldEventResult = await generateWorldEvent(character);
        setLastWorldEventAge(characterAge);
    }

    const response = await getNextStorySegment(context, randomEventNarrative || undefined, worldEventResult?.narrative || undefined);
    
    handleApiResponse(response, randomEventNarrative || undefined, worldEventResult);
    setIsLoading(false);
  }, [character, storyHistory, lastWorldEventAge]);

  const handleMakeChoice = useCallback(async (choice: Choice) => {
    audioService.playEffect('click');
    const context = getFullContext(choice.text);
    await executeTurn(context);
  }, [character, storyHistory, executeTurn]);

  const handleChooseAspiration = useCallback(async (choice: Choice) => {
    audioService.playEffect('click');
    const context = `My character state is ${JSON.stringify(character)}. They have just chosen their long-term aspiration: "${choice.text}". Describe the character's thoughts immediately after this life-altering decision, and set the scene for what happens next.`;
    await executeTurn(context);
  }, [character, executeTurn]);

  const handlePerformDailyAction = useCallback(async (action: string) => {
    audioService.playEffect('click');
    const context = getFullContext(action);
    await executeTurn(context);
  }, [character, storyHistory, executeTurn]);

  const handleRestart = () => {
    audioService.playEffect('click');
    audioService.stopMusic();
    setGameState(GameState.TITLE_SCREEN);
    setCharacter(initialCharacterState);
    setStoryHistory([]);
    setCurrentChoices([]);
    setAspirationsToChoose(null);
    setGameOverReason('');
    setIsLoading(false);
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioService.setMuted(newMutedState);
    if (!newMutedState) {
        audioService.playEffect('click');
    }
  };

  const renderGameContent = () => {
    switch (gameState) {
      case GameState.TITLE_SCREEN:
        return <TitleScreen onBegin={handleBegin} />;
      case GameState.PLAYING:
        return (
          <GameScreen
            characterStats={character}
            storyHistory={storyHistory}
            currentChoices={currentChoices}
            aspirationsToChoose={aspirationsToChoose}
            isLoading={isLoading}
            onMakeChoice={handleMakeChoice}
            onChooseAspiration={handleChooseAspiration}
            onPerformDailyAction={handlePerformDailyAction}
            statModifiers={statModifiers}
            financialModifiers={financialModifiers}
            skillModifiers={skillModifiers}
            onShowTimeline={() => setIsTimelineVisible(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        );
      case GameState.GAME_OVER:
        return <GameOverScreen 
                  reason={gameOverReason} 
                  onRestart={handleRestart}
                  onShowTimeline={() => {
                    audioService.playEffect('click');
                    setIsTimelineVisible(true);
                  }} 
                  children={character.relationships}
                  onContinueAsChild={handleContinueAsChild}
                />;
      default:
        return <TitleScreen onBegin={handleBegin} />;
    }
  };

  return (
    <div className="App">
      {renderGameContent()}
      {isTimelineVisible && 
        <TimelineScreen 
          storyHistory={storyHistory} 
          onClose={() => {
            audioService.playEffect('click');
            setIsTimelineVisible(false);
          }} 
        />}
    </div>
  );
};

export default App;
