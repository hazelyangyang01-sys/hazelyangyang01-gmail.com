
export interface Word {
  character: string;
  pinyin: string;
  meaning: string;
}

export enum QuestionType {
  LISTEN_CHOOSE_WORD,
  MATCH_PINYIN_CHAR,
  LISTEN_CHOOSE_CHAR,
  MATCH_RADICAL,
  STROKE_COUNT,
  FILL_IN_BLANK_CHAR,
  MATCH_MEANING,
  CHOOSE_IMAGE,
  FILL_SENTENCE,
  CHOOSE_CORRECT_PINYIN,
  CHOOSE_CORRECT_SENTENCE,
}

export interface Option {
  id: string;
  text: string;
  image?: string;
  pinyin?: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  targetWord: string;
  options: Option[];
  answer: string | string[];
  data?: {
    audioPinyin?: string;
    radical?: string;
    sentenceParts?: [string, string];
    matchPairs?: { id: string; text: string }[];
  };
}

export interface Level {
  id: number;
  title: string;
  focus: '音' | '形' | '义';
  color: string;
  bgColor: string;
  borderColor: string;
  questions: Question[];
}

export interface LevelProgress {
  [levelId: number]: {
    completed: boolean;
    stars: number;
  };
}

export interface QuestionResult {
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  studentAnswer: string | string[];
  correctAnswer: string | string[];
}

export interface LevelAttempt {
  levelId: number;
  timestamp: number;
  stars: number;
  questions: QuestionResult[];
}
