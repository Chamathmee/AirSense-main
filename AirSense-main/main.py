from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
from urllib.parse import urlencode
from urllib.request import urlopen
import json

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

class CurrentConditionsResponse(PredictionResponse):
    location: str
    pm25: float
    pm10: float
    temperature: float
    humidity: float
    wind_speed: float
    updated_at: str

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

def predict_values(pm25: float, pm10: float, temperature: float, humidity: float, wind_speed: float):
    if model is not None:
        features = [[pm25, pm10, temperature, humidity, wind_speed]]
        return float(model.predict(features)[0])
    return (pm25 * 1.5) + (pm10 * 0.8) + (temperature * 0.5)

@app.post("/predict", response_model=PredictionResponse)
def predict_aqi(data: PredictionRequest):
    try:
        predicted_aqi = predict_values(data.pm25, data.pm10, data.temperature, data.humidity, data.wind_speed)
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

@app.get("/current-conditions", response_model=CurrentConditionsResponse)
def current_conditions():
    try:
        location = {"latitude": 6.9271, "longitude": 79.8612, "timezone": "Asia/Colombo"}
        air_query = urlencode({**location, "current": "pm2_5,pm10"})
        weather_query = urlencode({**location, "current": "temperature_2m,relative_humidity_2m,wind_speed_10m"})

        with urlopen(f"https://air-quality-api.open-meteo.com/v1/air-quality?{air_query}", timeout=10) as response:
            air_data = json.load(response)
        with urlopen(f"https://api.open-meteo.com/v1/forecast?{weather_query}", timeout=10) as response:
            weather_data = json.load(response)

        pm25 = float(air_data["current"]["pm2_5"])
        pm10 = float(air_data["current"]["pm10"])
        temperature = float(weather_data["current"]["temperature_2m"])
        humidity = float(weather_data["current"]["relative_humidity_2m"])
        wind_speed = float(weather_data["current"]["wind_speed_10m"])
        predicted_aqi = predict_values(pm25, pm10, temperature, humidity, wind_speed)
        category, advice = determine_category_and_advice(predicted_aqi)

        return CurrentConditionsResponse(
            aqi=round(predicted_aqi, 2), category=category, advice=advice,
            location="Colombo, Sri Lanka", pm25=pm25, pm10=pm10,
            temperature=temperature, humidity=humidity, wind_speed=wind_speed,
            updated_at=air_data["current"]["time"],
        )
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Unable to fetch live conditions: {error}") from error

@app.get("/")
def read_root():
    return {"message": "Welcome to the AirSense API! Send POST requests to /predict."}
