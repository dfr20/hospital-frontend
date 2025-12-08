import type { Question } from './Question';
import type { User } from './User';

export interface Answer {
  public_id: string;
  evaluation_id: string;
  question_id: string;
  question: Question;
  user_id: string;
  user: User;
  answer_value: string;
  created_at: string;
  updated_at: string;
}

export interface AnswerPayload {
  evaluation_id: string;
  question_id: string;
  answer_value: string;
}

export interface BulkAnswerPayload {
  evaluation_id: string;
  answers: {
    question_id: string;
    answer_value: string;
  }[];
}

export interface AnswerUpdatePayload {
  answer_value: string;
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
  answer_value: string | null;
  answer_id: string | null;
}

// O backend retorna diretamente uma lista de questões com answer_value e answer_id
export type ApplicableQuestionsResponse = ApplicableQuestion[];

export interface DisqualificationReason {
  question_number: string;
  question_description: string;
  answer_value: string;
}

export interface EvaluationStatistics {
  total_questions: number;
  answered_questions: number;
  pending_questions: number;
  completion_percentage: number;
  status: 'OK' | 'PENDING' | 'DESQUALIFICADO';
  is_disqualified: boolean;
  disqualification_reasons?: DisqualificationReason[];
}
