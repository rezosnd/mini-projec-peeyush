'use server';

import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ActionState, IdRow } from '@/lib/types';

export async function assignTask(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'TEACHER') {
    return { error: 'Unauthorized' };
  }

  const assigneeType = formData.get('assigneeType') as string; // 'STUDENT' | 'GROUP'
  const assigneeValue = formData.get('assigneeValue') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!assigneeType || !assigneeValue || !title || !description) {
    return { error: 'Missing required fields' };
  }

  const teacher_id = session.user.id;

  try {
    if (assigneeType === 'STUDENT') {
      const studentRes = await query<IdRow>('SELECT id FROM users WHERE roll_no = $1 AND role = $2', [assigneeValue, 'STUDENT']);
      if (!studentRes.rowCount || studentRes.rowCount === 0) {
        return { error: 'Student with given roll number not found' };
      }
      const student_id = studentRes.rows[0].id;
      await query(
        'INSERT INTO tasks (teacher_id, student_id, title, description) VALUES ($1, $2, $3, $4)',
        [teacher_id, student_id, title, description]
      );
    } else if (assigneeType === 'GROUP') {
      const groupRes = await query<IdRow>('SELECT id FROM student_groups WHERE name = $1', [assigneeValue]);
      if (!groupRes.rowCount || groupRes.rowCount === 0) {
        return { error: 'Group with given name not found' };
      }
      const group_id = groupRes.rows[0].id;
      await query(
        'INSERT INTO tasks (teacher_id, group_id, title, description) VALUES ($1, $2, $3, $4)',
        [teacher_id, group_id, title, description]
      );
    } else {
      return { error: 'Invalid Assignee Type' };
    }

    revalidatePath('/teacher');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to assign task' };
  }
}

export async function submitTask(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') {
    return { error: 'Unauthorized' };
  }

  const task_id = formData.get('task_id') as string;
  const ppt_link = formData.get('ppt_link') as string;
  const report_link = formData.get('report_link') as string;
  const github_link = formData.get('github_link') as string;

  if (!task_id || !ppt_link || !report_link || !github_link) {
    return { error: 'All 3 links are required' };
  }

  try {
    await query(
      `UPDATE tasks SET submission_ppt = $1, submission_report = $2, submission_github = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND (student_id = $6 OR group_id IN (SELECT group_id FROM student_group_members WHERE student_id = $6))`,
      [ppt_link, report_link, github_link, 'SUBMITTED', task_id, session.user.id]
    );

    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to submit task' };
  }
}

export async function adminUpdateUser(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  const user_id = formData.get('user_id') as string;
  const newName = formData.get('name') as string;
  const newRollNo = formData.get('roll_no') as string;
  const newPassword = formData.get('password') as string;

  try {
    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET name = $1, roll_no = $2, password = $3 WHERE id = $4', [newName, newRollNo, hashed, user_id]);
    } else {
      await query('UPDATE users SET name = $1, roll_no = $2 WHERE id = $3', [newName, newRollNo, user_id]);
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update user' };
  }
}

export async function updateTaskProgress(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') return { error: 'Unauthorized' };

  const task_id = formData.get('task_id') as string;
  const progress = parseInt(formData.get('progress') as string, 10);

  if (!task_id || isNaN(progress)) return { error: 'Invalid data' };

  try {
    await query(`UPDATE tasks SET progress = $1 WHERE id = $2 AND (student_id = $3 OR group_id IN (SELECT group_id FROM student_group_members WHERE student_id = $3))`, [progress, task_id, session.user.id]);
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed' };
  }
}

export async function addTodo(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') return { error: 'Unauthorized' };
  const task_id = formData.get('task_id') as string;
  const description = formData.get('description') as string;
  if (!task_id || !description) return { error: 'Required' };
  try {
    await query('INSERT INTO task_todos (task_id, description) VALUES ($1, $2)', [task_id, description]);
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed' };
  }
}

export async function toggleTodo(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') return { error: 'Unauthorized' };
  const todo_id = formData.get('todo_id') as string;
  const is_completed = formData.get('is_completed') === 'true';
  try {
    await query('UPDATE task_todos SET is_completed = $1 WHERE id = $2', [is_completed, todo_id]);
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed' };
  }
}
