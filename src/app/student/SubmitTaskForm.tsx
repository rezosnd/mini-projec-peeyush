'use client';

import { submitTask } from '@/app/actions/tasks';
import { useActionState } from 'react';

const initialState: any = { error: '', success: false };

export default function SubmitTaskForm({ taskId }: { taskId: string }) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await submitTask(formData) || prevState;
  }, initialState);

  return (
    <form action={formAction} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
      <input type="hidden" name="task_id" value={taskId} />
      
      <div>
        <label className="form-label" style={{fontSize: '0.75rem'}} htmlFor={`ppt-${taskId}`}>PPT Link</label>
        <input type="url" name="ppt_link" id={`ppt-${taskId}`} className="form-input" style={{padding: '0.375rem'}} required placeholder="https://docs.google.com/presentation/..." />
      </div>

      <div>
        <label className="form-label" style={{fontSize: '0.75rem'}} htmlFor={`report-${taskId}`}>Report Link</label>
        <input type="url" name="report_link" id={`report-${taskId}`} className="form-input" style={{padding: '0.375rem'}} required placeholder="https://docs.google.com/document/..." />
      </div>

      <div>
        <label className="form-label" style={{fontSize: '0.75rem'}} htmlFor={`github-${taskId}`}>GitHub Repo Link</label>
        <input type="url" name="github_link" id={`github-${taskId}`} className="form-input" style={{padding: '0.375rem'}} required placeholder="https://github.com/username/repo" />
      </div>

      {state?.error && <p className="error-msg" style={{textAlign: 'left'}}>{state.error}</p>}

      <div style={{marginTop: '0.5rem'}}>
        <button type="submit" className="btn btn-primary" style={{padding: '0.375rem'}} disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Items'}
        </button>
      </div>
    </form>
  );
}
