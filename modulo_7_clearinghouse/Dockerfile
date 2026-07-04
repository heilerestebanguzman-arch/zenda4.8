FROM golang:1.22-alpine AS builder

RUN apk --no-cache add git

WORKDIR /app

COPY go.mod ./
RUN go mod download && go mod verify

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o modulo_7_clearinghouse ./cmd/api/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/modulo_7_clearinghouse .
EXPOSE 8090
CMD ["./modulo_7_clearinghouse"]
