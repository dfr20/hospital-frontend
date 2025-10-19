import type { Subcategory } from './Subcategory';

export interface Item {
  name: string;
  similar_names: string[];
  description: string;
  full_description: string;
  internal_code: string;
  presentation: string;
  sample: number;
  has_catalog: boolean;
  is_active: boolean;
  subcategory: Subcategory;  // Backend retorna o objeto completo
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface ItemPayload {
  name: string;
  similar_names: string[];
  description: string;
  full_description: string;
  internal_code: string;
  presentation: string;
  sample: number;
  has_catalog: boolean;
  subcategory_id: string;  // Backend espera subcategory_id no POST/PUT
}

export interface ItemResponse {
  items: Item[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
