import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env siempre, a menos que estemos explícitamente en producción con variables ya configuradas
// En desarrollo, el .env está en la raíz del backend
// __dirname en dist/config.js apunta a dist/, entonces ../.env va a backend/.env
const envPath = path.resolve(__dirname, '..', '.env');
console.log('🔍 Cargando .env desde:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error cargando .env:', result.error);
} else {
  console.log('✅ .env cargado correctamente');
  console.log('USE_SUPABASE:', process.env.USE_SUPABASE);
}