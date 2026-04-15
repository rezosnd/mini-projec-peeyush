import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (session && session.user) {
    const { role } = session.user;
    if (role === 'STUDENT') redirect('/student');
    if (role === 'TEACHER') redirect('/teacher');
    if (role === 'ADMIN') redirect('/admin');
  }

  return (
    <div className="auth-container">
      <div className="card glass" style={{ textAlign: 'center', maxWidth: '500px', padding: '4rem 3rem' }}>
        <span className="label-managed">Login Page</span>
        <h1 style={{ fontSize: '3rem', margin: '1rem 0 1.5rem', lineHeight: '1', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          KIIT Project System
        </h1>
        <p className="card-desc" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
          Use this page to log in to your KIIT project account.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Log In
          </Link>
          <Link href="/register" className="btn btn-outline" style={{ width: '100%' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
