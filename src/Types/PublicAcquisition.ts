import type { Hospital } from "./Hospital";

export interface PublicAcquisition {
  public_id: string;
  code: string;
  title: string;
  hospital_public_id: string;
  created_at: string;
  updated_at: string;
  hospital: Hospital;
}

export interface PublicAcquisitionPayload {
  code: string;
  title: string;
  hospital_id: string;
}

export interface PublicAcquisitionResponse {
  items: PublicAcquisition[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
