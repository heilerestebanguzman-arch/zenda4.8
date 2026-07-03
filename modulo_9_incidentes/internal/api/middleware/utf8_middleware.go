package middleware

import (
	"net/http"
	"strings"
)

// EnsureUTF8Middleware asegura que el Content-Type sea UTF-8
func EnsureUTF8Middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Forzar que el Content-Type sea application/json con UTF-8
		if strings.Contains(r.Header.Get("Content-Type"), "application/json") {
			r.Header.Set("Content-Type", "application/json; charset=UTF-8")
		}
		next(w, r)
	}
}
