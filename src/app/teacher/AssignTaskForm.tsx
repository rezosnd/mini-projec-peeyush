'use client';

import { assignTask } from '@/app/actions/tasks';
import { useActionState, useEffect, useRef, useState } from 'react';

const initialState: any = { error: '', success: false };

export default function AssignTaskForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await assignTask(formData) || prevState;
  }, initialState);

  const formRef = useRef<HTMLFormElement>(null);
  const [assigneeType, setAssigneeType] = useState('STUDENT');

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form action={formAction} ref={formRef} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      
      <div>
        <label className="form-label" htmlFor="assigneeType">Assign To</label>
        <select name="assigneeType" id="assigneeType" className="form-select" value={assigneeType} onChange={(e) => setAssigneeType(e.target.value)} required>
          <option value="STUDENT">Individual Student</option>
          <option value="GROUP">Student Group</option>
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="assigneeValue">
          {assigneeType === 'STUDENT' ? 'Student Roll Number' : 'Exact Group Name'}
        </label>
        <input type="text" name="assigneeValue" id="assigneeValue" className="form-input" required placeholder={assigneeType === 'STUDENT' ? 'e.g. 2105XXXX' : 'e.g. Alpha Team'} />
      </div>

      <div>
        <label className="form-label" htmlFor="title">Project Title</label>
        <input type="text" name="title" id="title" className="form-input" required placeholder="e.g. AI Chatbot" />
      </div>

      <div>
        <label className="form-label" htmlFor="description">Project Description</label>
        <textarea name="description" id="description" className="form-textarea" required placeholder="Details about what the student/group should build..." />
      </div>

      {state?.error && <p className="error-msg" style={{textAlign: 'left'}}>{state.error}</p>}
      {state?.success && <p style={{color: '#15803d', fontSize: '0.875rem'}}>Task assigned successfully!</p>}

      <div>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Assigning...' : 'Assign Project'}
        </button>
      </div>
    </form>
  );
}
