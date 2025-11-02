

import React, { useState, useMemo, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import FinalReward from './components/FinalReward';
import ImageEditor from './components/ImageEditor';
import DeveloperDashboard from './components/DeveloperDashboard';
import { Level, LevelProgress, LevelAttempt, QuestionResult } from './types';
import { LEVELS } from './data/gameData';

type GameScreenType = 'menu' | 'game' | 'reward' | 'imageEditor' | 'developerDashboard';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('menu');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({});
  const [gameResults, setGameResults] = useState<LevelAttempt[]>([]);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check for dev mode URL parameter on initial load
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      setIsDevMode(true);
    }
  }, []);

  const handleStartLevel = (levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (level) {
      setActiveLevel(level);
      setCurrentScreen('game');
    }
  };

  const handleStartImageEditor = () => {
    setCurrentScreen('imageEditor');
  };
  
  const handleShowDeveloperDashboard = () => {
    setCurrentScreen('developerDashboard');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const handleLevelComplete = (levelId: number, stars: number, results: QuestionResult[]) => {
    const newAttempt: LevelAttempt = {
      levelId,
      stars,
      timestamp: Date.now(),
      questions: results,
    };
    setGameResults(prev => [...prev, newAttempt]);

    setLevelProgress(prev => ({
      ...prev,
      [levelId]: { completed: true, stars: stars }
    }));
    setActiveLevel(null);
    const allLevelsCompleted = Object.keys(levelProgress).length === LEVELS.length - 1;
    if(allLevelsCompleted) {
        setCurrentScreen('reward');
    } else {
        setCurrentScreen('menu');
    }
  };
  
  const handleRestart = () => {
      setLevelProgress({});
      setGameResults([]);
      setCurrentScreen('menu');
  }

  const totalStars = useMemo(() => {
    // FIX: Explicitly type the accumulator in the reduce function to avoid it being inferred as 'unknown'.
    return Object.values(levelProgress).reduce((sum: number, p: LevelProgress[number]) => sum + p.stars, 0);
  }, [levelProgress]);


  const renderScreen = () => {
    switch (currentScreen) {
      case 'game':
        if (activeLevel) {
          return <GameScreen level={activeLevel} onLevelComplete={handleLevelComplete} onBackToMenu={handleBackToMenu} isDevMode={isDevMode} />;
        }
        // Fallback to menu if level is somehow null
        setCurrentScreen('menu');
        return null;
      case 'reward':
        return <FinalReward onRestart={handleRestart} totalStars={totalStars} />;
      case 'imageEditor':
        return <ImageEditor onBack={handleBackToMenu} />;
      case 'developerDashboard':
        return <DeveloperDashboard gameResults={gameResults} onBack={handleBackToMenu} />;
      case 'menu':
      default:
        return <MainMenu onStartLevel={handleStartLevel} levelProgress={levelProgress} onShowDeveloperDashboard={handleShowDeveloperDashboard} isDevMode={isDevMode} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 overflow-hidden">
        {renderScreen()}
    </div>
  );
};

export default App;