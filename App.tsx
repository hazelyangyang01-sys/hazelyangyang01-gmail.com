import React, { useState, useMemo } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import FinalReward from './components/FinalReward';
import ImageEditor from './components/ImageEditor';
import { Level, LevelProgress } from './types';
import { LEVELS } from './data/gameData';

type GameScreenType = 'menu' | 'game' | 'reward' | 'imageEditor';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('menu');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({});

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

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const handleLevelComplete = (levelId: number, stars: number) => {
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
          return <GameScreen level={activeLevel} onLevelComplete={handleLevelComplete} />;
        }
        // Fallback to menu if level is somehow null
        setCurrentScreen('menu');
        return null;
      case 'reward':
        return <FinalReward onRestart={handleRestart} totalStars={totalStars} />;
      case 'imageEditor':
        return <ImageEditor onBack={handleBackToMenu} />;
      case 'menu':
      default:
        return <MainMenu onStartLevel={handleStartLevel} levelProgress={levelProgress} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 overflow-hidden">
        {renderScreen()}
    </div>
  );
};

export default App;