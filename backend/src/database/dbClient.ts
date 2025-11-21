import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const connectionMode = process.env.CONNECTION_MODE || 'postgres';
export const useSupabase = connectionMode === 'supabase';

let db: SupabaseClient | Pool;

if (useSupabase) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided when CONNECTION_MODE is supabase');
  }

  db = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Conectado a Supabase');
} else {
  const config = {
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
  };

  if (!config.user || !config.host || !config.database || !config.password) {
    throw new Error('PostgreSQL environment variables (DATABASE_USERNAME, DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD) must be provided when CONNECTION_MODE is postgres');
  }

  db = new Pool(config);
  console.log('✓ Conectado a PostgreSQL');
}

export { db };