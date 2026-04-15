'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ActionState, IdRow } from '@/lib/types';

export async function createGroup(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const peerRollNo = formData.get('peer_roll_no') as string;

  if (!name) return { error: 'Group name is required' };

  try {
    // Note: This relies on manual rollback if we had a full transaction, but since we are simple we run sequentially
    const existingGroup = await query<IdRow>('SELECT id FROM student_groups WHERE name = $1', [name]);
    if (existingGroup.rowCount && existingGroup.rowCount > 0) {
      return { error: 'Group name already taken' };
    }

    const newGroup = await query<IdRow>(
      'INSERT INTO student_groups (name, created_by) VALUES ($1, $2) RETURNING id',
      [name, session.user.id]
    );
    const groupId = newGroup.rows[0].id;

    // Add creator to group
    await query('INSERT INTO student_group_members (group_id, student_id) VALUES ($1, $2)', [groupId, session.user.id]);

    // Add peer if provided
    if (peerRollNo) {
      const peerRes = await query<IdRow>('SELECT id FROM users WHERE roll_no = $1 AND role = $2', [peerRollNo, 'STUDENT']);
      if (peerRes.rowCount && peerRes.rowCount > 0) {
        await query('INSERT INTO student_group_members (group_id, student_id) VALUES ($1, $2)', [groupId, peerRes.rows[0].id]);
      }
    }

    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create group' };
  }
}

export async function addMemberToGroup(formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.user.role !== 'STUDENT') {
    return { error: 'Unauthorized' };
  }

  const groupId = formData.get('group_id') as string;
  const rollNo = formData.get('roll_no') as string;

  if (!groupId || !rollNo) return { error: 'Missing required fields' };

  try {
    const peerRes = await query<IdRow>('SELECT id FROM users WHERE roll_no = $1 AND role = $2', [rollNo, 'STUDENT']);
    if (!peerRes.rowCount || peerRes.rowCount === 0) {
      return { error: 'Student not found' };
    }
    const studentId = peerRes.rows[0].id;

    await query('INSERT INTO student_group_members (group_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [groupId, studentId]);

    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to add member' };
  }
}
