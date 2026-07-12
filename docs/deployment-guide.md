# 🚀 Guía de Despliegue - ZENDA 4.8

## Requisitos del Sistema
- Docker 24+
- Node.js 20+
- Go 1.22+
- PostgreSQL 15+
- Redis 7+

## Pasos de Despliegue

### 1. Clonar el repositorio
`git clone https://github.com/heilerestebanguzman-arch/zenda4.8.git`
`cd zenda4.8`

### 2. Configurar variables de entorno
`cp example.env .env`
Editar `.env` con valores de producción

### 3. Levantar servicios base
`docker-compose up -d postgres redis nats`

### 4. Iniciar módulos
`# M2 - Usuarios`
`cd modulo_2_usuarios && npm run dev`

`# M12 - API Pública`
`cd modulo_12_api_publica/backend && npm run dev`

`# M13 - Reportes`
`cd modulo_13_reportes && npm run dev`

`# Frontend`
`cd web_dashboard && npm run dev`

### 5. Verificar estado
`curl http://localhost:3000/health`
`curl http://localhost:8093/health`
`curl http://localhost:8094/health`

## 🔐 Configuración de Seguridad
`JWT_SECRET=tu_secret_aqui`
`DB_HOST=localhost`
`DB_PORT=5432`
`DB_USER=zenda_admin`
`DB_PASSWORD=tu_password`
`DB_NAME=zenda`
`REDIS_URL=redis://localhost:6379`
`NATS_URL=nats://localhost:4222`

## 📊 Monitoreo
`# Verificar estado de servicios`
`./scripts/monitor.sh`

`# Realizar backup`
`./scripts/backup.sh`

## 🚨 Solución de problemas

### Error: Puerto en uso
`# Encontrar proceso que usa el puerto`
`netstat -ano | findstr :3000`
`# Terminar proceso`
`taskkill //PID <PID> //F`

### Error: Conexión a PostgreSQL
`# Verificar que PostgreSQL está corriendo`
`docker ps | grep postgres`
`# Verificar conexión`
`docker exec zenda-postgres pg_isready -U zenda_admin`
