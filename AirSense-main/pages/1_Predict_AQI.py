import streamlit as st
import os
import sys
import requests
import joblib
import pandas as pd

st.set_page_config(page_title="Predict AQI", page_icon="🤖", layout="wide")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_utils import load_custom_css

load_custom_css()

# Model loading
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "aqi_prediction_model.joblib")
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
    except Exception as e:
        st.warning(f"Note: Could not load trained joblib model ({e}). Using calculation formula.")

SRI_LANKA_CITIES = {
    "Colombo (Western Province)": {"lat": 6.9271, "lon": 79.8612},
    "Kandy (Central Province)": {"lat": 7.2906, "lon": 80.6337},
    "Galle (Southern Province)": {"lat": 6.0535, "lon": 80.2210},
    "Jaffna (Northern Province)": {"lat": 9.6615, "lon": 80.0255},
    "Negombo (Western Province)": {"lat": 7.2008, "lon": 79.8736},
    "Anuradhapura (North Central Province)": {"lat": 8.3114, "lon": 80.4037},
    "Nuwara Eliya (Central Province)": {"lat": 6.9497, "lon": 80.7891},
    "Trincomalee (Eastern Province)": {"lat": 8.5874, "lon": 81.2152},
    "Batticaloa (Eastern Province)": {"lat": 7.7170, "lon": 81.7000},
    "Matara (Southern Province)": {"lat": 5.9549, "lon": 80.5550},
    "Kurunegala (North Western Province)": {"lat": 7.4863, "lon": 80.3623},
    "Ratnapura (Sabaragamuwa Province)": {"lat": 6.6828, "lon": 80.4037},
    "Dambulla (Central Province)": {"lat": 7.8742, "lon": 80.6511},
    "Badulla (Uva Province)": {"lat": 6.9934, "lon": 81.0550},
    "Kalutara (Western Province)": {"lat": 6.5854, "lon": 79.9607},
}

def determine_category_and_advice(aqi: float):
    if aqi <= 50:
        return "GOOD", "Normal outdoor activities can continue. Air quality is acceptable.", "#86efac"
    elif aqi <= 100:
        return "MODERATE", "Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion.", "#fde047"
    elif aqi <= 150:
        return "UNHEALTHY FOR SENSITIVE GROUPS", "Asthma patients and sensitive groups should limit outdoor activities.", "#fb923c"
    elif aqi <= 200:
        return "UNHEALTHY", "Everyone may begin to experience health effects; asthma patients should stay indoors.", "#f87171"
    else:
        return "VERY UNHEALTHY / HAZARDOUS", "Health alert: serious risk. Stay indoors and use air filtration.", "#c084fc"

st.title("🤖 AI Air Quality Prediction & Location Telemetry")
st.write("Select a Sri Lankan location to load live meteorological data or enter custom parameters to predict AQI.")

col_loc, col_btn = st.columns([3, 1])
with col_loc:
    selected_city = st.selectbox("📍 Select Sri Lankan Location", list(SRI_LANKA_CITIES.keys()), index=0)

with col_btn:
    st.write("")
    st.write("")
    fetch_live = st.button("🔄 Fetch Live Location Data")

# Session state defaults
if "pm25" not in st.session_state:
    st.session_state.pm25 = 24.0
if "pm10" not in st.session_state:
    st.session_state.pm10 = 46.0
if "temp" not in st.session_state:
    st.session_state.temp = 30.0
if "humidity" not in st.session_state:
    st.session_state.humidity = 68.0
if "wind" not in st.session_state:
    st.session_state.wind = 2.5

if fetch_live:
    coords = SRI_LANKA_CITIES[selected_city]
    try:
        air_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={coords['lat']}&longitude={coords['lon']}&current=pm2_5,pm10"
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
        
        air_r = requests.get(air_url, timeout=5).json()
        weather_r = requests.get(weather_url, timeout=5).json()
        
        st.session_state.pm25 = float(air_r["current"]["pm2_5"])
        st.session_state.pm10 = float(air_r["current"]["pm10"])
        st.session_state.temp = float(weather_r["current"]["temperature_2m"])
        st.session_state.humidity = float(weather_r["current"]["relative_humidity_2m"])
        st.session_state.wind = float(weather_r["current"]["wind_speed_10m"])
        st.success(f"Loaded live telemetry for {selected_city}!")
    except Exception as err:
        st.error(f"Could not load live data: {err}")

with st.container():
    st.markdown("<div class='panel'>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        pm25 = st.number_input("PM2.5 (µg/m³)", value=float(st.session_state.pm25), min_value=0.0, max_value=1000.0, step=0.5, help="Valid range: 0 to 1000 µg/m³")
        temperature = st.number_input("Temperature (°C)", value=float(st.session_state.temp), min_value=-10.0, max_value=60.0, step=0.5, help="Valid range: -10°C to 60°C")
    with col2:
        pm10 = st.number_input("PM10 (µg/m³)", value=float(st.session_state.pm10), min_value=0.0, max_value=1500.0, step=0.5, help="Valid range: 0 to 1500 µg/m³")
        humidity = st.number_input("Humidity (%)", value=float(st.session_state.humidity), min_value=0.0, max_value=100.0, step=1.0, help="Valid range: 0% to 100%")
        
    wind = st.number_input("Wind Speed (m/s)", value=float(st.session_state.wind), min_value=0.0, max_value=150.0, step=0.1, help="Valid range: 0 to 150 m/s")

    if st.button("✨ Predict Air Quality"):
        # Validate inputs
        validation_errors = []
        if pm25 < 0 or pm25 > 1000:
            validation_errors.append("PM2.5 must be between 0 and 1000 µg/m³.")
        if pm10 < 0 or pm10 > 1500:
            validation_errors.append("PM10 must be between 0 and 1500 µg/m³.")
        if temperature < -10 or temperature > 60:
            validation_errors.append("Temperature must be between -10°C and 60°C.")
        if humidity < 0 or humidity > 100:
            validation_errors.append("Humidity must be between 0% and 100%.")
        if wind < 0 or wind > 150:
            validation_errors.append("Wind speed must be between 0 and 150 m/s.")

        if validation_errors:
            for err in validation_errors:
                st.error(f"⚠️ {err}")
        else:
            if model is not None:
                try:
                    feats = pd.DataFrame(
                        [[pm25, pm10, temperature, humidity, wind]],
                        columns=['PM2.5', 'PM10', 'Temp_C', 'Humidity_%', 'Wind_Speed_mps']
                    )
                    predicted_aqi = float(model.predict(feats)[0])
                except Exception:
                    predicted_aqi = (pm25 * 1.5) + (pm10 * 0.8) + (temperature * 0.5)
            else:
                predicted_aqi = (pm25 * 1.5) + (pm10 * 0.8) + (temperature * 0.5)

            predicted_aqi = max(0.0, predicted_aqi)
            category, advice, color_hex = determine_category_and_advice(predicted_aqi)

        st.markdown(
            f"""
            <div class='result-box'>
                <h2>Predicted AQI for {selected_city.split(' (')[0]}</h2>
                <h1 style='color:#7dd3fc; font-size:3rem;'>{predicted_aqi:.2f}</h1>
                <h3>Category</h3>
                <p style='color:{color_hex}; font-weight:700; font-size:1.3rem;'>{category}</p>
                <br>
                <h3>🫁 Personalized Asthma Advice</h3>
                <p>{advice}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("</div>", unsafe_allow_html=True)
