FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o modulo_9_incidentes ./cmd/api/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

ENV TZ=America/Bogota

RUN adduser -D -u 1000 appuser

COPY --from=builder /app/modulo_9_incidentes /app/modulo_9_incidentes

RUN chown -R appuser:appuser /app

USER appuser

WORKDIR /app

EXPOSE 8089

CMD ["/app/modulo_9_incidentes"]
