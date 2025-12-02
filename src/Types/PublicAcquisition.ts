import type { Hospital } from "./Hospital";
import type { User } from "./User";
import type { Item } from "./Item";

export interface PublicAcquisition {
  public_id: string;
  code: string;
  title: string;
  year: number;
  hospital_public_id: string;
  user_public_id: string;
  items: Item[];
  created_at: string;
  updated_at: string;
  hospital: Hospital;
  user: User;
}

export interface PublicAcquisitionPayload {
  code: string;
  title: string;
  year: number;
  user_id: string;
  item_ids: string[];
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
