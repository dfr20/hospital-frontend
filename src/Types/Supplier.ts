import type { Hospital } from "./Hospital";

export interface Supplier {
  public_id: string;
  name: string;
  document_type: string;
  document: string;
  email: string;
  phone: string;
  hospital_public_id: string;
  created_at: string;
  updated_at: string;
  hospital: Hospital;
}

export interface SupplierPayload {
  name: string;
  document_type: string;
  document: string;
  email: string;
  phone: string;
  hospital_id: string;
}

export interface SupplierResponse {
  items: Supplier[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
