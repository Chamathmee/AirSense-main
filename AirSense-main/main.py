from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
import warnings
from urllib.parse import urlencode
from urllib.request import urlopen
import json
import requests
from datetime import datetime, timezone

# Suppress sklearn unpickling and feature name warnings
warnings.filterwarnings("ignore", category=UserWarning)

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
    pm25: float = Field(..., ge=0.0, le=1000.0, description="PM2.5 concentration in µg/m³ (0-1000)")
    pm10: float = Field(..., ge=0.0, le=1500.0, description="PM10 concentration in µg/m³ (0-1500)")
    temperature: float = Field(..., ge=-10.0, le=60.0, description="Temperature in °C (-10 to 60)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in % (0-100)")
    wind_speed: float = Field(..., ge=0.0, le=150.0, description="Wind speed in m/s (0-150)")

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

# Load models on startup using absolute script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "aqi_prediction_model.joblib")
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Successfully loaded model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Warning: Model file {MODEL_PATH} not found.")

# Default baseline conditions (Colombo, Sri Lanka)
DEFAULT_CONDITIONS = {
    "location": "Colombo, Sri Lanka",
    "pm25": 24.2,
    "pm10": 46.5,
    "temperature": 29.8,
    "humidity": 68.0,
    "wind_speed": 11.2,
}

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
        try:
            features = pd.DataFrame(
                [[pm25, pm10, temperature, humidity, wind_speed]],
                columns=['PM2.5', 'PM10', 'Temp_C', 'Humidity_%', 'Wind_Speed_mps']
            )
            return float(model.predict(features)[0])
        except Exception as e:
            print(f"Model prediction warning, using fallback formula: {e}")
    return (pm25 * 1.5) + (pm10 * 0.8) + (temperature * 0.5)

@app.post("/predict", response_model=PredictionResponse)
def predict_aqi(data: PredictionRequest):
    try:
        predicted_aqi = predict_values(data.pm25, data.pm10, data.temperature, data.humidity, data.wind_speed)
        predicted_aqi = max(0.0, predicted_aqi)
        category, advice = determine_category_and_advice(predicted_aqi)
        
        return PredictionResponse(
            aqi=round(predicted_aqi, 2),
            category=category,
            advice=advice
        )
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=f"Prediction calculation failed: {str(e)}")

# Curated list of major Sri Lankan locations with precise geographical coordinates
SRI_LANKA_LOCATIONS = [
    {"name": "Colombo", "province": "Western Province", "latitude": 6.9271, "longitude": 79.8612},
    {"name": "Kandy", "province": "Central Province", "latitude": 7.2906, "longitude": 80.6337},
    {"name": "Galle", "province": "Southern Province", "latitude": 6.0535, "longitude": 80.2210},
    {"name": "Jaffna", "province": "Northern Province", "latitude": 9.6615, "longitude": 80.0255},
    {"name": "Negombo", "province": "Western Province", "latitude": 7.2008, "longitude": 79.8736},
    {"name": "Gampaha", "province": "Western Province", "latitude": 7.0840, "longitude": 79.9943},
    {"name": "Kurunegala", "province": "North Western Province", "latitude": 7.4863, "longitude": 80.3623},
    {"name": "Anuradhapura", "province": "North Central Province", "latitude": 8.3114, "longitude": 80.4037},
    {"name": "Ratnapura", "province": "Sabaragamuwa Province", "latitude": 6.6828, "longitude": 80.4037},
    {"name": "Batticaloa", "province": "Eastern Province", "latitude": 7.7170, "longitude": 81.7000},
    {"name": "Trincomalee", "province": "Eastern Province", "latitude": 8.5874, "longitude": 81.2152},
    {"name": "Matara", "province": "Southern Province", "latitude": 5.9549, "longitude": 80.5550},
    {"name": "Nuwara Eliya", "province": "Central Province", "latitude": 6.9497, "longitude": 80.7891},
    {"name": "Badulla", "province": "Uva Province", "latitude": 6.9934, "longitude": 81.0550},
    {"name": "Kalutara", "province": "Western Province", "latitude": 6.5854, "longitude": 79.9607},
    {"name": "Dambulla", "province": "Central Province", "latitude": 7.8742, "longitude": 80.6511},
    {"name": "Polonnaruwa", "province": "North Central Province", "latitude": 7.9403, "longitude": 81.0188},
    {"name": "Puttalam", "province": "North Western Province", "latitude": 8.0408, "longitude": 79.8394},
    {"name": "Hambantota", "province": "Southern Province", "latitude": 6.1429, "longitude": 81.1212},
    {"name": "Kegalle", "province": "Sabaragamuwa Province", "latitude": 7.2513, "longitude": 80.3464},
    {"name": "Matale", "province": "Central Province", "latitude": 7.4675, "longitude": 80.6234},
    {"name": "Vavuniya", "province": "Northern Province", "latitude": 8.7514, "longitude": 80.4971},
    {"name": "Mannar", "province": "Northern Province", "latitude": 8.9810, "longitude": 79.9044},
    {"name": "Kilinochchi", "province": "Northern Province", "latitude": 9.3803, "longitude": 80.3770},
    {"name": "Mullaitivu", "province": "Northern Province", "latitude": 9.2671, "longitude": 80.8142},
    {"name": "Ampara", "province": "Eastern Province", "latitude": 7.2912, "longitude": 81.6724},
    {"name": "Monaragala", "province": "Uva Province", "latitude": 6.8728, "longitude": 81.3507},
    {"name": "Moratuwa", "province": "Western Province", "latitude": 6.7730, "longitude": 79.8816},
    {"name": "Dehiwala-Mount Lavinia", "province": "Western Province", "latitude": 6.8402, "longitude": 79.8712},
    {"name": "Sri Jayawardenepura Kotte", "province": "Western Province", "latitude": 6.9016, "longitude": 79.9077},
    {"name": "Ella", "province": "Uva Province", "latitude": 6.8667, "longitude": 81.0466},
    {"name": "Bentota", "province": "Southern Province", "latitude": 6.4259, "longitude": 79.9959},
    {"name": "Hikkaduwa", "province": "Southern Province", "latitude": 6.1404, "longitude": 80.1011},
    {"name": "Tangalle", "province": "Southern Province", "latitude": 6.0242, "longitude": 80.7941},
    {"name": "Sigiriya", "province": "Central Province", "latitude": 7.9570, "longitude": 80.7603},
    {"name": "Bandarawela", "province": "Uva Province", "latitude": 6.8333, "longitude": 80.9833},
]

