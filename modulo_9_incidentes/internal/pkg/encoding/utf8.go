package encoding

import (
	"strings"
	"unicode/utf8"
)

// ToUTF8 convierte una string a UTF-8 válido, reemplazando caracteres inválidos
func ToUTF8(s string) string {
	if utf8.ValidString(s) {
		return s
	}
	
	// Intentar reparar caracteres comunes de Windows-1252
	replacer := strings.NewReplacer(
		"\x93", "“",  // Comillas latinas
		"\x94", "”",
		"\x85", "…",  // Elipsis
		"\x96", "–",  // Guion corto
		"\x97", "—",  // Guion largo
		"\x81", "",   // Caracteres de control
		"\x8D", "",
		"\x8F", "",
		"\x90", "",
		"\x9D", "",
	)
	s = replacer.Replace(s)
	
	// Construir string con solo caracteres UTF-8 válidos
	var builder strings.Builder
	for _, r := range s {
		if r == utf8.RuneError {
			continue
		}
		builder.WriteRune(r)
	}
	
	return builder.String()
}
