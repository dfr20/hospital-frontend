export interface Subcategory {
  name: string;
  description: string;
  category_public_id: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryPayload {
  name: string;
  description: string;
  category_id: string;  // Backend espera category_id no POST/PUT
}

export interface SubcategoryResponse {
  items: Subcategory[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