@app.get("/locations")
def get_locations():
    """Return all predefined Sri Lankan cities and districts."""
    return {"locations": SRI_LANKA_LOCATIONS}

@app.get("/search-locations")
def search_locations(q: str = ""):
    """Search for locations within Sri Lanka with fallback geocoding."""
    query = q.strip().lower()
    if not query:
        return {"results": SRI_LANKA_LOCATIONS[:10]}
    
    # 1. Search in predefined list
    matched = [
        loc for loc in SRI_LANKA_LOCATIONS
        if query in loc["name"].lower() or query in loc["province"].lower()
    ]
    
    # 2. If fewer results, query Open-Meteo geocoding filtered for Sri Lanka
    if len(matched) < 5:
        try:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urlencode({'q': query})[2:]}&count=10&format=json"
            geo_resp = requests.get(geo_url, timeout=4, headers={"User-Agent": "AirSense/1.0"})
            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                for item in geo_data.get("results", []):
                    if item.get("country_code") == "LK" or item.get("country") == "Sri Lanka":
                        name = item.get("name")
                        admin = item.get("admin1", "Sri Lanka")
                        # avoid duplicates
                        if not any(m["name"].lower() == name.lower() for m in matched):
                            matched.append({
                                "name": name,
                                "province": admin or "Sri Lanka",
                                "latitude": float(item.get("latitude")),
                                "longitude": float(item.get("longitude"))
                            })
        except Exception as e:
            print(f"Geocoding search warning: {e}")
            
    return {"results": matched}

@app.get("/current-conditions", response_model=CurrentConditionsResponse)
def current_conditions(
    location: str = "Colombo, Sri Lanka",
    latitude: float = 6.9271,
    longitude: float = 79.8612
):
    pm25 = DEFAULT_CONDITIONS["pm25"]
    pm10 = DEFAULT_CONDITIONS["pm10"]
    temperature = DEFAULT_CONDITIONS["temperature"]
    humidity = DEFAULT_CONDITIONS["humidity"]
    wind_speed = DEFAULT_CONDITIONS["wind_speed"]
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M")

    try:
        loc_params = {"latitude": latitude, "longitude": longitude, "timezone": "Asia/Colombo"}
        air_query = urlencode({**loc_params, "current": "pm2_5,pm10"})
        weather_query = urlencode({**loc_params, "current": "temperature_2m,relative_humidity_2m,wind_speed_10m"})

        air_resp = requests.get(
            f"https://air-quality-api.open-meteo.com/v1/air-quality?{air_query}",
            timeout=5,
            headers={"User-Agent": "AirSense/1.0"}
        )
        weather_resp = requests.get(
            f"https://api.open-meteo.com/v1/forecast?{weather_query}",
            timeout=5,
            headers={"User-Agent": "AirSense/1.0"}
        )

        if air_resp.status_code == 200 and weather_resp.status_code == 200:
            air_data = air_resp.json()
            weather_data = weather_resp.json()
            pm25 = float(air_data["current"]["pm2_5"])
            pm10 = float(air_data["current"]["pm10"])
            temperature = float(weather_data["current"]["temperature_2m"])
            humidity = float(weather_data["current"]["relative_humidity_2m"])
            wind_speed = float(weather_data["current"]["wind_speed_10m"])
            updated_at = str(air_data["current"]["time"])
        else:
            print(f"Weather API non-200 status: air={air_resp.status_code}, weather={weather_resp.status_code}")
    except Exception as error:
        print(f"Live meteorological API unavailable ({error}). Using baseline regional conditions.")

    predicted_aqi = predict_values(pm25, pm10, temperature, humidity, wind_speed)
    category, advice = determine_category_and_advice(predicted_aqi)

    return CurrentConditionsResponse(
        aqi=round(predicted_aqi, 2),
        category=category,
        advice=advice,
        location=location,
        pm25=pm25,
        pm10=pm10,
        temperature=temperature,
        humidity=humidity,
        wind_speed=wind_speed,
        updated_at=updated_at,
    )

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"message": "Welcome to the AirSense API! Send POST requests to /predict."}
