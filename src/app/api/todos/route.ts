import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  const { rows: todos } = await pool.query(
    `SELECT t.id, t.description, t.is_completed, t.assigned_to,
            u.name AS assignee_name
     FROM task_todos t
     LEFT JOIN users u ON u.id = t.assigned_to
     WHERE t.task_id = $1
     ORDER BY t.created_at ASC`,
    [taskId]
  );
  const { rows: [task] } = await pool.query(
    `SELECT progress FROM tasks WHERE id = $1`, [taskId]
  );
  return NextResponse.json({ todos, progress: task?.progress ?? 0 });
}

export async function POST(req: NextRequest) {
  const { taskId, description, assignedTo } = await req.json();
  if (!taskId || !description?.trim())
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  await pool.query(
    `INSERT INTO task_todos (task_id, description, assigned_to) VALUES ($1, $2, $3)`,
    [taskId, description.trim(), assignedTo || null]
  );
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { todoId, is_completed } = await req.json();
  if (!todoId) return NextResponse.json({ error: 'todoId required' }, { status: 400 });
  await pool.query(
    `UPDATE task_todos SET is_completed = $1 WHERE id = $2`,
    [is_completed, todoId]
  );
  await pool.query(`
    UPDATE tasks t SET progress = (
      SELECT CASE WHEN COUNT(*) = 0 THEN 0
             ELSE ROUND(COUNT(*) FILTER (WHERE is_completed)::numeric / COUNT(*) * 100)
             END
      FROM task_todos WHERE task_id = t.id
    )
    WHERE t.id = (SELECT task_id FROM task_todos WHERE id = $1)
  `, [todoId]);
  return NextResponse.json({ ok: true });
}
