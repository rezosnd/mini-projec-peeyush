import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId');
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });
  const { rows } = await pool.query(
    `SELECT m.id, m.content, m.created_at,
            u.id AS sender_id, u.name AS sender_name, u.role AS sender_role
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.group_id = $1
     ORDER BY m.created_at ASC LIMIT 100`,
    [groupId]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { groupId, content, senderId } = await req.json();
  if (!groupId || !content?.trim() || !senderId)
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  await pool.query(
    `INSERT INTO messages (group_id, sender_id, content) VALUES ($1, $2, $3)`,
    [groupId, senderId, content.trim()]
  );
  return NextResponse.json({ ok: true });
}
EOFmkdir -p src/app/api/messages && cat > src/app/api/messages/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId');
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });
  const { rows } = await pool.query(
    `SELECT m.id, m.content, m.created_at,
            u.id AS sender_id, u.name AS sender_name, u.role AS sender_role
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.group_id = $1
     ORDER BY m.created_at ASC LIMIT 100`,
    [groupId]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { groupId, content, senderId } = await req.json();
  if (!groupId || !content?.trim() || !senderId)
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  await pool.query(
    `INSERT INTO messages (group_id, sender_id, content) VALUES ($1, $2, $3)`,
    [groupId, senderId, content.trim()]
  );
  return NextResponse.json({ ok: true });
}
