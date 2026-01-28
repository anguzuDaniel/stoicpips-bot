import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from feature_engineering import FeatureEngineer
import joblib
import os

class TradePredictor:
    def __init__(self):
        self.model = XGBClassifier(
            n_estimators=100, 
            learning_rate=0.05, 
            max_depth=5, 
            random_state=42
        )
        self.fe = FeatureEngineer()
        self.is_trained = False
        self.model_path = "xgboost_model.json"

    def train_mock_model(self):
        """
        Train a quick mock model on random data so the API has something to serve.
        This enables 'Plug & Play' testing for the user.
        """
        print("🛠️ Training Mock Model for initialization...")
        # Generate synthetic data
        data = {
            'rsi': np.random.uniform(20, 80, 1000),
            'macd': np.random.uniform(-0.5, 0.5, 1000),
            'macd_signal': np.random.uniform(-0.5, 0.5, 1000),
            'macd_diff': np.random.uniform(-0.1, 0.1, 1000),
            'dist_to_supply': np.random.uniform(0, 0.05, 1000),
            'dist_to_demand': np.random.uniform(0, 0.05, 1000)
        }
        df = pd.DataFrame(data)
        
        # Target: 0=HOLD, 1=BUY, 2=SELL
        # Simple logic for mock: Low RSI -> Buy, High RSI -> Sell
        targets = []
        for rsi in df['rsi']:
            if rsi < 30: targets.append(1) # Buy
            elif rsi > 70: targets.append(2) # Sell
            else: targets.append(0) # Hold
            
        X = df
        y = np.array(targets)
        
        self.model.fit(X, y)
        self.is_trained = True
        print("✅ Mock Model Trained successfully")

    def predict(self, df: pd.DataFrame):
        """
        Takes raw OHLCV dataframe, applies FE, and returns prediction.
        """
        if not self.is_trained:
            self.train_mock_model()

        # 1. Apply Feature Engineering
        df_features = self.fe.add_technical_indicators(df)
        
        if df_features.empty:
            return {
                "action": "HOLD",
                "confidence": 0,
                "analysis": "Insufficient data for features"
            }

        # 2. Prepare latest row for inference
        # Select the features we trained on
        feature_cols = ['rsi', 'macd', 'macd_signal', 'macd_diff', 'dist_to_supply', 'dist_to_demand']
        
        # Ensure columns exist (handle case where FE might have failed/dropped all)
        current_data = df_features.iloc[[-1]][feature_cols] # Double brackets to keep DataFrame format
        
        # 3. Predict Probas
        probas = self.model.predict_proba(current_data)[0]
        # Classes: 0=HOLD, 1=BUY, 2=SELL
        
        hold_prob = probas[0]
        buy_prob = probas[1]
        sell_prob = probas[2]
        
        # 4. Determine Action
        action = "HOLD"
        confidence = hold_prob
        
        if buy_prob > 0.6 and buy_prob > sell_prob:
            action = "BUY"
            confidence = buy_prob
        elif sell_prob > 0.6 and sell_prob > buy_prob:
            action = "SELL"
            confidence = sell_prob
            
        return {
            "action": action,
            "confidence": round(confidence * 100, 2),
            "analysis": {
                "rsi": round(current_data['rsi'].values[0], 2),
                "macd": round(current_data['macd'].values[0], 5),
                "dist_supply": round(current_data['dist_to_supply'].values[0], 4),
                "dist_demand": round(current_data['dist_to_demand'].values[0], 4)
            }
        }
