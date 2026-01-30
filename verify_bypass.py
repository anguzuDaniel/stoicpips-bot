import pandas as pd
import numpy as np
import sys
import os

# Add the ai-engine directory to the path so we can import modules
sys.path.append(r"c:\Users\kenyi\OneDrive\Desktop\projects\dunam-bot\ai-engine")

from model import TradePredictor

def verify_bypass():
    print("🧪 Verifying Hold Bypass Logic...")
    predictor = TradePredictor()
    
    # Train the mock model to ensure it's ready
    predictor.train_mock_model()
    
    # Create synthetic data similar to what's used in training/prediction
    # We'll create a single internal 'df_features' row effectively by mocking the dataframe
    # But predicting requires a dataframe that feature_engineering can process.
    # To keep it simple, we will mock the PREDICTOR'S internal model.predict_proba directly 
    # OR we can just feed it data that would usually result in a hold.
    
    # Let's try to feed it ambiguous data that would normally result in a HOLD
    # typically middle-ground RSI
    
    data = {
        'open': [100] * 20,
        'high': [105] * 20,
        'low': [95] * 20,
        'close': [100] * 20,
        'volume': [1000] * 20,
    }
    df = pd.DataFrame(data)
    
    # The current predictor.predict() does feature engineering internally.
    # Let's see if we can just call predict multiples times with random noise
    # and ensure we NEVER see "HOLD".
    
    print("Running 50 predictions with random inputs...")
    
    hold_count = 0
    buy_count = 0
    sell_count = 0
    
    for i in range(50):
        # Generate random OHLCV
        random_data = {
            'open': np.random.uniform(90, 110, 30),
            'high': np.random.uniform(110, 120, 30),
            'low': np.random.uniform(80, 90, 30),
            'close': np.random.uniform(90, 110, 30),
            'volume': np.random.uniform(100, 1000, 30),
        }
        df_random = pd.DataFrame(random_data)
        
        try:
            result = predictor.predict(df_random)
            action = result['action']
            print(f"Prediction {i+1}: {action} (Conf {result['confidence']})")
            
            if action == "HOLD":
                hold_count += 1
            elif action == "BUY":
                buy_count += 1
            elif action == "SELL":
                sell_count += 1
                
        except Exception as e:
            print(f"Error during prediction: {e}")
            # Depending on feature engineering, might fail on random data if not enough rows
            # but we passed 30, should be enough for basic indicators
            pass

    print("\n--- Summary ---")
    print(f"BUY: {buy_count}")
    print(f"SELL: {sell_count}")
    print(f"HOLD: {hold_count}")
    
    if hold_count == 0:
        print("\n✅ Verification SUCCESS: No HOLD decisions generated.")
    else:
        print("\n❌ Verification FAILED: HOLD decisions were generated.")

if __name__ == "__main__":
    verify_bypass()
