#!/bin/bash
set -e

echo "🚀 Iniciando despliegue..."

# Construir backend
echo "📦 Construyendo backend..."
cd backend
npm run build
cd ..

# Construir frontend con variables de producción
echo "📦 Construyendo frontend para producción..."
cp .env.production .env.local
npm run build
rm .env.local

# Reiniciar con PM2
echo "🔄 Reiniciando aplicaciones..."
pm2 startOrReload ecosystem.config.js
pm2 save

echo "✅ Despliegue completado con éxito"
echo "🌐 Frontend disponible en: http://2.58.80.90:5173"
echo "🔗 Backend API disponible en: http://2.58.80.90:3000"
