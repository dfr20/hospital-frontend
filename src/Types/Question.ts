export interface Question {
  public_id: string;
  question_number: string;
  description: string;
  field_type: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
  response_type: 'obrigatoria' | 'condicional';
  roles: string[];
  condition: string | null;
  options: string[] | null;
  disqualification_rules: string[] | null;
  category_id: string | null;
  category?: {
    public_id: string;
    name: string;
  };
  hospital_id: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionPayload {
  question_number: string;
  description: string;
  field_type: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
  response_type: 'obrigatoria' | 'condicional';
  roles: string[];
  condition?: string | null;
  options?: string[] | null;
  disqualification_rules?: string[] | null;
  category_id?: string | null;
  hospital_id: string;
}

export interface QuestionUpdatePayload {
  question_number?: string;
  description?: string;
  field_type?: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
  response_type?: 'obrigatoria' | 'condicional';
  roles?: string[];
  condition?: string | null;
  options?: string[] | null;
  disqualification_rules?: string[] | null;
  category_id?: string | null;
}

export interface QuestionResponse {
  items: Question[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
