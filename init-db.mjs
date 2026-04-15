import pg from 'pg';
const { Pool } = pg;
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CwUrbDT24tHX@ep-misty-violet-ann6g7mf-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function init() {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
        name VARCHAR(100) NOT NULL,
        roll_no VARCHAR(50) UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING_SUBMISSION' CHECK (status IN ('PENDING_SUBMISSION', 'SUBMITTED', 'GRADED')),
        submission_ppt TEXT,
        submission_report TEXT,
        submission_github TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    console.log('Users table created or exists.');

    await pool.query(createTasksTable);
    console.log('Tasks table created or exists.');

    // Create an initial admin if not exists
    const adminCheck = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['ADMIN']);
    if (adminCheck.rowCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (role, name, roll_no, password) VALUES ($1, $2, $3, $4)',
        ['ADMIN', 'System Admin', 'admin', hashedPassword]
      );
      console.log('Admin user created (Username: admin, Password: admin123).');
    }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    pool.end();
  }
}

init();
