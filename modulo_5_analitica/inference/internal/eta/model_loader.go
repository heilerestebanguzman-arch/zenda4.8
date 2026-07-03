package eta

import (
    "encoding/json"
    "os"
)

type ModelConfig struct {
    ModelType  string   `json:"model_type"`
    Features   []string `json:"features"`
    Estimators int      `json:"n_estimators"`
    MaxDepth   int      `json:"max_depth"`
}

type ModelLoader struct {
    Config *ModelConfig
}

func NewModelLoader(configPath string) (*ModelLoader, error) {
    file, err := os.Open(configPath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    var config ModelConfig
    decoder := json.NewDecoder(file)
    if err := decoder.Decode(&config); err != nil {
        return nil, err
    }

    return &ModelLoader{Config: &config}, nil
}

func (m *ModelLoader) GetFeatures() []string {
    return m.Config.Features
}
