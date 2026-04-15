'use server';

import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { QueryResult } from 'pg';
import type { ActionState, IdRow, SessionUser, UserRole, UserRowWithPassword } from '@/lib/types';

export async function register(formData: FormData): Promise<ActionState | void> {
  const role = formData.get('role') as UserRole;
  const name = formData.get('name') as string;
  const roll_no = formData.get('roll_no') as string | null;
  const password = formData.get('password') as string;

  if (!name || !password || !role) {
    return { error: 'Missing required fields' };
  }

  if (role === 'STUDENT' && !roll_no) {
    return { error: 'Roll number is required for students' };
  }

  try {
    // check if exists
    if (role === 'STUDENT') {
      const existing = await query<IdRow>('SELECT id FROM users WHERE roll_no = $1', [roll_no]);
      if (existing.rowCount && existing.rowCount > 0) {
        return { error: 'Roll number already registered' };
      }
    } else {
      const existing = await query<IdRow>('SELECT id FROM users WHERE name = $1 AND role = $2', [name, role]);
      if (existing.rowCount && existing.rowCount > 0) {
        return { error: 'Name already registered for this role' };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Unique identifier fallback if not student
    const finalRollNo = role === 'STUDENT' ? roll_no : null;

    const result = await query(
      'INSERT INTO users (role, name, roll_no, password) VALUES ($1, $2, $3, $4) RETURNING id, role, name, roll_no',
      [role, name, finalRollNo, hashedPassword]
    );

    const user = result.rows[0] as SessionUser;
    await createSession(user);
    
  } catch (error) {
    console.error(error);
    return { error: 'Failed to register. Please try again.' };
  }
  
  if (role === 'STUDENT') redirect('/student');
  if (role === 'TEACHER') redirect('/teacher');
}

export async function login(formData: FormData): Promise<ActionState | void> {
  const identifier = formData.get('identifier') as string; // name or roll_no
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!identifier || !password || !role) {
    return { error: 'Missing required fields' };
  }

  try {
    let result: QueryResult<UserRowWithPassword>;
    if (role === 'STUDENT') {
      result = await query<UserRowWithPassword>('SELECT * FROM users WHERE roll_no = $1 AND role = $2', [identifier, role]);
    } else {
      result = await query<UserRowWithPassword>('SELECT * FROM users WHERE name = $1 AND role = $2', [identifier, role]);
    }

    if (!result.rowCount || result.rowCount === 0) {
      return { error: 'Invalid credentials' };
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: 'Invalid credentials' };
    }

    const { password: _password, ...sessionUser } = user;
    await createSession(sessionUser);
    
  } catch (error) {
    console.error(error);
    return { error: 'Failed to login' };
  }

  if (role === 'STUDENT') redirect('/student');
  if (role === 'TEACHER') redirect('/teacher');
  if (role === 'ADMIN') redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/');
}
