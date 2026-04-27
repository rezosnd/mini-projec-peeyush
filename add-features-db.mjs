import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_CwUrbDT24tHX@ep-misty-violet-ann6g7mf-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrate() {
  try {
    await pool.query('BEGIN');
    await pool.query(`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;`);
    console.log('task_todos.assigned_to column added');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        group_id UUID REFERENCES student_groups(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('messages table created');
    await pool.query('COMMIT');
    console.log('Migration complete!');
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', e.message);
  } finally {
    pool.end();
  }
}
migrate();
