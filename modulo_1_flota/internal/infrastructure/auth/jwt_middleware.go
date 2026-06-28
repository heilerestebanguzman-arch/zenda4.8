package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware(validator *TokenValidator) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Obtener el token del header Authorization
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error":   "unauthorized",
					"message": "Token de autenticación requerido",
				})
				return
			}

			// Extraer el token (Bearer <token>)
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error":   "unauthorized",
					"message": "Formato de token inválido. Use: Bearer <token>",
				})
				return
			}

			tokenString := parts[1]

			// Validar el token
			claims, err := validator.Validate(tokenString)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error":   "unauthorized",
					"message": "Token inválido o expirado",
				})
				return
			}

			// Guardar claims en el contexto
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next(w, r.WithContext(ctx))
		}
	}
}

// GetUserFromContext obtiene los claims del usuario desde el contexto
func GetUserFromContext(ctx context.Context) *UserClaims {
	if claims, ok := ctx.Value(UserContextKey).(*UserClaims); ok {
		return claims
	}
	return nil
}
