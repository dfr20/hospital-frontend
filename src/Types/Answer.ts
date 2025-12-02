import type { Question } from './Question';
import type { User } from './User';

export interface Answer {
  public_id: string;
  evaluation_id: string;
  question_id: string;
  question: Question;
  user_id: string;
  user: User;
  answer_text: string | null;
  answer_boolean: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AnswerPayload {
  evaluation_id: string;
  question_id: string;
  answer_text?: string | null;
  answer_boolean?: boolean | null;
}

export interface BulkAnswerPayload {
  evaluation_id: string;
  answers: {
    question_id: string;
    answer_text?: string | null;
    answer_boolean?: boolean | null;
  }[];
}

export interface AnswerUpdatePayload {
  answer_text?: string | null;
  answer_boolean?: boolean | null;
}

export interface AnswerResponse {
  items: Answer[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApplicableQuestion extends Question {
  answer?: Answer;
}

export interface ApplicableQuestionsResponse {
  evaluation_id: string;
  user_role: string;
  questions: ApplicableQuestion[];
  total_questions: number;
  answered_questions: number;
}
