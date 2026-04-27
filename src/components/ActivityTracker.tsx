'use client';
import { useEffect, useState } from 'react';
import styles from './ActivityTracker.module.css';

type Todo = {
  id: string;
  description: string;
  is_completed: boolean;
  assigned_to: string | null;
  assignee_name: string | null;
};

type Member = { id: string; name: string };

export default function ActivityTracker({ taskId, members, isTeacher }: { taskId: string; members: Member[]; isTeacher: boolean; }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [progress, setProgress] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/todos?taskId=${taskId}`);
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
      setProgress(data.progress);
    }
  };

  useEffect(() => { load(); }, [taskId]);

  const toggle = async (todoId: string, checked: boolean) => {
    setBusy(true);
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoId, is_completed: checked }),
    });
    await load();
    setBusy(false);
  };

  const addTodo = async () => {
    if (!newDesc.trim()) return;
    setBusy(true);
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, description: newDesc, assignedTo: assignTo || null }),
    });
    setNewDesc('');
    setAssignTo('');
    await load();
    setBusy(false);
  };

  const done = todos.filter((t) => t.is_completed).length;
  const total = todos.length;

  return

cat > src/components/ActivityTracker.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import styles from './ActivityTracker.module.css';

type Todo = {
  id: string;
  description: string;
  is_completed: boolean;
  assigned_to: string | null;
  assignee_name: string | null;
};

type Member = { id: string; name: string };

export default function ActivityTracker({ taskId, members, isTeacher }: { taskId: string; members: Member[]; isTeacher: boolean; }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [progress, setProgress] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/todos?taskId=${taskId}`);
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
      setProgress(data.progress);
    }
  };

  useEffect(() => { load(); }, [taskId]);

  const toggle = async (todoId: string, checked: boolean) => {
    setBusy(true);
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoId, is_completed: checked }),
    });
    await load();
    setBusy(false);
  };

  const addTodo = async () => {
    if (!newDesc.trim()) return;
    setBusy(true);
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, description: newDesc, assignedTo: assignTo || null }),
    });
    setNewDesc('');
    setAssignTo('');
    await load();
    setBusy(false);
  };

  const done = todos.filter((t) => t.is_completed).length;
  const total = todos.length;

  return
cat > src/components/ActivityTracker.module.css << 'EOF'
.wrap {
  font-family: 'Syne', 'Plus Jakarta Sans', sans-serif;
  background: rgba(15,15,30,0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
  color: #d4d4f0;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a0a0c8;
}
.pct {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6c63ff;
}
.track {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #6c63ff, #a78bfa);
  border-radius: 10px;
  transition: width 0.5s ease;
}
.sub {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  margin: 0 0 16px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  transition: background 0.15s;
}
.row:hover { background: rgba(255,255,255,0.07); }
.check { accent-color: #6c63ff; width: 15px; height: 15px; cursor: pointer; }
.text { font-size: 0.875rem; flex: 1; }
.done { font-size: 0.875rem; flex: 1; text-decoration: line-through; opacity: 0.35; }
.assignee {
  font-size: 0.7rem;
  color: #9c8df4;
  background: rgba(108,99,255,0.1);
  border: 1px solid rgba(108,99,255,0.25);
  border-radius: 20px;
  padding: 2px 8px;
  white-space: nowrap;
}
.empty {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.25);
  text-align: center;
  padding: 12px 0;
  margin: 0;
}
.form {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formLabel {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6c63ff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}
.inp {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 9px 12px;
  color: #e0e0f8;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.inp:focus { border-color: #6c63ff; }
.inp::placeholder { color: rgba(255,255,255,0.2); }
.btn {
  background: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  width: fit-content;
  transition: opacity 0.2s;
}
.btn:hover:not(:disabled) { opacity: 0.85; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }
