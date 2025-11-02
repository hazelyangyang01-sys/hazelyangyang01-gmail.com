
import React, { useState } from 'react';
import { LevelAttempt } from '../types';
import { LEVELS } from '../data/gameData';
import { CheckIcon, CrossIcon, StarIcon } from './icons';

interface DeveloperDashboardProps {
  gameResults: LevelAttempt[];
  onBack: () => void;
}

const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
        // For matching questions, format the pairs for readability
        if (answer.every(item => typeof item === 'string' && item.includes('-'))) {
             return answer.map(pair => {
                const parts = pair.split('-');
                const left = parts[0].replace('_l', '');
                const right = parts[1].replace('_r', '');
                return `${left} ↔ ${right}`;
            }).join('; ');
        }
        return answer.join(', ');
    }
    return answer;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ gameResults, onBack }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpansion = (timestamp: number) => {
        setExpandedId(expandedId === timestamp ? null : timestamp);
    };

    return (
        <div className="w-full h-full bg-gray-800 text-white p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Developer Panel</h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                        Back to Menu
                    </button>
                </div>

                {gameResults.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No game results recorded yet.</p>
                        <p>Play a level to see the data here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {gameResults.slice().reverse().map((attempt) => {
                            const level = LEVELS.find(l => l.id === attempt.levelId);
                            const isExpanded = expandedId === attempt.timestamp;
                            const correctCount = attempt.questions.filter(q => q.isCorrect).length;

                            return (
                                <div key={attempt.timestamp} className="bg-gray-700 rounded-lg shadow-md">
                                    <button
                                        onClick={() => toggleExpansion(attempt.timestamp)}
                                        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-600 rounded-t-lg"
                                        aria-expanded={isExpanded}
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold">{level?.title || `Level ${attempt.levelId}`}</h2>
                                            <p className="text-sm text-gray-400">{new Date(attempt.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex">
                                                {[...Array(3)].map((_, i) => (
                                                    <StarIcon key={i} className={`w-6 h-6 ${i < attempt.stars ? 'text-yellow-400' : 'text-gray-500'}`} />
                                                ))}
                                            </div>
                                            <span className="font-mono text-lg">{correctCount} / {attempt.questions.length}</span>
                                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                        </div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="p-4 border-t border-gray-600 bg-gray-700 rounded-b-lg">
                                            <h3 className="text-lg font-semibold mb-2">Question Details:</h3>
                                            <ul className="space-y-3">
                                                {attempt.questions.map((q, index) => (
                                                    <li key={`${q.questionId}-${index}`} className="p-3 bg-gray-800 rounded flex items-start gap-3">
                                                        {q.isCorrect ? <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"/> : <CrossIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-1"/>}
                                                        <div>
                                                            <p className="font-medium">{index + 1}. {q.prompt}</p>
                                                            <p className="text-sm mt-1">
                                                                <span className="text-gray-400">Student Answer: </span>
                                                                <span className={q.isCorrect ? 'text-green-400' : 'text-red-400'}>{formatAnswer(q.studentAnswer)}</span>
                                                            </p>
                                                            {!q.isCorrect && (
                                                                <p className="text-sm mt-1">
                                                                    <span className="text-gray-400">Correct Answer: </span>
                                                                    <span className="text-yellow-400">{formatAnswer(q.correctAnswer)}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperDashboard;
