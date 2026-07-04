# 📘 LECCIONES APRENDIDAS - ZENDA 4.8

## 1. YAML y Docker Compose
- ❌ **Error**: Bloques en sección `volumes:` en lugar de `services:`
- ✅ **Solución**: Verificar siempre la indentación (2 espacios)
- 🔧 **Prevención**: Ejecutar `docker-compose config` antes de commit

## 2. TypeScript con verbatimModuleSyntax
- ❌ **Error**: `'Ticket' is a type and must be imported using a type-only import`
- ✅ **Solución**: Usar `import type { Ticket } from './types'`
- 🔧 **Prevención**: Usar plantilla base con `verbatimModuleSyntax: true`

## 3. Go - go.sum
- ❌ **Error**: `checksum mismatch`
- ✅ **Solución**: Ejecutar `go mod tidy` en la carpeta del módulo
- 🔧 **Prevención**: No generar go.sum manualmente

## 4. UTF-8 en Git Bash
- ❌ **Error**: `Botón` aparece como `Bot�n`
- ✅ **Solución**: Usar archivos JSON para pruebas con caracteres especiales
- 🔧 **Prevención**: En producción (Linux), el problema no existe

## 5. NATS Health Check
- ❌ **Error**: NATS no pasaba el healthcheck
- ✅ **Solución**: Deshabilitar healthcheck o usar `service_started`
- 🔧 **Prevención**: Configurar dependencias con `condition: service_started`

## 6. TypeScript - File appears to be binary
- ❌ **Error**: `File appears to be binary` al compilar
- ✅ **Solución**: Recrear el archivo desde cero
- 🔧 **Prevención**: Usar `cat > archivo.ts << 'EOF'` correctamente
