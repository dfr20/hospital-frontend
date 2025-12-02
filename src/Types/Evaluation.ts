import type { Item } from './Item';
import type { User } from './User';
import type { PublicAcquisition } from './PublicAcquisition';
import type { Supplier } from './Supplier';

export interface Evaluation {
  public_id: string;
  public_acquisition: PublicAcquisition;
  supplier: Supplier;
  item: Item;
  is_holder: boolean;
  users: User[];
  created_at: string;
  updated_at: string;
}

export interface EvaluationPayload {
  public_acquisition_id: string;
  supplier_id: string;
  item_id: string;
  is_holder: boolean;
  user_ids: string[];
}

export interface EvaluationUpdatePayload {
  user_ids?: string[];
}

export interface EvaluationAssociateUserPayload {
  user_id: string;
}

export interface EvaluationResponse {
  items: Evaluation[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
