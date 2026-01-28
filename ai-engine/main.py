import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from model import TradePredictor
from data_loader import MarketDataLoader

load_dotenv()

app = FastAPI(title="StoicPips AI Engine", version="1.0.0")

# Initialize components
data_loader = MarketDataLoader()
predictor = TradePredictor()

class SignalRequest(BaseModel):
    symbol: str
    timeframe: str = "1m"
    strategy_mode: str = "scalping"

@app.on_event("startup")
async def startup_event():
    # In a real scenario, we might load a pre-trained model here
    print("🚀 AI Engine starting up...")
    # Mock training for V1 so it works out of the box
    predictor.train_mock_model()

@app.get("/")
def health_check():
    return {"status": "online", "service": "AI Engine"}

@app.post("/predict")
async def predict_signal(request: SignalRequest):
    try:
        # 1. Fetch Data
        df = await data_loader.fetch_candles(request.symbol, request.timeframe)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {request.symbol}")

        # 2. Generate Prediction
        prediction = predictor.predict(df)
        
        return {
            "symbol": request.symbol,
            "action": prediction["action"], # BUY, SELL, HOLD
            "confidence": prediction["confidence"], # 0-100
            "analysis": prediction["analysis"],
            "timestamp": df.index[-1].isoformat()
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
