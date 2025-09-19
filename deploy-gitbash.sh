#!/bin/bash
# Script de despliegue para Git Bash
echo "🚀 Iniciando despliegue completo del proyecto..."

# Variables
VPS_IP="2.58.80.90"
VPS_USER="weimars"
VPS_PATH="/home/weimars/hencker"

# Crear directorio temporal
TEMP_DIR="temp_deploy"
echo "📦 Creando copia temporal del proyecto..."

# Limpiar directorio temporal si existe
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copiar archivos excluyendo node_modules y otros
echo "📋 Copiando archivos (excluyendo node_modules)..."
rsync -av --exclude='node_modules' --exclude='backend/node_modules' --exclude='.git' --exclude='dist' --exclude='backend/dist' --exclude='*.log' --exclude='.env.local' ./ "$TEMP_DIR/"

# Si rsync no está disponible, usar cp con find
if [ $? -ne 0 ]; then
    echo "⚠️  rsync no disponible, usando cp..."
    find . -type f ! -path './node_modules/*' ! -path './backend/node_modules/*' ! -path './.git/*' ! -path './dist/*' ! -path './backend/dist/*' ! -name '*.log' ! -name '.env.local' -exec cp --parents {} "$TEMP_DIR/" \;
fi

# Transferir al VPS
echo "📤 Transfiriendo archivos al VPS..."
scp -r "$TEMP_DIR"/* "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

if [ $? -eq 0 ]; then
    echo "✅ Archivos transferidos exitosamente"
    
    # Ejecutar comandos en el VPS
    echo "🔧 Instalando dependencias y ejecutando aplicación..."
    
    ssh "${VPS_USER}@${VPS_IP}" << EOF
cd ${VPS_PATH}
echo "📦 Instalando dependencias del frontend..."
npm install
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..
echo "🏗️ Compilando aplicación..."
npm run build:all
echo "🚀 Iniciando aplicación en modo producción..."
npm run start:prod
EOF
    
else
    echo "❌ Error al transferir archivos"
    exit 1
fi

# Limpiar directorio temporal
echo "🧹 Limpiando archivos temporales..."
rm -rf "$TEMP_DIR"

echo "✅ Despliegue completado exitosamente!"
echo "🌐 Frontend disponible en: http://${VPS_IP}:5173"
echo "🔧 Backend disponible en: http://${VPS_IP}:3000"
