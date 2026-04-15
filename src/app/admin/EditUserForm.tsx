'use client';

import { adminUpdateUser } from '@/app/actions/tasks';
import type { ActionState, UserRow } from '@/lib/types';
import { useActionState, useState } from 'react';

const initialState: ActionState = { error: '', success: false };

export default function EditUserForm({ user }: { user: UserRow }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(async (prevState: ActionState, formData: FormData) => {
    const res = await adminUpdateUser(formData);
    if (res?.success) setIsOpen(false);
    return res || prevState;
  }, initialState);

  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} className="btn btn-outline btn-sm">Edit</button>;
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div className="card" style={{margin: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <h3 className="card-title">Edit User</h3>
          <button onClick={() => setIsOpen(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--fg)'}}>✕</button>
        </div>
        
        <form action={formAction} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <input type="hidden" name="user_id" value={user.id} />
          
          <div>
            <label className="form-label" htmlFor={`name-${user.id}`}>Name</label>
            <input type="text" name="name" id={`name-${user.id}`} defaultValue={user.name} className="form-input" required />
          </div>

          <div>
            <label className="form-label" htmlFor={`roll-${user.id}`}>Roll No</label>
            <input type="text" name="roll_no" id={`roll-${user.id}`} defaultValue={user.roll_no || ''} className="form-input" />
          </div>

          <div>
            <label className="form-label" htmlFor={`pass-${user.id}`}>New Password (leave blank to keep current)</label>
            <input type="password" name="password" id={`pass-${user.id}`} className="form-input" />
          </div>

          {state?.error && <p className="error-msg">{state.error}</p>}

          <div style={{marginTop: '0.5rem'}}>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
