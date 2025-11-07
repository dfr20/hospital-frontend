import type { Subcategory } from './Subcategory';

export interface Category {
  name: string;
  description: string;
  public_id: string;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface CategoryPayload {
  name: string;
  description: string;
}

export interface CategoryResponse {
  items: Category[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
