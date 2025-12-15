import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function getClient() {
  return pool.connect();
}

export async function initializeDatabase(): Promise<void> {
  const client = await getClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        room_id VARCHAR(10) PRIMARY KEY,
        master_id VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        wines JSONB NOT NULL,
        participants JSONB DEFAULT '[]',
        current_round INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_rounds (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(10) REFERENCES rooms(room_id),
        round_num INTEGER NOT NULL,
        wine_ids INTEGER[] NOT NULL,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        selections JSONB DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(10) REFERENCES rooms(room_id),
        session_date DATE NOT NULL,
        wine_stats JSONB NOT NULL,
        player_stats JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

export default pool;
