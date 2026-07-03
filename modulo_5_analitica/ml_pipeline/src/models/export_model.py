import joblib
import json
import os

def export_model_to_json(model_path: str, output_path: str):
    """
    Exporta el modelo a un formato JSON para ser consumido por Go.
    """
    model_data = joblib.load(model_path)
    
    # Convertir modelo a JSON (solo metadata)
    export_data = {
        'model_type': 'xgboost',
        'features': model_data.get('feature_names', []),
        'n_estimators': 300,
        'max_depth': 6
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    print(f"📤 Modelo exportado a: {output_path}")

if __name__ == "__main__":
    export_model_to_json(
        './models/eta_model.joblib',
        '../../inference/internal/eta/model_config.json'
    )
