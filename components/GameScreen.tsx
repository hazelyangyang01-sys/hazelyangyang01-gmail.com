

import React, { useState, useEffect } from 'react';
import { Level, Question, QuestionType, QuestionResult } from '../types';
import QuestionRenderer from './QuestionRenderer';
import { CheckIcon, CrossIcon, StarIcon } from './icons';

interface GameScreenProps {
  level: Level;
  onLevelComplete: (levelId: number, stars: number, results: QuestionResult[]) => void;
  onBackToMenu: () => void;
  isDevMode: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ level, onLevelComplete, onBackToMenu, isDevMode }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = level.questions[questionIndex];

  useEffect(() => {
    setQuestionResults([]);
    setQuestionIndex(0);
    setShowAnswer(false);
    setFeedback(null);
  }, [level]);

  const getCorrectAnswerText = (q: Question): React.ReactNode => {
    if (q.type === QuestionType.CHOOSE_CORRECT_PINYIN && typeof q.answer === 'string') {
        const correctOption = q.options.find(opt => opt.id === q.answer);
        const answerText = correctOption?.text ?? q.answer;
        return <span className="pinyin-text">{answerText}</span>;
    }
    
    if (typeof q.answer === 'string') {
      const correctOption = q.options.find(opt => opt.id === q.answer);
      return correctOption?.text ?? q.answer;
    }

    return Array.isArray(q.answer) ? q.answer.join(', ') : '';
  };
  
  const finishLevel = (currentResults: QuestionResult[]) => {
      const finalCorrectAnswers = currentResults.filter(r => r.isCorrect).length;
      const accuracy = finalCorrectAnswers / level.questions.length;
      let stars = 1;
      if (accuracy === 1) {
          stars = 3;
      } else if (accuracy >= 0.7) {
          stars = 2;
      }
      onLevelComplete(level.id, stars, currentResults);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setFeedback(null);
    
    if (questionIndex < level.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      finishLevel(questionResults);
    }
  };
  
  const handleAnswer = (isCorrect: boolean, answer: string | string[]) => {
    const newResult: QuestionResult = {
        questionId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        isCorrect,
        studentAnswer: answer,
        correctAnswer: currentQuestion.answer,
    };
    const updatedResults = [...questionResults, newResult];
    setQuestionResults(updatedResults);

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (currentQuestion.type === QuestionType.MATCH_MEANING) {
      setTimeout(() => {
        setFeedback(null);
        if (questionIndex < level.questions.length - 1) {
          setQuestionIndex(prev => prev + 1);
        } else {
          finishLevel(updatedResults);
        }
      }, 1200);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setShowAnswer(true);
      }, 1200);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 transition-colors duration-500 ${level.bgColor} relative`}>
      {isDevMode && (
        <button
          onClick={onBackToMenu}
          className="absolute top-4 left-4 bg-gray-700 text-white text-xs font-mono px-3 py-1 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity z-20"
          aria-label="Back to Menu (Dev)"
        >
          &lt; 返回主菜单
        </button>
      )}
      <div className="w-full max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${((questionIndex + 1) / level.questions.length) * 100}%` }}
          ></div>
        </div>
        <div className={`bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-4 ${level.borderColor} relative overflow-hidden`}>
          {feedback && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              {feedback === 'correct' ? 
                <CheckIcon className="w-48 h-48 text-green-500" /> :
                <CrossIcon className="w-48 h-48 text-red-500" />
              }
            </div>
          )}
          <div style={{ opacity: showAnswer ? 0.7 : 1, pointerEvents: showAnswer ? 'none' : 'auto' }}>
            <QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} />
          </div>

          {showAnswer && (
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <p className="text-xl font-bold text-gray-800 mb-4">
                正确答案：<span className="text-3xl text-green-600 font-mono tracking-wider">{getCorrectAnswerText(currentQuestion)}</span>
              </p>
              <button
                onClick={handleNext}
                className="px-10 py-3 bg-blue-500 text-white text-2xl font-bold rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                {questionIndex < level.questions.length - 1 ? '下一题' : '完成关卡'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;