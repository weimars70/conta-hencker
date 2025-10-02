export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Debug para verificar la configuración
console.log('🔧 API_URL configurada:', API_URL);
console.log('🔧 VITE_API_URL desde env:', import.meta.env.VITE_API_URL);
console.log('🔧 USE_SUPABASE configurado:', USE_SUPABASE);
console.log('🔧 VITE_USE_SUPABASE desde env:', import.meta.env.VITE_USE_SUPABASE);