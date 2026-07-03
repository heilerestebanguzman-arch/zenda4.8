import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any

class FeatureBuilder:
    """
    Construye features para modelos de predicción de ETA, demanda y anomalías.
    """
    
    def __init__(self):
        self.feature_names = []
    
    def build_eta_features(self, gps_data: pd.DataFrame) -> pd.DataFrame:
        """
        Construye features para predicción de ETA.
        
        Args:
            gps_data: DataFrame con columnas: bus_id, latitude, longitude, speed, timestamp
        
        Returns:
            DataFrame con features procesadas
        """
        df = gps_data.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Features temporales
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_rush_hour'] = df['hour'].isin([7, 8, 9, 17, 18, 19]).astype(int)
        
        # Features de velocidad
        df['speed_rolling_mean_5'] = df.groupby('bus_id')['speed'].transform(
            lambda x: x.rolling(5, min_periods=1).mean()
        )
        df['speed_rolling_std_5'] = df.groupby('bus_id')['speed'].transform(
            lambda x: x.rolling(5, min_periods=1).std().fillna(0)
        )
        
        # Features de ubicación
        df['lat_rounded'] = df['latitude'].round(3)
        df['lon_rounded'] = df['longitude'].round(3)
        
        # Distancia recorrida (cálculo simplificado)
        df['distance'] = df.groupby('bus_id')['latitude'].diff().abs() + \
                         df.groupby('bus_id')['longitude'].diff().abs()
        df['distance'] = df['distance'].fillna(0)
        df['distance_rolling_sum_10'] = df.groupby('bus_id')['distance'].transform(
            lambda x: x.rolling(10, min_periods=1).sum()
        )
        
        self.feature_names = [col for col in df.columns if col not in ['bus_id', 'timestamp']]
        
        return df
    
    def build_demand_features(self, historical_data: pd.DataFrame) -> pd.DataFrame:
        """
        Construye features para predicción de demanda.
        
        Args:
            historical_data: DataFrame con columnas: route_id, timestamp, passenger_count
        
        Returns:
            DataFrame con features procesadas
        """
        df = historical_data.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Features temporales
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_holiday'] = 0  # En producción, se cargaría desde un calendario
        
        # Demanda rezagada
        df['passenger_lag_1'] = df.groupby('route_id')['passenger_count'].shift(1)
        df['passenger_lag_7'] = df.groupby('route_id')['passenger_count'].shift(7)
        df['passenger_rolling_mean_7'] = df.groupby('route_id')['passenger_count'].transform(
            lambda x: x.rolling(7, min_periods=1).mean()
        )
        
        # Features de tendencia
        df['passenger_trend'] = df.groupby('route_id')['passenger_count'].transform(
            lambda x: x.diff(7)
        )
        
        return df
    
    def get_feature_names(self) -> list:
        """Retorna los nombres de las features disponibles"""
        return self.feature_names
