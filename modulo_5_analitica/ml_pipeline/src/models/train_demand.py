import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

class DemandTrainer:
    """
    Entrenador del modelo XGBoost para predicción de demanda de pasajeros.
    """
    
    def __init__(self):
        self.model = None
    
    def generate_synthetic_data(self, n_samples: int = 10000) -> pd.DataFrame:
        """
        Genera datos sintéticos para entrenamiento.
        En producción, estos datos provendrían de validadores y sistemas de boleto.
        """
        np.random.seed(42)
        
        data = {
            'route_id': np.random.randint(1, 20, n_samples),
            'hour': np.random.randint(6, 23, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.randint(0, 2, n_samples),
            'is_rush_hour': np.random.randint(0, 2, n_samples),
            'passenger_count': np.random.poisson(15, n_samples) + np.random.randint(-5, 10, n_samples)
        }
        
        df = pd.DataFrame(data)
        df['passenger_count'] = df['passenger_count'].clip(0, 50)
        
        # Agregar estacionalidad
        df['passenger_count'] += df['hour'].apply(lambda x: 5 if x in [7,8,9,17,18,19] else 0)
        df['passenger_count'] = df['passenger_count'].clip(0, 60)
        
        return df
    
    def train(self, df: pd.DataFrame):
        """
        Entrena el modelo XGBoost para demanda.
        """
        # Features y target
        feature_cols = ['route_id', 'hour', 'day_of_week', 'is_weekend', 'is_rush_hour']
        X = df[feature_cols]
        y = df['passenger_count']
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Configurar XGBoost
        params = {
            'n_estimators': 200,
            'max_depth': 5,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'objective': 'reg:squarederror',
            'random_state': 42
        }
        
        print("🚀 Entrenando modelo XGBoost para demanda...")
        self.model = xgb.XGBRegressor(**params)
        self.model.fit(X_train, y_train, verbose=False)
        
        # Evaluar
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"✅ Modelo de demanda entrenado")
        print(f"   - MAE: {mae:.2f} pasajeros")
        print(f"   - RMSE: {rmse:.2f} pasajeros")
        
        return {
            'mae': mae,
            'rmse': rmse,
            'feature_importance': self.model.feature_importances_
        }
    
    def save_model(self, path: str = './models/demand_model.joblib'):
        """
        Guarda el modelo entrenado.
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        print(f"💾 Modelo de demanda guardado en: {path}")
    
    def run(self):
        """
        Ejecuta el pipeline de entrenamiento.
        """
        print("=" * 60)
        print("🚀 ZENDA 4.8 - Entrenamiento de Modelo de Demanda")
        print("=" * 60)
        
        # Generar datos sintéticos (en producción, cargar desde DB)
        df = self.generate_synthetic_data(20000)
        print(f"📊 Generados {len(df)} registros sintéticos")
        
        # Entrenar
        metrics = self.train(df)
        
        # Guardar modelo
        self.save_model()
        
        print("\n✅ Entrenamiento de demanda completado")
        print("=" * 60)

if __name__ == "__main__":
    trainer = DemandTrainer()
    trainer.run()
