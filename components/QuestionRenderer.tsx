import React, { useState, useEffect } from 'react';
import { Question, QuestionType, Option } from '../types';
import { SoundIcon } from './icons';

interface QuestionRendererProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answer: string | string[]) => void;
}

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('抱歉，您的浏览器不支持语音功能。');
  }
};

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, onAnswer }) => {
  // State for MATCH_MEANING (click-to-match)
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // { rightId: leftId }
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when question changes
    setSelectedLeftId(null);
    setMatchedPairs({});
    setWrongPair(null);
  }, [question]);
  

  const handleOptionClick = (optionId: string) => {
    const isCorrect = optionId === question.answer;
    onAnswer(isCorrect, optionId);
  };
  
  // For MATCH_MEANING (click-to-match)
  const handleLeftOptionClick = (optionId: string) => {
    if (Object.values(matchedPairs).includes(optionId)) return;
    setSelectedLeftId(optionId === selectedLeftId ? null : optionId);
  };

  const handleRightOptionClick = (rightOptionId: string) => {
    if (!selectedLeftId || matchedPairs[rightOptionId]) return;

    const isCorrectPair = (question.answer as string[]).some(
      ans => ans === `${selectedLeftId}-${rightOptionId}` || ans === `${rightOptionId}-${selectedLeftId}`
    );

    if (isCorrectPair) {
      setMatchedPairs(prev => ({ ...prev, [rightOptionId]: selectedLeftId }));
    } else {
      setWrongPair(rightOptionId);
      setTimeout(() => setWrongPair(null), 820);
    }
    setSelectedLeftId(null);
  };


  const renderQuestion = () => {
    const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

    switch (question.type) {
      case QuestionType.LISTEN_CHOOSE_WORD:
      case QuestionType.LISTEN_CHOOSE_CHAR:
        return (
          <div className="flex flex-col items-center">
            <button
              onClick={() => speak(question.data?.audioPinyin || '')}
              className={`mb-8 p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-transform transform hover:scale-110 ${focusClasses}`}
            >
              <SoundIcon className="w-12 h-12" />
            </button>
            <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`p-4 text-2xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-yellow-100 hover:border-yellow-400 ${focusClasses}`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        );

      case QuestionType.MATCH_PINYIN_CHAR:
      case QuestionType.STROKE_COUNT:
      case QuestionType.MATCH_RADICAL:
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`p-4 text-2xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-yellow-100 hover:border-yellow-400 ${focusClasses}`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        );
      
      case QuestionType.CHOOSE_CORRECT_PINYIN:
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-bold p-4 bg-gray-100 rounded-lg mb-4 text-gray-800">{question.targetWord}</div>
            <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`p-4 text-2xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-yellow-100 hover:border-yellow-400 ${focusClasses}`}
                >
                  <span className="pinyin-text">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case QuestionType.FILL_IN_BLANK_CHAR:
        return (
            <div className="flex flex-col items-center gap-8">
                <div className="text-5xl tracking-widest p-4 bg-gray-100 rounded-lg text-gray-800">
                    {question.data?.sentenceParts?.[0]}
                    <span className="font-bold text-blue-500">{question.data?.sentenceParts?.[1]}</span>
                </div>
                <div className="flex flex-row flex-wrap justify-center gap-4">
                {question.options.map((opt) => (
                    <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    className={`p-4 text-2xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-yellow-100 hover:border-yellow-400 ${focusClasses}`}
                    >
                    {opt.text}
                    </button>
                ))}
                </div>
            </div>
        );
    
      case QuestionType.CHOOSE_IMAGE:
        return (
            <div className="flex flex-row flex-wrap justify-center gap-4">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`flex flex-col items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:border-yellow-400 ${focusClasses}`}
                >
                  <img src={opt.image} alt={opt.text} className="w-48 h-48 object-cover rounded-md" />
                  <span className="mt-2 text-xl">{opt.text}</span>
                </button>
              ))}
            </div>
        );

      case QuestionType.FILL_SENTENCE:
        return (
            <div className="flex flex-col items-center gap-8">
                <div className="flex items-center justify-center flex-wrap text-3xl md:text-4xl p-4 bg-gray-100 rounded-lg min-h-[80px] text-gray-800 text-center leading-relaxed">
                    <span>{question.data?.sentenceParts?.[0]}</span>
                    <div
                        className="mx-2 font-bold text-4xl w-48 h-16 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center"
                    >
                        (____)
                    </div>
                    <span>{question.data?.sentenceParts?.[1]}</span>
                </div>
                <div className="flex flex-row flex-wrap justify-center gap-4">
                    {question.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => onAnswer(opt.id === question.answer, opt.id)}
                          className={`p-4 text-2xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 ${focusClasses}`}
                        >
                          {opt.text}
                        </button>
                    ))}
                </div>
            </div>
        );
      
      case QuestionType.CHOOSE_CORRECT_SENTENCE:
        return (
          <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.id)}
                className={`w-full text-left p-4 text-xl text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:bg-yellow-100 hover:border-yellow-400 transition-colors ${focusClasses}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        );

      case QuestionType.MATCH_MEANING:
        const leftOptions = question.options;
        const rightOptions = question.data?.matchPairs || [];
        const answerArray = question.answer as string[];
        const allPaired = Object.keys(matchedPairs).length === answerArray.length && answerArray.length > 0;

        const handleSubmitMatch = () => {
            const formattedPairs = Object.entries(matchedPairs).map(([rightId, leftId]) => `${leftId}-${rightId}`);
            onAnswer(true, formattedPairs);
        };
        
        return (
            <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center items-start gap-16">
                    <div className="flex flex-col gap-4">
                        {leftOptions.map(opt => {
                            const isMatched = Object.values(matchedPairs).includes(opt.id);
                            const isSelected = selectedLeftId === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleLeftOptionClick(opt.id)}
                                    disabled={isMatched}
                                    className={`p-4 text-2xl text-gray-800 w-48 text-center rounded-lg shadow-md border-2 transition-all 
                                        ${isMatched 
                                            ? 'bg-gray-300 border-gray-400 opacity-50 cursor-not-allowed' 
                                            : 'bg-white border-gray-300 cursor-pointer hover:bg-yellow-100'}
                                        ${isSelected ? 'ring-4 ring-blue-300 border-blue-500' : ''}
                                        `}
                                >
                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-col gap-4">
                        {rightOptions.map(opt => {
                            const isMatched = !!matchedPairs[opt.id];
                            const isWrong = wrongPair === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleRightOptionClick(opt.id)}
                                    disabled={isMatched}
                                    className={`p-4 text-2xl text-gray-800 w-48 text-center rounded-lg shadow-md border-2 transition-colors h-[80px] flex items-center justify-center
                                        ${isMatched
                                            ? 'bg-green-200 border-green-400 cursor-not-allowed'
                                            : 'bg-white border-gray-300 cursor-pointer hover:bg-yellow-100'
                                        }
                                        ${isWrong ? 'animate-shake border-red-500' : ''}`}
                                >
                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                </div>
                 {allPaired && (
                    <button
                        onClick={handleSubmitMatch}
                        className="mt-6 px-8 py-3 bg-green-500 text-white text-2xl font-bold rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
                    >
                        完成
                    </button>
                )}
            </div>
        );
        
      default:
        return <div>Question type not implemented.</div>;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-2xl md:text-4xl text-center mb-8 font-bold text-gray-700">{question.prompt}</h3>
      {renderQuestion()}
    </div>
  );
};

export default QuestionRenderer;