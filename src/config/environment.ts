/**
 * Configuración de entorno de la aplicación
 *
 * DB_MODE:
 * - 'supabase': Usa Supabase para desarrollo (incluye realtime, auth, etc.)
 * - 'postgres': Usa PostgreSQL directo para producción (solo base de datos)
 */

export const DB_MODE = import.meta.env.VITE_DB_MODE || 'supabase';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración de Supabase (solo cuando DB_MODE === 'supabase')
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  enabled: DB_MODE === 'supabase'
};

// Variable de compatibilidad (deprecada - usar SUPABASE_CONFIG.enabled)
export const USE_SUPABASE = SUPABASE_CONFIG.enabled;

// Debug en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Configuración de entorno:');
  console.log('   - DB_MODE:', DB_MODE);
  console.log('   - API_URL:', API_URL);
  console.log('   - Supabase habilitado:', SUPABASE_CONFIG.enabled);
}
