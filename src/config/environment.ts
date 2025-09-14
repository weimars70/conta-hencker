export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Debug para verificar la URL de la API
console.log('🔧 API_URL configurada:', API_URL);
console.log('🔧 VITE_API_URL desde env:', import.meta.env.VITE_API_URL);