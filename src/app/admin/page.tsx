import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logout } from '@/app/actions/auth';
import EditUserForm from './EditUserForm';

export default async function AdminDashboard() {
  const session = await getSession();
  const usersRes = await query('SELECT id, role, name, roll_no FROM users ORDER BY role ASC, name ASC', []);
  const users = usersRes.rows;

  return (
    <div className="dashboard-layout">
      <main className="container">
        <div style={{ padding: '2.5rem 0' }}>
          <div className="dashboard-top" style={{ marginBottom: '2.5rem' }}>
            <span className="label-managed">System Control</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Administrative Hub</h2>
            <p className="card-desc">Manage system entities and access controls.</p>
          </div>

          <div className="card glass" style={{ maxWidth: '100%', padding: '0', background: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden', border: '1px solid var(--border)' }}>
             <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Registered Entities ({users.length})</h3>
                <form action={logout}>
                  <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>Log Out</button>
                </form>
             </div>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--muted-fg)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>Role</th>
                    <th style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--muted-fg)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>Identity</th>
                    <th style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--muted-fg)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>Credentials</th>
                    <th style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--muted-fg)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--muted-fg)' }}>{u.role}</span></td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{u.name}</td>
                      <td style={{ color: 'var(--muted-fg)', fontFamily: 'monospace' }}>{u.roll_no || 'N/A'}</td>
                      <td>
                        <EditUserForm user={u} />
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                       <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted-fg)', padding: '5rem' }}>The system is currently vacant.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
