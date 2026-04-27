'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './GroupChat.module.css';

type Msg = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
};

export default function GroupChat({ groupId, currentUserId }: { groupId: string; currentUserId: string; }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch(`/api/messages?groupId=${groupId}`);
    if (res.ok) setMsgs(await res.json());
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, content: input.trim(), senderId: currentUserId }),
    });
    setInput('');
    await load();
    setSending(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.dot} />
        Group Chat
      </div>
      <div className={styles.list}>
        {msgs.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`${styles.bubble} ${mine ? styles.mine : styles.theirs}`}>
              {!mine && (
                <span className={styles.name}>
                  {m.sender_name}
                  {m.sender_role === 'TEACHER' && <span className={styles.badge}>Faculty</span>}
                </span>
              )}
              <p>{m.content}</p>
              <time>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputRow}>
        <input className={styles.inp} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message…" disabled={sending} />
        <button className={styles.btn} onClick={send} disabled={sending || !input.trim()}>{sending ? '…' : 'Send'}</button>
      </div>
    </div>
  );
}
