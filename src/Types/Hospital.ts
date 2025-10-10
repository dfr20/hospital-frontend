export interface Hospital {
  name: string;
  nationality: string;
  document_type: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalPayload {
  name: string;
  nationality: string;
  document_type: string;
  document: string;
  email: string;
  phone: string;
  city: string;
}

export interface HospitalResponse {
  items: Hospital[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
