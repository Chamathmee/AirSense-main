import streamlit as st

st.set_page_config(page_title="Air Quality", page_icon="🌍", layout="wide")

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_utils import load_custom_css

load_custom_css()

st.title("Air Quality Information")

st.markdown(
    """
    <div class='card'>
        <div class='badge'>What is AQI?</div>
        <p>Air Quality Index (AQI) shows how clean or polluted the air is. Higher values usually mean more risk for health.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class='card'>
        <h2>AQI Categories</h2>
        <p><strong>0-50</strong> — Good 🟢</p>
        <p><strong>51-100</strong> — Moderate 🟡</p>
        <p><strong>101-150</strong> — Unhealthy for Sensitive Groups 🟠</p>
        <p><strong>151+</strong> — Unhealthy 🔴</p>
    </div>
    """,
    unsafe_allow_html=True,
)

c1, c2, c3 = st.columns(3)

with c1:
    st.markdown(
        """
        <div class='card'>
            <h3>PM2.5</h3>
            <p>Tiny particles that can enter the lungs and bloodstream.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c2:
    st.markdown(
        """
        <div class='card'>
            <h3>PM10</h3>
            <p>Larger particles that can affect breathing and irritate the respiratory system.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c3:
    st.markdown(
        """
        <div class='card'>
            <h3>NO2</h3>
            <p>Gas released mainly by traffic and industrial activity.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
