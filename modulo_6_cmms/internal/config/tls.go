package config

import (
    "crypto/tls"
)

func LoadTLSConfig() (*tls.Config, error) {
    return &tls.Config{
        MinVersion: tls.VersionTLS12,
    }, nil
}
