import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import SubmitTaskForm from './SubmitTaskForm';
import GroupManager from './GroupManager';
import ProgressTracker from './ProgressTracker';
import ActivityTracker from '@/components/ActivityTracker';
import GroupChat from '@/components/GroupChat';
import type { GroupRow, TaskRow, TodoRow } from '@/lib/types';
import { redirect } from 'next/navigation';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  const studentId = session.user.id;

  const groupsRes = await query<GroupRow>(`
    SELECT g.id, g.name
    FROM student_groups g
    JOIN student_group_members gm ON g.id = gm.group_id
    WHERE gm.student_id = $1
  `, [studentId]);
  const userGroups = groupsRes.rows;

  const tasksRes = await query<TaskRow>(`
    SELECT t.*, u.name as teacher_name, g.name as group_name
    FROM tasks t
    JOIN users u ON t.teacher_id = u.id
    LEFT JOIN student_groups g ON t.group_id = g.id
    WHERE t.student_id = $1 OR t.group_id IN (SELECT group_id FROM student_group_members WHERE student_id = $1)
    ORDER BY t.created_at DESC
  `, [studentId]);
  const tasks = tasksRes.rows;

  let allTodos: TodoRow[] = [];
  if (tasks.length > 0) {
    const taskIds = tasks.map((t) => t.id);
    const placeholders = taskIds.map((_: unknown, i: number) => `$${i + 1}`).join(',');
    const todosRes = await query<TodoRow>(`SELECT * FROM task_todos WHERE task_id IN (${placeholders}) ORDER BY created_at ASC`, taskIds);
    allTodos = todosRes.rows;
  }

  // Fetch group members for all groups
  const groupIds = tasks.filter(t => t.group_id).map(t => t.group_id);
  const groupMembersMap: Record<string, { id: string; name: string }[]> = {};
  if (groupIds.length > 0) {
    const membersRes = await query(`
      SELECT sgm.group_id, u.id, u.name
      FROM student_group_members sgm
      JOIN users u ON u.id = sgm.student_id
      WHERE sgm.group_id = ANY($1::uuid[])
    `, [groupIds]);
    for (const row of membersRes.rows) {
      if (!groupMembersMap[row.group_id]) groupMembersMap[row.group_id] = [];
      groupMembersMap[row.group_id].push({ id: row.id, name: row.name });
    }
  }

  return (
    <div className="dashboard-layout">
      <main className="container">
        <div className="portal-grid">
          <aside>
            <div className="dashboard-top" style={{ marginBottom: '2.5rem' }}>
              <span className="label-managed">Welcome Alpha</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{session.user.name}</h2>
              <p className="card-desc">Student Workspace & Collaboration.</p>
            </div>
            <div className="card glass" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <span className="label-managed">Collaboration</span>
              <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Managed Groups</h3>
              <GroupManager userGroups={userGroups} />
            </div>
            <div style={{ marginTop: '2rem' }}>
              <form action={logout}>
                <button type="submit" className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem' }}>
                  Terminate Session
                </button>
              </form>
            </div>
          </aside>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>My Streams ({tasks.length})</h3>
              <div className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted-fg)' }}>Portal Updated</div>
            </div>

            {tasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                <p className="card-desc">No project streams assigned yet.</p>
              </div>
            ) : (
              <div className="portal-list">
                {tasks.map((task) => {
                  const taskTodos = allTodos.filter(t => t.task_id === task.id);
                  return (
                    <div key={task.id} className="card task-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div className="task-title" style={{ fontSize: '1.1rem' }}>
                          {task.title} {task.group_name && <span className="badge" style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}>{task.group_name}</span>}
                        </div>
                        <span className={`badge ${task.status === 'PENDING_SUBMISSION' ? 'pending' : 'submitted'}`}>
                          {task.status === 'PENDING_SUBMISSION' ? 'Pending' : 'Submitted'}
                        </span>
                      </div>

                      <span className="label-managed">Assigned BY</span>
                      <div className="task-meta" style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
                        Prof. {task.teacher_name}
                      </div>

                      <div className="task-desc" style={{ marginBottom: '1.5rem', color: '#888' }}>
                        {task.description}
                      </div>

                      {task.status === 'PENDING_SUBMISSION' ? (
                        <div style={{ marginTop: 'auto' }}>
                          <span className="label-managed">Progress & Milestones</span>
                          <ProgressTracker task={task} todos={taskTodos} />

                          <div style={{ marginTop: '1.5rem' }}>
                            <span className="label-managed">Subtask Tracker</span>
                            <ActivityTracker
                              taskId={task.id}
                              members={task.group_id ? (groupMembersMap[task.group_id] || []) : []}
                              isTeacher={false}
                            />
                          </div>

                          {task.group_id && (
                            <div style={{ marginTop: '1.5rem' }}>
                              <span className="label-managed">Group Chat</span>
                              <div style={{ marginTop: '0.75rem' }}>
                                <GroupChat groupId={task.group_id} currentUserId={studentId} />
                              </div>
                            </div>
                          )}

                          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <span className="label-managed">Submit Deliverables</span>
                            <SubmitTaskForm taskId={task.id} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                          <span className="label-managed" style={{ color: '#00f2fe' }}>Synchronization Complete</span>
                          <div className="submission-links">
                            <a href={task.submission_ppt ?? '#'} target="_blank" rel="noreferrer">Project Presentation (PPT)</a>
                            <a href={task.submission_report ?? '#'} target="_blank" rel="noreferrer">Technical Report (PDF)</a>
                            <a href={task.submission_github ?? '#'} target="_blank" rel="noreferrer">Source Repository</a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
