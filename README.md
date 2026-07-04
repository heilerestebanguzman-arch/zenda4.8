# ZENDA 4.8 - Sistema de Gestión de Transporte Público

## 🚀 Descripción

ZENDA 4.8 es una plataforma de gestión de transporte público basada en microservicios, diseñada con arquitectura Clean/Hexagonal y comunicación asíncrona mediante NATS.

## 🏗️ Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Módulo 9   │────▶│    NATS     │────▶│  Módulo 8   │
│ Incidentes  │     │  (Broker)   │     │    CRM      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │ PostgreSQL  │
                                          │   (PostGIS) │
                                          └─────────────┘
```

## 📋 Módulos

| Módulo | Lenguaje | Puerto | Estado |
|--------|----------|--------|--------|
| M1 - Flota | Go | 8081 | ✅ Completado |
| M2 - Usuarios | Node.js/TS | 3000 | ✅ Completado |
| M3 - Cobro | Go | 8085 | ✅ Completado |
| M4 - Administración | Node.js/TS | 3001 | ✅ Completado |
| M5 - Analítica | Python/Go | 8086 | ✅ Completado |
| M6 - CMMS | Go | 8087 | ✅ Completado |
| M8 - CRM | Node.js/TS | 3002 | ✅ Completado |
| M9 - Incidentes | Go | 8089 | ✅ Completado |
| Web Dashboard | React/TS | 3003 | ✅ Completado |

## 🔧 Requisitos

- Docker & Docker Compose
- Go 1.22+
- Node.js 20+
- Python 3.11+

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/zenda4.8.git
cd zenda4.8
```
