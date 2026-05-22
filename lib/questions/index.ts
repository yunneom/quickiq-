import { dummyKoQuestions } from './dummy-ko';
import { dummyEnQuestions } from './dummy-en';
import type { Question } from './types';

export type { Question, Category, OptionId, Option } from './types';

export function getQuestions(locale: string): Question[] {
  if (locale === 'en') return dummyEnQuestions;
  return dummyKoQuestions;
}

export function getQuestionById(id: string): Question | undefined {
  return [...dummyKoQuestions, ...dummyEnQuestions].find((q) => q.id === id);
}

export const TOTAL_QUESTIONS = 30;
