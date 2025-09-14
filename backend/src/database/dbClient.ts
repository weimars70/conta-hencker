import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

console.log('Valor de USE_SUPABASE (raw):', configService.get<string>('USE_SUPABASE'));
export const useSupabase = configService.get<string>('USE_SUPABASE') === 'true';
console.log('Valor de useSupabase (evaluado):', useSupabase);

let db: SupabaseClient | Pool;

if (useSupabase) {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseKey = configService.get<string>('SUPABASE_KEY');
  db = createClient(supabaseUrl, supabaseKey);
} else {
  const pgUser = configService.get<string>('PG_USER');
  const pgHost = configService.get<string>('PG_HOST');
  const pgDatabase = configService.get<string>('PG_DATABASE');
  const pgPassword = configService.get<string>('PG_PASSWORD');
  const pgPort = parseInt(configService.get<string>('PG_PORT'), 10); 

  console.log('Valores de conexión a PostgreSQL:', { pgUser, pgHost, pgDatabase, pgPassword, pgPort });

  db = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
  });
}

export { db };