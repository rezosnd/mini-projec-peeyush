'use client';

import { register } from '@/app/actions/auth';
import type { ActionState } from '@/lib/types';
import Link from 'next/link';
import { useActionState, useState } from 'react';

const initialState: ActionState = { error: '' };

export default function RegisterForm() {
  const [role, setRole] = useState('STUDENT');
  const [state, formAction, isPending] = useActionState(async (prevState: ActionState, formData: FormData) => {
    return (await register(formData)) || prevState;
  }, initialState);

  return (
    <div className="auth-container">
      <div className="card glass" style={{ background: 'rgba(45, 43, 61, 0.4)' }}>
        <h1 className="card-title">Create Account</h1>
        <p className="card-desc">Join the KIIT Project Hub today.</p>
        
        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Register as</label>
            <select name="role" id="role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input type="text" name="name" id="name" className="form-input" required />
          </div>

          {role === 'STUDENT' && (
            <div className="form-group">
              <label className="form-label" htmlFor="roll_no">Roll Number (Unique)</label>
              <input type="text" name="roll_no" id="roll_no" className="form-input" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" name="password" id="password" className="form-input" required />
          </div>

          {state?.error && <p className="error-msg">{state.error}</p>}

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link href="/login" style={{ textDecoration: 'underline' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
