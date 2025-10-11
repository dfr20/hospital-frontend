import type { Role } from "./Role";
import type { Hospital } from "./Hospital";
import type { JobTitle } from "./JobTitle";

export interface User {
  name: string;
  email: string;
  phone: string;
  public_id: string;
  created_at: string;
  updated_at: string;
  role: Role;
  job_title: JobTitle;
  hospital: Hospital;
}

export interface UserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role_id: string;
  job_title_id: string;
  hospital_id: string;
}

export interface UserResponse {
  items: User[];
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserMeResponse {
  name: string;
  email: string;
  phone: string;
  public_id: string;
  created_at: string;
  updated_at: string;
  role: Role;
  job_title: JobTitle;
  hospital: Hospital;
}
