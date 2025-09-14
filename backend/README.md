# Acueductos Backend

Backend desarrollado con NestJS que soporta conexión tanto a Supabase como a PostgreSQL directo.

## Características

- **Dual Database Support**: Conecta a Supabase o PostgreSQL directo
- **Authentication**: JWT con Passport
- **API Documentation**: Swagger/OpenAPI
- **Modular Architecture**: Estructura modular con NestJS
- **TypeORM**: ORM para manejo de base de datos
- **Validation**: Validación de datos con class-validator

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

## Configuración

### Variables de Entorno

Edita el archivo `.env` con tus configuraciones:

```env
# Modo de conexión: 'supabase' o 'postgres'
CONNECTION_MODE=supabase

# Para Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Para PostgreSQL directo
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=acueductos_db

# JWT
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h
```

### Modos de Conexión

#### Modo Supabase (`CONNECTION_MODE=supabase`)
- Utiliza la API de Supabase para todas las operaciones
- Aprovecha las características de Supabase como RLS, realtime, etc.
- Ideal para desarrollo rápido y escalabilidad

#### Modo PostgreSQL (`CONNECTION_MODE=postgres`)
- Conexión directa a PostgreSQL usando TypeORM
- Control total sobre las consultas SQL
- Ideal para aplicaciones que requieren consultas complejas

## Uso

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Consumptions
- `GET /consumo/view` - Listar consumos con filtros
- `POST /consumo` - Crear consumo
- `GET /consumo/:id` - Obtener consumo por ID
- `PUT /consumo/:id` - Actualizar consumo
- `DELETE /consumo/:id` - Eliminar consumo

### Installations
- `GET /instalaciones` - Buscar instalación por código
- `GET /instalaciones/all` - Listar todas las instalaciones

### Generic Capture
- `GET /generic-capture/:tableName` - Listar registros de tabla
- `POST /generic-capture` - Crear registro
- `PUT /generic-capture` - Actualizar registro
- `DELETE /generic-capture/:tableName/:codigo` - Eliminar registro

### PDF Reports


## Documentación API

Una vez iniciado el servidor, visita:
- Swagger UI: `http://localhost:3000/api/docs`

## Estructura del Proyecto

```
src/
├── auth/              # Autenticación y autorización
├── consumption/       # Módulo de consumos
├── database/          # Configuración de base de datos
├── generic-capture/   # Captura genérica de datos
├── installation/      # Módulo de instalaciones
├── pdf/              # Generación de reportes PDF
├── supabase/         # Servicio de Supabase
└── users/            # Módulo de usuarios
```

## Desarrollo

### Agregar Nuevo Módulo

```bash
# Generar módulo completo
nest g module nombre-modulo
nest g service nombre-modulo
nest g controller nombre-modulo

# Generar entidad
nest g class nombre-modulo/entities/nombre.entity
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Despliegue

### Docker (Opcional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno necesarias en tu plataforma de despliegue.

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.