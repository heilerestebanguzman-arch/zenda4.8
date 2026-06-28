# ============================================
# ZENDA v4.8 - Módulo 1 (Flota)
# Dockerfile para producción
# ============================================

# Etapa 1: Construcción
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o modulo_1_flota ./cmd/api/main.go

# Etapa 2: Imagen final
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

ENV TZ=America/Bogota

RUN adduser -D -u 1000 appuser

COPY --from=builder /app/modulo_1_flota /app/modulo_1_flota

# NOTA: No se copia .env - las variables de entorno se inyectan desde docker-compose.yml
# Esto hace la imagen más segura y ligera

RUN chown -R appuser:appuser /app

USER appuser

WORKDIR /app

EXPOSE 8081

CMD ["/app/modulo_1_flota"]
