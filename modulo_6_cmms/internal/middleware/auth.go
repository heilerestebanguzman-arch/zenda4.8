package middleware

import (
    "context"
    "encoding/json"
    "net/http"
    "strings"

    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID   string `json:"user_id"`
    UserName string `json:"user_name"`
    Role     string `json:"role"`
    jwt.RegisteredClaims
}

type AuthMiddleware struct {
    jwtSecret []byte
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
    return &AuthMiddleware{
        jwtSecret: []byte(secret),
    }
}

func (m *AuthMiddleware) ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return m.jwtSecret, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, jwt.ErrSignatureInvalid
}

func (m *AuthMiddleware) Authenticate(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error": "Missing authorization header",
            })
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error": "Invalid authorization header format",
            })
            return
        }

        claims, err := m.ValidateToken(parts[1])
        if err != nil {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error": "Invalid token: " + err.Error(),
            })
            return
        }

        ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
        ctx = context.WithValue(ctx, "user_name", claims.UserName)
        ctx = context.WithValue(ctx, "role", claims.Role)

        next(w, r.WithContext(ctx))
    }
}
