
import React from 'react';
import { StarIcon } from './icons';

interface FinalRewardProps {
  onRestart: () => void;
  totalStars: number;
}

const FinalReward: React.FC<FinalRewardProps> = ({ onRestart, totalStars }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-100 via-amber-200 to-orange-300">
      <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-3xl">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 mb-4">
          恭喜你！
        </h1>
        <p className="text-2xl text-gray-700 mb-6">你已经集齐了所有七彩宝石，完成了所有挑战！</p>
        <div className="flex justify-center items-center gap-2 text-4xl font-bold text-yellow-500 mb-8">
            <StarIcon className="w-10 h-10"/>
            <span>总共获得 {totalStars} 颗星星！</span>
        </div>

        <button
          onClick={onRestart}
          className="mt-10 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform"
        >
          再玩一次
        </button>
      </div>
    </div>
  );
};

export default FinalReward;