export interface JobTitle {
  title: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface JobTitlePayload {
  title: string;
}

export interface JobTitleResponse {
  items: JobTitle[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
