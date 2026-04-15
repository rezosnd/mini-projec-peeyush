import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CwUrbDT24tHX@ep-misty-violet-ann6g7mf-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function migrate() {
  try {
    await pool.query('BEGIN');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) UNIQUE NOT NULL,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_group_members (
        group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, student_id)
      );
    `);

    // Alter tasks table. IF EXISTS is not standard for columns in vanilla Postgres without a DO block, but we can try adding unconditionally and ignore error if it exists.
    // Let's do it safely.
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES student_groups(id) ON DELETE CASCADE;
      ALTER TABLE tasks ALTER COLUMN student_id DROP NOT NULL;
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('COMMIT');
    console.log('Database schema successfully updated for Groups and Todos.');
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    pool.end();
  }
}

migrate();
