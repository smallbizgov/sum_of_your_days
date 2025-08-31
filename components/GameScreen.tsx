import React, { useEffect, useRef } from 'react';
import { Character, Choice, StorySegment, StatModifiers, FinancialModifiers, SkillModifiers, CharacterSkills, ScheduledEvent } from '../types';
import LoadingSpinner from './LoadingSpinner';
import StatDisplay from './StatDisplay';
import RelationshipDisplay from './RelationshipDisplay';

interface GameScreenProps {
  characterStats: Character;
  storyHistory: StorySegment[];
  currentChoices: Choice[];
  isLoading: boolean;
  onMakeChoice: (choice: Choice) => void;
  aspirationsToChoose: Choice[] | null;
  onChooseAspiration: (choice: Choice) => void;
  onPerformDailyAction: (action: string) => void;
  statModifiers: StatModifiers;
  financialModifiers: FinancialModifiers;
  skillModifiers: SkillModifiers;
  onShowTimeline: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const SmileyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>;
const AgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.293 7.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L10 15.414l-2.293 2.293a1 1 0 01-1.414-1.414l3-3zm-4-1.354a3 3 0 100-5.888 3 3 0 000 5.888zM16.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1.257-.257A6 6 0 1118 8zM10 2a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zM8 5V4a2 2 0 114 0v1h2a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h2z" clipRule="evenodd" /></svg>;
const BankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const JournalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const FoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm11 9a1 1 0 10-2 0v2a1 1 0 102 0v-2zM5 13a1 1 0 100 2h6a1 1 0 100-2H5z" /></svg>;
const WaterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 9.333A4.667 4.667 0 1010 4.667v4.666a4.667 4.667 0 00-5 0z" clipRule="evenodd" /></svg>;
const DumbbellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25278C12 6.25278 10.875 5 9.375 5C7.375 5 6.25 6.5625 6.25 8.125C6.25 9.6875 7.375 11.25 9.375 11.25C10.875 11.25 12 10 12 10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25278C12 6.25278 13.125 5 14.625 5C16.625 5 17.75 6.5625 17.75 8.125C17.75 9.6875 16.625 11.25 14.625 11.25C13.125 11.25 12 10 12 10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10V14" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14C12 14 10.875 12.75 9.375 12.75C7.375 12.75 6.25 14.3125 6.25 15.875C6.25 17.4375 7.375 19 9.375 19C10.875 19 12 17.75 12 17.75" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14C12 14 13.125 12.75 14.625 12.75C16.625 12.75 17.75 14.3125 17.75 15.875C17.75 17.4375 16.625 19 14.625 19C13.125 19 12 17.75 12 17.75" /></svg>;
const IntelligenceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0M12 6V3m-3.828 9.828a1 1 0 01-1.414 0l-2.122-2.122a1 1 0 011.414-1.414L6.172 12l-1.414 1.414a1 1 0 01-1.414-1.414l2.122-2.122a1 1 0 011.414 0z" /></svg>;
const CharismaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2v2z" /></svg>;
const SkillsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SpeakerOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>;
const SpeakerOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ScheduleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;


const pad = (num: number) => num.toString().padStart(2, '0');

interface FinanceInfoProps { label: string; value: string; color?: string; modifier?: number; }
const FinanceInfo: React.FC<FinanceInfoProps> = ({ label, value, color = 'text-slate-200', modifier }) => {
    const modifierColor = modifier && modifier > 0 ? 'text-green-400' : 'text-red-400';
    const modifierSign = modifier && modifier > 0 ? '+' : '';
    return (
      <div className="text-center md:text-left">
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="relative h-8 flex items-center justify-center md:justify-start">
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
            {modifier !== undefined && modifier !== 0 && (
              <span key={label + value} className={`absolute bottom-full mb-1 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${modifierColor} ${modifier > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} animate-fade-in-up opacity-0`}>
                {modifierSign}{Math.abs(modifier).toLocaleString()}
              </span>
            )}
        </div>
      </div>
    );
};

interface SkillDisplayProps { icon: React.ReactNode; label: string; value: number; modifier?: number; }
const SkillDisplay: React.FC<SkillDisplayProps> = ({ icon, label, value, modifier }) => {
    const modifierColor = modifier && modifier > 0 ? 'text-green-400' : 'text-red-400';
    const modifierSign = modifier && modifier > 0 ? '+' : '';
    return (
        <div className="bg-slate-800/50 p-3 rounded-lg text-sm w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-cyan-400">{icon}</span>
                    <span className="font-bold text-slate-200">{label}</span>
                </div>
                <div className="relative">
                    <span className="font-semibold text-slate-300">{value} / 100</span>
                     {modifier !== undefined && modifier !== 0 && (
                        <span key={label + value} className={`absolute -top-6 -right-1 px-1.5 py-0.5 rounded text-xs font-bold ${modifierColor} ${modifier > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} animate-fade-in-up opacity-0`}>
                          {modifierSign}{modifier}
                        </span>
                     )}
                </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};

const TodaysSchedule: React.FC<{ schedule: ScheduledEvent[]; dayOfWeek: string }> = ({ schedule, dayOfWeek }) => {
    const todaysEvents = schedule.filter(event => event.days.includes(dayOfWeek));

    if (todaysEvents.length === 0) {
        return (
            <div className="p-4 bg-slate-800/40 rounded-xl h-full">
                <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><ScheduleIcon /> Today's Schedule</h2>
                <p className="text-slate-400">You have the day off. Enjoy your free time!</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-800/40 rounded-xl h-full">
            <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><ScheduleIcon /> Today's Schedule</h2>
            <div className="space-y-2">
                {todaysEvents.map(event => (
                    <div key={event.eventName} className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded-md">
                        <p className="font-semibold">{event.eventName}</p>
                        <p className="text-xs text-slate-400">{`${pad(event.startTime.hour)}:${pad(event.startTime.minute)} - ${pad(event.endTime.hour)}:${pad(event.endTime.minute)}`}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GameScreen: React.FC<GameScreenProps> = ({ characterStats, storyHistory, currentChoices, isLoading, onMakeChoice, onChooseAspiration, onPerformDailyAction, aspirationsToChoose, statModifiers, financialModifiers, skillModifiers, onShowTimeline, isMuted, onToggleMute }) => {
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  const { finances, skills, time, relationships, aspiration, habits, conditions, schedule } = characterStats;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-sans">
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-4 shadow-lg shadow-black/20">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4">
          <StatDisplay icon={<ClockIcon />} value={`D${time.day} (${time.dayOfWeek}) ${pad(time.hour)}:${pad(time.minute)}`} label="Time" />
          <StatDisplay icon={<FoodIcon />} value={`${characterStats.hunger}%`} label="Hunger" modifier={statModifiers.hunger} />
          <StatDisplay icon={<WaterIcon />} value={`${characterStats.thirst}%`} label="Thirst" modifier={statModifiers.thirst} />
          <StatDisplay icon={<AgeIcon />} value={characterStats.age} label="Age" />
          <StatDisplay icon={<HeartIcon />} value={`${characterStats.health}%`} label="Health" modifier={statModifiers.health} />
          <StatDisplay icon={<SmileyIcon />} value={`${characterStats.happiness}%`} label="Happiness" modifier={statModifiers.happiness} />
          <StatDisplay icon={<BriefcaseIcon />} value={characterStats.job || 'Unemployed'} label="Occupation" />
          <button onClick={onShowTimeline} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-lg text-sm hover:bg-slate-700/70 transition-colors" title="View Timeline">
            <div className="text-cyan-400"><JournalIcon /></div>
            <span className="font-semibold text-slate-200">Journal</span>
          </button>
          <button onClick={onToggleMute} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-lg text-sm hover:bg-slate-700/70 transition-colors" title={isMuted ? "Unmute" : "Mute"}>
            <div className="text-cyan-400">{isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}</div>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-grow">
          {/* Main Info Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="p-4 bg-slate-800/40 rounded-xl lg:col-span-2">
                  <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><BankIcon /> Finances</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
                      <FinanceInfo label="Net Worth" value={`$${finances.netWorth.toLocaleString()}`} color="text-cyan-300" modifier={financialModifiers.netWorth} />
                      <FinanceInfo label="Checking" value={`$${finances.checking.toLocaleString()}`} modifier={financialModifiers.checking} />
                      <FinanceInfo label="Savings" value={`$${finances.savings.toLocaleString()}`} modifier={financialModifiers.savings} />
                      <FinanceInfo label="Income" value={`$${finances.income.toLocaleString()}/mo`} color="text-green-400" modifier={financialModifiers.income} />
                      <FinanceInfo label="Expenses" value={`$${finances.expenses.toLocaleString()}/mo`} color="text-red-400" modifier={financialModifiers.expenses} />
                  </div>
              </div>
               <TodaysSchedule schedule={schedule} dayOfWeek={time.dayOfWeek} />
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl mb-8">
              <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><SkillsIcon /> Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SkillDisplay icon={<DumbbellIcon/>} label="Fitness" value={skills.fitness} modifier={skillModifiers.fitness} />
                <SkillDisplay icon={<IntelligenceIcon/>} label="Intelligence" value={skills.intelligence} modifier={skillModifiers.intelligence} />
                <SkillDisplay icon={<CharismaIcon/>} label="Charisma" value={skills.charisma} modifier={skillModifiers.charisma} />
              </div>
          </div>
          
          {relationships.length > 0 && (
            <div className="mb-8 p-4 bg-slate-800/40 rounded-xl">
              <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><UsersIcon /> Relationships</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relationships.map(rel => <RelationshipDisplay key={rel.name} relationship={rel} />)}
              </div>
            </div>
          )}

          {conditions.length > 0 && (
            <div className="mb-8 p-4 bg-slate-800/40 rounded-xl">
                <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Health Conditions
                </h2>
                <div className="flex flex-wrap gap-2">
                    {conditions.map(condition => (
                      <span key={condition.name} className="text-sm font-medium px-3 py-1 bg-red-900/50 text-red-300 rounded-full border border-red-500/50">{condition.name} ({condition.severity})</span>
                    ))}
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {aspiration && (
                <div className="p-4 bg-slate-800/40 rounded-xl h-full">
                  <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><StarIcon /> Aspiration</h2>
                  <p className="text-slate-200 text-lg">{aspiration}</p>
                </div>
              )}
              {habits.length > 0 && (
                <div className="p-4 bg-slate-800/40 rounded-xl h-full">
                  <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><BrainIcon /> Habits</h2>
                  <div className="flex flex-wrap gap-2">
                    {habits.map(habit => (
                      <span key={habit} className="text-sm font-medium px-3 py-1 bg-slate-700 text-slate-300 rounded-full">{habit}</span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Story History */}
          {storyHistory.map((segment, index) => (
            <div key={index} className="mb-8 animate-fade-in opacity-0">
              {segment.worldEventNarrative && (
                <div className="mb-6 p-4 border-l-4 border-indigo-400 bg-slate-800/60 rounded-r-lg">
                  <h3 className="font-bold text-indigo-400 mb-2">A Shift in the World</h3>
                  <p className="text-slate-300 italic whitespace-pre-wrap">{segment.worldEventNarrative}</p>
{/* Fix: Display sources for world events as required by API guidelines. */}
                  {segment.worldEventSources && segment.worldEventSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Sources:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {segment.worldEventSources.map((source, i) => (
                          source && source.uri && (
                            <li key={i} className="text-slate-400">
                              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                {source.title || new URL(source.uri).hostname}
                              </a>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {segment.randomEventNarrative && (
                <div className="mb-6 p-4 border-l-4 border-amber-400 bg-slate-800/60 rounded-r-lg">
                  <h3 className="font-bold text-amber-400 mb-2">An Unexpected Event</h3>
                  <p className="text-slate-300 italic whitespace-pre-wrap">{segment.randomEventNarrative}</p>
                </div>
              )}
              <div className="mb-4 rounded-lg overflow-hidden shadow-lg bg-slate-800 aspect-video">
                {segment.imageUrl ? (<img src={segment.imageUrl} alt="A scene from the story" className="w-full h-full object-cover animate-fade-in opacity-0" />) : (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-slate-800/80 relative">
                    <div className="w-24 h-24 rounded-full animate-soft-pulse"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="font-medium text-slate-500">Visualizing memory...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{segment.narrative}</p>
            </div>
          ))}
          <div ref={storyEndRef} />
        </div>

        <div className="max-w-3xl mx-auto w-full mt-auto pt-6">
          {isLoading && <LoadingSpinner />}
          
          {aspirationsToChoose && aspirationsToChoose.length > 0 && !isLoading ? (
             <div className="animate-fade-in-up opacity-0">
                <h2 className="text-xl font-bold text-center mb-4 text-cyan-400">Choose Your Life's Ambition</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aspirationsToChoose.map((choice, index) => (
                    <button key={index} onClick={() => onChooseAspiration(choice)} disabled={isLoading} className="w-full text-left p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed">
                      <p className="text-slate-200 font-semibold">{choice.text}</p>
                    </button>
                  ))}
                </div>
              </div>
          ) : currentChoices.length > 0 && !isLoading ? (
             <div className="animate-fade-in-up opacity-0">
                <h3 className="text-sm text-center mb-3 text-slate-400 uppercase tracking-widest">An Event is Unfolding...</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentChoices.map((choice, index) => (
                      <button key={index} onClick={() => onMakeChoice(choice)} disabled={isLoading} className="w-full text-left p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed">
                        <p className="text-slate-200">{choice.text}</p>
                      </button>
                    ))}
                </div>
             </div>
          ) : null}
          
          {!isLoading && (
              <div className="animate-fade-in-up opacity-0 mt-6">
                  <h3 className="text-sm text-center mb-3 text-slate-400 uppercase tracking-widest">Daily Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button onClick={() => onPerformDailyAction('Workout')} className="p-3 text-sm bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors">Workout</button>
                      <button onClick={() => onPerformDailyAction('Study')} className="p-3 text-sm bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors">Study</button>
                      <button onClick={() => onPerformDailyAction('Socialize')} className="p-3 text-sm bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors">Socialize</button>
                      <button onClick={() => onPerformDailyAction('Eat or Drink')} className="p-3 text-sm bg-slate-800 rounded-lg border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors">Eat/Drink</button>
                  </div>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GameScreen;
