import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import AssignTaskForm from './AssignTaskForm';
import type { TaskRow } from '@/lib/types';
import { redirect } from 'next/navigation';

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  const teacherId = session.user.id;

  const tasksStr = `
    SELECT t.*, u.name as student_name, u.roll_no as student_roll_no, g.name as group_name
    FROM tasks t
    LEFT JOIN users u ON t.student_id = u.id
    LEFT JOIN student_groups g ON t.group_id = g.id
    WHERE t.teacher_id = $1
    ORDER BY t.created_at DESC
  `;
  const tasksRes = await query<TaskRow>(tasksStr, [teacherId]);
  const tasks = tasksRes.rows;

  return (
    <div className="dashboard-layout">
      <main className="container">
        <div className="portal-grid">
          {/* Managed Sidebar: Assignment Controls */}
          <aside>
            <div className="dashboard-top" style={{ marginBottom: '2.5rem' }}>
              <span className="label-managed">Overview</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Instructor</h2>
              <p className="card-desc">Assign and manage project streams.</p>
            </div>

            <div className="card glass" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
              <span className="label-managed">New Project</span>
              <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Assign Task</h3>
              <AssignTaskForm />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <form action={logout}>
                <button type="submit" className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem' }}>
                   Terminate Session
                </button>
              </form>
            </div>
          </aside>

          {/* Managed Main: Task Management */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Active Streams ({tasks.length})</h3>
              <div className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted-fg)' }}>Real-time Sync</div>
            </div>

            {tasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                <p className="card-desc">No active project streams detected.</p>
              </div>
            ) : (
              <div className="portal-list">
                {tasks.map((task) => (
                  <div key={task.id} className="card task-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div className="task-title" style={{ fontSize: '1.1rem' }}>{task.title}</div>
                      <span className={`badge ${task.status === 'PENDING_SUBMISSION' ? 'pending' : 'submitted'}`}>
                        {task.status === 'PENDING_SUBMISSION' ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    
                    <span className="label-managed">Assigned TO</span>
                    <div className="task-meta" style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
                      {task.group_name ? `Group: ${task.group_name}` : `${task.student_name} (${task.student_roll_no})`}
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        <span className="label-managed" style={{ margin: 0 }}>Completion Alpha</span>
                        <span style={{ fontWeight: 800 }}>{task.progress || 0}%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${task.progress || 0}%` }}></div>
                      </div>
                    </div>

                    <p className="task-desc" style={{ marginBottom: '1.5rem', color: '#888' }}>{task.description}</p>
                    
                    {task.status === 'SUBMITTED' ? (
                      <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                        <span className="label-managed">Review Assets</span>
                        <div className="submission-links">
                          <a href={task.submission_ppt ?? '#'} target="_blank" rel="noreferrer">Project Presentation (PPT)</a>
                          <a href={task.submission_report ?? '#'} target="_blank" rel="noreferrer">Technical Report (PDF)</a>
                          <a href={task.submission_github ?? '#'} target="_blank" rel="noreferrer">Source Repository</a>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--muted-fg)' }}>
                        &bull; Awaiting final synchronization...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
