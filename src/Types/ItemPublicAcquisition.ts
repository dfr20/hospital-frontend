import type { Item } from "./Item";
import type { PublicAcquisition } from "./PublicAcquisition";
import type { Supplier } from "./Supplier";

export interface ItemPublicAcquisition {
  public_id: string;
  item: Item;
  public_acquisition: PublicAcquisition;
  supplier: Supplier;
  is_holder: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemPublicAcquisitionPayload {
  item_id: string;
  public_acquisition_id: string;
  supplier_id: string;
  is_holder: boolean;
}

export interface ItemPublicAcquisitionUpdatePayload {
  supplier_id: string;
  is_holder: boolean;
}

export interface ItemPublicAcquisitionResponse {
  items: ItemPublicAcquisition[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
