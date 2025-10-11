export interface Catalog {
  name: string;
  description: string;
  full_description: string;
  presentation: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogPayload {
  name: string;
  description: string;
  full_description: string;
  presentation: string;
}

export interface CatalogResponse {
  items: Catalog[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
