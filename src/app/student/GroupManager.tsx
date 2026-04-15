'use client';

import { createGroup, addMemberToGroup } from '@/app/actions/groups';
import type { ActionState, GroupRow } from '@/lib/types';
import { useActionState, useState } from 'react';

export default function GroupManager({ userGroups }: { userGroups: GroupRow[] }) {
  const [activeTab, setActiveTab] = useState('create');
  
  const [createState, createAction, isCreating] = useActionState(async (prev: ActionState, fd: FormData) => (await createGroup(fd)) || prev, { error: '' });
  const [addState, addAction, isAdding] = useActionState(async (prev: ActionState, fd: FormData) => (await addMemberToGroup(fd)) || prev, { error: '' });

  return (
    <div className="card" style={{maxWidth: '100%'}}>
      <h3 className="card-title">My Groups</h3>
      
      {userGroups.length > 0 && (
        <div style={{marginBottom: '1.5rem'}}>
          {userGroups.map(g => (
            <span key={g.id} className="badge" style={{marginRight: '0.5rem', marginBottom: '0.5rem'}}>{g.name}</span>
          ))}
        </div>
      )}

      <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem'}}>
        <button className="btn" style={{background: 'none', color: activeTab === 'create' ? 'var(--fg)' : 'var(--muted-fg)', borderBottom: activeTab === 'create' ? '2px solid var(--fg)' : 'none', padding: '0.5rem 0', borderRadius: 0, width: 'auto'}} onClick={() => setActiveTab('create')}>Create Group</button>
        <button className="btn" style={{background: 'none', color: activeTab === 'add' ? 'var(--fg)' : 'var(--muted-fg)', borderBottom: activeTab === 'add' ? '2px solid var(--fg)' : 'none', padding: '0.5rem 0', borderRadius: 0, width: 'auto'}} onClick={() => setActiveTab('add')}>Add Member</button>
      </div>

      {activeTab === 'create' && (
        <form action={createAction} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <div>
            <label className="form-label">New Group Name</label>
            <input type="text" name="name" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Add a Peer (Roll No) - Optional</label>
            <input type="text" name="peer_roll_no" className="form-input" />
          </div>
          {createState?.error && <p className="error-msg">{createState.error}</p>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={isCreating}>Create</button>
        </form>
      )}

      {activeTab === 'add' && (
        <form action={addAction} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <div>
            <label className="form-label">Select Group</label>
            <select name="group_id" className="form-select" required>
              {userGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Student Roll No</label>
            <input type="text" name="roll_no" className="form-input" required />
          </div>
          {addState?.error && <p className="error-msg">{addState.error}</p>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={isAdding}>Add Member</button>
        </form>
      )}
    </div>
  );
}
