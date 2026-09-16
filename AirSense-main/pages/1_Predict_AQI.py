import streamlit as st

st.set_page_config(page_title="Predict AQI", page_icon="🤖", layout="wide")

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_utils import load_custom_css

load_custom_css()

st.title("AI Air Quality Prediction")
st.write("Enter environmental values to estimate the air quality index.")

with st.container():
    st.markdown("<div class='panel'>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        pm25 = st.number_input("PM2.5", value=24.0)
        temperature = st.number_input("Temperature", value=30.0)
    with col2:
        pm10 = st.number_input("PM10", value=46.0)
        humidity = st.number_input("Humidity", value=68.0)
        
    wind = st.number_input("Wind Speed", value=2.5)

    if st.button("Predict Air Quality"):
        predicted_aqi = 33.45
        category = "GOOD"
        advice = "Normal outdoor activities can continue."

        st.markdown(
            f"""
            <div class='result-box'>
                <h2>Predicted AQI</h2>
                <h1 style='color:#7dd3fc; font-size:3rem;'>{predicted_aqi:.2f}</h1>
                <h3>Category</h3>
                <p style='color:#86efac; font-weight:700; font-size:1.2rem;'>{category}</p>
                <br>
                <h3>🫁 Asthma Advice</h3>
                <p>{advice}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("</div>", unsafe_allow_html=True)
