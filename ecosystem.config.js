module.exports = {
  apps: [
    {
      name: "conta-hencker-backend",
      script: "./dist/main.js", // build del backend NestJS
      cwd: "./backend",         // apunta a la carpeta backend
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Database Configuration
        USE_SUPABASE: "false",
        DATABASE_URL: "postgresql://hencker:%23%23HENCKER2025%40%40%3F%21@2.58.80.90:55433/hencker",
        // PostgreSQL Configuration
        PG_USER: "hencker",
        PG_HOST: "2.58.80.90",
        PG_DATABASE: "hencker",
        PG_PASSWORD: "##HENCKER2025@@?!",
        PG_PORT: "55433",
        // JWT Configuration
        JWT_SECRET: "your_super_secret_jwt_key_here_make_it_long_and_secure",
        JWT_EXPIRES_IN: "24h"
      }
    },
    {
      name: "conta-hencker-frontend",
      script: "./server.js", // servidor estático para el frontend
      cwd: "./",              // desde la raíz del proyecto
      env: {
        NODE_ENV: "production",
        PORT: 5173
      }
    }
  ]
};
