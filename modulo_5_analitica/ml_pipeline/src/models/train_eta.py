import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from dotenv import load_dotenv
import psycopg2
from sqlalchemy import create_engine

from ..features.feature_builder import FeatureBuilder

load_dotenv()

class ETATrainer:
    """
    Entrenador del modelo XGBoost para predicción de ETA.
    """
    
    def __init__(self):
        self.model = None
        self.feature_builder = FeatureBuilder()
        self.label_encoders = {}
    
    def load_data_from_db(self):
        """
        Carga datos de GPS desde PostgreSQL.
        """
        db_url = os.getenv('DATABASE_URL', 'postgresql://zenda_admin:zenda_secure_pass_2026@localhost:5432/zenda')
        engine = create_engine(db_url)
        
        query = """
            SELECT 
                bus_id,
                latitude,
                longitude,
                speed,
                timestamp,
                route_id
            FROM gps_logs 
            ORDER BY timestamp DESC 
            LIMIT 100000
        """
        
        df = pd.read_sql(query, engine)
        print(f"📊 Cargados {len(df)} registros de GPS")
        return df
    
    def prepare_training_data(self, df: pd.DataFrame) -> tuple:
        """
        Prepara los datos para entrenamiento.
        """
        # Construir features
        df = self.feature_builder.build_eta_features(df)
        
        # Crear target: tiempo promedio de viaje (simplificado)
        # En producción, se usaría la diferencia entre paradas
        df['eta_target'] = df.groupby('bus_id')['distance_rolling_sum_10'].transform(
            lambda x: x / 60  # Minutos
        )
        
        # Eliminar filas con valores nulos
        df = df.dropna()
        
        # Codificar variables categóricas
        categorical_cols = ['bus_id', 'route_id']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        # Seleccionar features
        feature_cols = [col for col in df.columns if col not in ['timestamp', 'eta_target', 'distance']]
        feature_cols = [col for col in feature_cols if not col.startswith('_')]
        
        X = df[feature_cols]
        y = df['eta_target']
        
        print(f"🔬 Features seleccionadas: {len(feature_cols)}")
        print(f"📈 Muestras de entrenamiento: {len(X)}")
        
        return X, y, feature_cols
    
    def train(self, X: pd.DataFrame, y: pd.Series):
        """
        Entrena el modelo XGBoost.
        """
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Configurar XGBoost
        params = {
            'n_estimators': 300,
            'max_depth': 6,
            'learning_rate': 0.05,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'objective': 'reg:squarederror',
            'random_state': 42
        }
        
        print("🚀 Entrenando modelo XGBoost...")
        self.model = xgb.XGBRegressor(**params)
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            verbose=False
        )
        
        # Evaluar
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"✅ Modelo entrenado")
        print(f"   - MAE: {mae:.2f} minutos")
        print(f"   - RMSE: {rmse:.2f} minutos")
        
        return {
            'mae': mae,
            'rmse': rmse,
            'feature_importance': self.model.feature_importances_
        }
    
    def save_model(self, path: str = './models/eta_model.joblib'):
        """
        Guarda el modelo entrenado.
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_builder.get_feature_names()
        }, path)
        print(f"💾 Modelo guardado en: {path}")
    
    def run(self):
        """
        Ejecuta todo el pipeline de entrenamiento.
        """
        print("=" * 60)
        print("🚀 ZENDA 4.8 - Entrenamiento de Modelo ETA")
        print("=" * 60)
        
        # Cargar datos
        df = self.load_data_from_db()
        
        if df.empty:
            print("❌ No hay datos disponibles para entrenar")
            return
        
        # Preparar datos
        X, y, feature_cols = self.prepare_training_data(df)
        
        if X.empty or y.empty:
            print("❌ No hay datos suficientes después del preprocesamiento")
            return
        
        # Entrenar
        metrics = self.train(X, y)
        
        # Guardar modelo
        self.save_model()
        
        print("\n✅ Entrenamiento completado exitosamente")
        print("=" * 60)

if __name__ == "__main__":
    trainer = ETATrainer()
    trainer.run()
