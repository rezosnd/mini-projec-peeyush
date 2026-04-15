'use client';

import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState: any = { error: '' };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await login(formData) || prevState;
  }, initialState);

  return (
    <div className="auth-container">
      <div className="card glass" style={{ background: 'rgba(45, 43, 61, 0.4)' }}>
        <h1 className="card-title">Welcome Back</h1>
        <p className="card-desc">Login to your KIIT account</p>
        
        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="role">I am a</label>
            <select name="role" id="role" className="form-select" required>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Identifier (Name or Roll No)</label>
            <input type="text" name="identifier" id="identifier" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" name="password" id="password" className="form-input" required />
          </div>

          {state?.error && <p className="error-msg">{state.error}</p>}

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <Link href="/register" style={{ textDecoration: 'underline' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
