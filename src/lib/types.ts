import type { JWTPayload } from 'jose';
import type { QueryResultRow } from 'pg';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface ActionState {
  error?: string;
  success?: boolean;
}

export interface IdRow {
  id: number;
}

export interface SessionUser {
  id: number;
  role: UserRole;
  name: string;
  roll_no: string | null;
}

export interface SessionPayload extends JWTPayload {
  user: SessionUser;
}

export interface UserRow extends QueryResultRow {
  id: number;
  role: UserRole;
  name: string;
  roll_no: string | null;
}

export interface UserRowWithPassword extends UserRow {
  password: string;
}

export interface GroupRow extends QueryResultRow {
  id: number;
  name: string;
}

export interface TodoRow extends QueryResultRow {
  id: number;
  task_id: number;
  description: string;
  is_completed: boolean;
}

export interface TaskRow extends QueryResultRow {
  id: number;
  title: string;
  description: string;
  status: 'PENDING_SUBMISSION' | 'SUBMITTED';
  progress: number | null;
  teacher_name?: string | null;
  student_name?: string | null;
  student_roll_no?: string | null;
  group_name?: string | null;
  submission_ppt?: string | null;
  submission_report?: string | null;
  submission_github?: string | null;
}