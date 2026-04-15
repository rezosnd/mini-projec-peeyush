'use client';

import { updateTaskProgress, addTodo, toggleTodo } from '@/app/actions/tasks';
import type { ActionState, TaskRow, TodoRow } from '@/lib/types';
import { useActionState, useRef } from 'react';

export default function ProgressTracker({ task, todos }: { task: TaskRow; todos: TodoRow[] }) {
  const [, progAction, isSavingProg] = useActionState(async (prevState: ActionState, fd: FormData) => {
    const res = await updateTaskProgress(fd);
    return res || prevState;
  }, { error: '' });

  const [, addTodoAction, isAddingTodo] = useActionState(async (prevState: ActionState, fd: FormData) => {
    const res = await addTodo(fd);
    return res || prevState;
  }, { error: '' });
  const formRef = useRef<HTMLFormElement>(null);

  // Auto reset form on successful save but we don't strictly have success boolean in generic useActionState.
  // We can just rely on standard uncontrolled form resets or just let it be.

  return (
    <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
      <h4 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '1rem'}}>Track Progress</h4>
      
      <form action={progAction} style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem'}}>
        <input type="hidden" name="task_id" value={task.id} />
        <div style={{flexGrow: 1}}>
          <label className="form-label" style={{fontSize: '0.75rem'}}>Completion %</label>
          <input type="range" name="progress" min="0" max="100" defaultValue={task.progress ?? 0} style={{width: '100%'}} />
          <div style={{fontSize: '0.75rem', textAlign: 'right'}}>{task.progress ?? 0}% current</div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingProg} style={{width: 'auto'}}>Save</button>
      </form>

      <div style={{marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem'}}>To-Do List</div>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
        {todos.map(todo => (
          <div key={todo.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'}}>
            <form action={async (fd) => { await toggleTodo(fd); }} style={{display: 'flex'}}>
              <input type="hidden" name="todo_id" value={todo.id} />
              <input type="hidden" name="is_completed" value={todo.is_completed ? 'false' : 'true'} />
              <button type="submit" style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <input type="checkbox" checked={todo.is_completed} readOnly style={{cursor: 'pointer'}} />
              </button>
            </form>
            <span style={{textDecoration: todo.is_completed ? 'line-through' : 'none', color: todo.is_completed ? 'var(--muted-fg)' : 'inherit'}}>{todo.description}</span>
          </div>
        ))}
        {todos.length === 0 && <span style={{fontSize: '0.75rem', color: 'var(--muted-fg)'}}>No items yet.</span>}
      </div>

      <form action={addTodoAction} ref={formRef} onSubmit={() => setTimeout(() => formRef.current?.reset(), 50)} style={{display: 'flex', gap: '0.5rem'}}>
        <input type="hidden" name="task_id" value={task.id} />
        <input type="text" name="description" className="form-input" style={{padding: '0.375rem'}} placeholder="New item..." required />
        <button type="submit" className="btn btn-outline btn-sm" disabled={isAddingTodo}>Add</button>
      </form>
    </div>
  );
}
