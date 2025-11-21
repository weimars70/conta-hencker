import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

/**
 * Cliente de base de datos que cambia entre Supabase y PostgreSQL
 * según la variable de entorno USE_SUPABASE
 */

// Evaluar el modo de conexión
export const useSupabase = process.env.USE_SUPABASE === 'true';

let db: SupabaseClient | Pool;

if (useSupabase) {
  // Modo Supabase (desarrollo)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be provided when USE_SUPABASE is true');
  }

  db = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Conectado a Supabase');
} else {
  // Modo PostgreSQL (producción)
  const config = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432'),
  };

  if (!config.user || !config.host || !config.database || !config.password) {
    throw new Error('PostgreSQL environment variables (PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD) must be provided when USE_SUPABASE is false');
  }

  db = new Pool(config);
  console.log('✓ Conectado a PostgreSQL');
}

export { db };