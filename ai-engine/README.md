# StoicPips AI Engine

This is the Python microservice that powers the AI Scalping Module. It fetches real-time data and uses an XGBoost model to generate trading signals.

## Setup

1.  **Install Python 3.9+**
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## Running Locally

Run the specific command:
```bash
python main.py
```
Or with uvicorn directly:
```bash
uvicorn main:app --reload
```

The service will start on `http://localhost:8000`.

## Endpoints

-   `GET /`: Health check.
-   `POST /predict`: Generate a signal.
    -   Body: `{"symbol": "EURUSD", "timeframe": "1m"}`

## Note
The service currently uses a **Mock Model** for demonstration. It trains on random data on startup. In production, you would load a saved model from `model.json`.
