# Variables de Configuración del Proyecto

Este documento explica dónde se evalúan las variables de configuración para cambiar entre Supabase y PostgreSQL.

## Resumen de Variables

| Ubicación | Variable | Valores | Descripción |
|-----------|----------|---------|-------------|
| Frontend (.env) | `VITE_DB_MODE` | `'supabase'` o `'postgres'` | Define el modo de base de datos |
| Backend (backend/.env) | `USE_SUPABASE` | `'true'` o `'false'` | Activa/desactiva Supabase |
| Producción (ecosystem.config.js) | `USE_SUPABASE` | `"false"` | Configuración para PM2 |

## Frontend

### Archivos donde se evalúa:

#### 1. `src/config/environment.ts`
```typescript
export const DB_MODE = import.meta.env.VITE_DB_MODE || 'supabase';
export const USE_SUPABASE = SUPABASE_CONFIG.enabled;
```
**Línea 9 y 20**: Define el modo basándose en `VITE_DB_MODE`

#### 2. `src/config/supabase.ts`
```typescript
if (SUPABASE_CONFIG.enabled) {
  supabaseInstance = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}
```
**Línea 14**: Solo crea el cliente si está habilitado

#### 3. `src/services/api/accesos.service.ts`
```typescript
import { USE_SUPABASE } from '../../config/environment';

if (USE_SUPABASE) {
  return await getFromSupabase(filters);
} else {
  return await getFromPostgreSQL(filters);
}
```
**Líneas 120, 128, 147, 166, 186, 201**: Decide entre Supabase o API backend

#### 4. `src/services/supabase/realtime.ts`
```typescript
if (!isSupabaseEnabled()) {
  console.warn('⚠️ Realtime no disponible');
  return () => {};
}
```
**Línea 14**: Verifica si Supabase está habilitado antes de usar realtime

## Backend

### Archivos donde se evalúa:

#### 1. `backend/src/database/dbClient.ts` ⭐ **ARCHIVO PRINCIPAL**
```typescript
export const useSupabase = process.env.USE_SUPABASE === 'true';

if (useSupabase) {
  db = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Conectado a Supabase');
} else {
  db = new Pool(config);
  console.log('✓ Conectado a PostgreSQL');
}
```
**Línea 10**: Evalúa `USE_SUPABASE` y crea la conexión apropiada

Este es el archivo más importante porque exporta:
- `useSupabase`: booleano que indica el modo actual
- `db`: cliente de base de datos (SupabaseClient o Pool de PostgreSQL)

#### 2. Servicios que usan `useSupabase`:

Todos estos archivos importan `useSupabase` desde `dbClient.ts`:

- `backend/src/auth/auth.service.ts` (línea 58)
- `backend/src/accesos/accesos.service.ts` (líneas 68, 125, 158, 195, 244, 274)
- `backend/src/contabilidad/contabilidad.service.ts` (líneas 53, 93, 134, 174, 214)
- `backend/src/database/database.service.ts` (líneas 18, 46, 105, 131, 162, 197)
- `backend/src/empresas/empresas.service.ts` (líneas 66, 102, 135, 192, 232, 266, 289)
- `backend/src/plan-contable/plan-contable.service.ts` (líneas 44, 134, 176)
- `backend/src/usuarios/usuarios.service.ts` (líneas 79, 189, 219, 248, 280, 308, 334)

Ejemplo de uso típico en los servicios:
```typescript
import { useSupabase } from '../database/dbClient';

if (useSupabase) {
  // Código usando Supabase
  const { data, error } = await supabase.from('tabla').select();
} else {
  // Código usando PostgreSQL
  const result = await pool.query('SELECT * FROM tabla');
}
```

#### 3. `backend/src/config.ts`
```typescript
export const config = {
  useSupabase: process.env.USE_SUPABASE === 'true',
  // ... resto de configuración
};
```
**Línea 22**: Centraliza la configuración

## Producción (PM2)

#### `ecosystem.config.js`
```javascript
env: {
  USE_SUPABASE: "false",
  PG_USER: "hencker",
  PG_HOST: "2.58.80.90",
  PG_DATABASE: "hencker",
  PG_PASSWORD: "##HENCKER2025@@?!",
  PG_PORT: "55433",
}
```
**Línea 11**: Configurado para usar PostgreSQL en producción

## Flujo de Evaluación

### Al Iniciar la Aplicación:

1. **Backend** (`backend/src/database/dbClient.ts`):
   ```
   USE_SUPABASE === 'true' → Conecta a Supabase
   USE_SUPABASE === 'false' → Conecta a PostgreSQL
   ```

2. **Frontend** (`src/config/environment.ts`):
   ```
   VITE_DB_MODE === 'supabase' → Habilita cliente Supabase
   VITE_DB_MODE === 'postgres' → Usa solo API backend
   ```

### Durante una Petición:

1. **Frontend** consulta `USE_SUPABASE`:
   - Si es `true`: Hace consulta directa a Supabase
   - Si es `false`: Llama al API backend

2. **Backend** consulta `useSupabase`:
   - Si es `true`: Usa `supabase.from()`
   - Si es `false`: Usa `pool.query()`

## Para Cambiar de Modo:

### Desarrollo (Supabase):
```bash
# Frontend .env
VITE_DB_MODE=supabase

# Backend backend/.env
USE_SUPABASE=true
```

### Producción (PostgreSQL):
```bash
# Frontend .env
VITE_DB_MODE=postgres

# Backend backend/.env
USE_SUPABASE=false
```

## Verificación

Para verificar qué modo está activo:

**Frontend** (consola del navegador):
```
🔧 Configuración de entorno:
   - DB_MODE: supabase
   - API_URL: http://localhost:3000
   - Supabase habilitado: true
```

**Backend** (consola del servidor):
```
✓ Conectado a Supabase
// o
✓ Conectado a PostgreSQL
```

## Notas Importantes

1. ⚠️ El modo debe ser consistente entre frontend y backend para que la aplicación funcione correctamente

2. 🔒 En producción con PostgreSQL, las credenciales deben estar en el archivo `.env` del backend o en las variables de entorno de PM2

3. 📊 Supabase incluye features adicionales (realtime, auth, storage) que no están disponibles en PostgreSQL puro

4. 🔄 Cambiar de modo requiere reiniciar tanto el frontend como el backend
