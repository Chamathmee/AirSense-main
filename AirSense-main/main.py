from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(
    title="AirSense API",
    description="Backend API for AirSense prediction models",
    version="1.0.0"
)

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development (update for production!)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class PredictionRequest(BaseModel):
    pm25: float
    pm10: float
    temperature: float
    humidity: float
    wind_speed: float

class PredictionResponse(BaseModel):
    aqi: float
    category: str
    advice: str

# Load models on startup
MODEL_PATH = "aqi_prediction_model.joblib"
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Successfully loaded model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Warning: Model file {MODEL_PATH} not found.")

def determine_category_and_advice(aqi: float):
    if aqi <= 50:
        return "GOOD", "Normal outdoor activities can continue. Air quality is acceptable."
    elif aqi <= 100:
        return "MODERATE", "Unusually sensitive people should consider reducing prolonged or heavy exertion outdoors."
    elif aqi <= 150:
        return "UNHEALTHY FOR SENSITIVE GROUPS", "Asthma patients should limit outdoor activities and keep medication nearby."
    elif aqi <= 200:
        return "UNHEALTHY", "Everyone may begin to experience health effects; asthma patients should stay indoors."
    else:
        return "VERY UNHEALTHY / HAZARDOUS", "Health alert: everyone may experience more serious health effects. Stay indoors."

@app.post("/predict", response_model=PredictionResponse)
def predict_aqi(data: PredictionRequest):
    try:
        # If the model loaded successfully, we try to use it
        if model is not None:
            # Assuming the model expects a 2D array of these exact 5 features
            features = [[data.pm25, data.pm10, data.temperature, data.humidity, data.wind_speed]]
            predicted_aqi = float(model.predict(features)[0])
        else:
            # Fallback logic if model is missing or fails (simulated for UI testing)
            predicted_aqi = (data.pm25 * 1.5) + (data.pm10 * 0.8) + (data.temperature * 0.5)
            
        category, advice = determine_category_and_advice(predicted_aqi)
        
        return PredictionResponse(
            aqi=round(predicted_aqi, 2),
            category=category,
            advice=advice
        )
    except Exception as e:
        # Fallback in case of a feature mismatch or prediction error
        print(f"Prediction error: {e}")
        fallback_aqi = 33.45 # Same as Streamlit default
        cat, adv = determine_category_and_advice(fallback_aqi)
        return PredictionResponse(aqi=fallback_aqi, category=cat, advice=adv)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AirSense API! Send POST requests to /predict."}
