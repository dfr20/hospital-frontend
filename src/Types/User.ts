import type { Role } from "./Role";

export interface User {
  name: string;
  email: string;
  public_id: string;
  created_at: string;
  updated_at: string;
  role: Role;
}


export interface UserMeResponse {
  name: string;
  email: string;
  public_id: string;
  created_at: string;
  updated_at: string;
  role: Role;
}
