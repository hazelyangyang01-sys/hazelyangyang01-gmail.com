import React from 'react';
import { WORDS, LEVELS } from '../data/gameData';
import { LevelProgress } from '../types';
import { GemIcon, StarIcon } from './icons';

interface MainMenuProps {
  onStartLevel: (levelId: number) => void;
  levelProgress: LevelProgress;
}

const rainbowColors = [
    'from-red-400 to-red-600',
    'from-orange-400 to-orange-600',
    'from-yellow-400 to-yellow-600',
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-purple-400 to-purple-600',
];


const MainMenu: React.FC<MainMenuProps> = ({ onStartLevel, levelProgress }) => {
    // FIX: Explicitly type the accumulator in the reduce function to avoid it being inferred as 'unknown'.
    const totalStars = Object.values(levelProgress).reduce((sum: number, p: LevelProgress[number]) => sum + p.stars, 0);

    // FIX: Explicitly type the parameter of the filter function to avoid it being inferred as 'unknown'.
    const completedCount = Object.values(levelProgress).filter((p: LevelProgress[number]) => p.completed).length;

    return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-100 to-blue-200">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          七彩词语寻宝
        </h1>
        <p className="text-xl text-gray-600 mt-2">快来完成所有挑战，集齐七彩宝石吧！</p>
         <div className="mt-4 flex items-center justify-center gap-2 text-3xl font-bold text-yellow-500">
            <StarIcon className="w-8 h-8"/>
            <span>{totalStars}</span>
        </div>
      </div>

      <div className="relative w-full max-w-4xl p-8 mb-4">
        <img src="https://picsum.photos/seed/mapbg/1000/600" alt="Treasure Map" className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-30"/>
        <div className="relative flex flex-col md:flex-row justify-center gap-4">
            {LEVELS.map(level => (
                <button 
                    key={level.id} 
                    onClick={() => onStartLevel(level.id)} 
                    className={`p-4 rounded-2xl shadow-lg text-white text-center transform hover:scale-105 transition-transform ${levelProgress[level.id]?.completed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-blue-500 to-teal-400'}`}
                    disabled={levelProgress[level.id]?.completed}
                >
                    <h2 className="text-2xl font-bold">{level.title}</h2>
                    <p className="text-base mt-2">重点: <span className="text-xl font-black">{level.focus}</span></p>
                    {levelProgress[level.id]?.completed && (
                        <div className="mt-2 flex justify-center">
                           {[...Array(levelProgress[level.id].stars)].map((_, i) => <StarIcon key={i} className="w-6 h-6 text-yellow-300"/>)}
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>
      
      <div className="w-full max-w-4xl p-4 bg-white/50 rounded-2xl shadow-lg mt-8">
          <h3 className="text-2xl text-center font-bold text-gray-700 mb-4">本周词语</h3>
          <div className="flex flex-wrap justify-center gap-4">
              {WORDS.map((word, index) => (
                  <div key={word.character} className={`relative px-4 py-2 rounded-full text-white text-xl font-bold shadow-md bg-gradient-to-r ${rainbowColors[index % rainbowColors.length]}`}>
                      {word.character}
                      {completedCount > 0 && index < completedCount * 2 + 1 ? (
                          <GemIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 transform rotate-12"/>
                      ) : null}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

export default MainMenu;