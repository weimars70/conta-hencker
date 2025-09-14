# Sistema ERP con Vue + Quasar + NestJS

Sistema ERP modular con frontend en Vue.js/Quasar y backend en NestJS que soporta PostgreSQL.

## 🚀 Características

- **Frontend**: Vue 3 + Quasar Framework + TypeScript
- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT con bcrypt
- **Arquitectura**: Modular y escalable

## 🔧 Configuración de Base de Datos

El sistema ahora solo soporta PostgreSQL.

### 🐘 PostgreSQL (Para producción y desarrollo)
```env
CONNECTION_MODE=postgres
DATABASE_HOST=tu-host-postgresql
DATABASE_PORT=5432
DATABASE_USERNAME=tu-usuario
DATABASE_PASSWORD=tu-password
DATABASE_NAME=tu-base-datos
```

## 📦 Instalación

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
npm install
npm run dev
```

## 🔐 Credenciales de Prueba

- **Email**: `admin@test.com`
- **Contraseña**: `admin123`
- **Empresas**: `01` (Principal), `02` (Secundaria)

## 📊 Módulos Disponibles

- ✅ **Autenticación** - Login con JWT
- ✅ **Gestión de Usuarios** - CRUD completo
- ✅ **Control de Accesos** - Permisos por empresa
- ✅ **Catálogos Genéricos** - Sectores, Tarifas, Estratos
- ✅ **Reportes PDF** - Generación de reportes


## 🔄 Cambiar Modo de Base de Datos

1. Edita el archivo `backend/.env`
2. Cambia `CONNECTION_MODE=postgres` (asegúrate de que esté configurado así)
3. Reinicia el backend

## 🛠️ Desarrollo

### Estructura del Proyecto
```
├── src/                    # Frontend Vue/Quasar
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── stores/            # Estado global (Pinia)
│   └── services/          # Servicios de API
├── backend/               # Backend NestJS
│   ├── src/auth/          # Módulo de autenticación
│   ├── src/database/      # Servicios de base de datos
│   └── src/generic-capture/ # Captura genérica de datos
└── android/               # Aplicación móvil (Capacitor)
```

### Scripts Disponibles
```bash
# Frontend
npm run dev              # Servidor de desarrollo
npm run build           # Build para producción

# Backend
npm run start:dev       # Servidor de desarrollo con hot-reload
npm run build          # Build para producción
npm run start:prod     # Servidor de producción

# Ambos
npm run start:all      # Inicia frontend y backend simultáneamente
```