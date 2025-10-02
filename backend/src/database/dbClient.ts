import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export const useSupabase = process.env.USE_SUPABASE === 'true';

let db: SupabaseClient | Pool;

if (useSupabase) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be provided when USE_SUPABASE is true');
  }
  
  db = createClient(supabaseUrl, supabaseKey);
} else {
  const pgUser = process.env.PG_USER;
  const pgHost = process.env.PG_HOST;
  const pgDatabase = process.env.PG_DATABASE;
  const pgPassword = process.env.PG_PASSWORD;
  const pgPort = parseInt(process.env.PG_PORT || '5432');

  if (!pgUser || !pgHost || !pgDatabase || !pgPassword) {
    throw new Error('PostgreSQL environment variables must be provided when USE_SUPABASE is false');
  }

  db = new Pool({
    user: pgUser,
    host: pgHost,
    database: pgDatabase,
    password: pgPassword,
    port: pgPort,
  });
}

export { db };