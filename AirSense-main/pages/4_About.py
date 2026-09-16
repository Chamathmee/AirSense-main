import streamlit as st

st.set_page_config(page_title="About", page_icon="ℹ️", layout="wide")

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_utils import load_custom_css

load_custom_css()

st.title("About AirSense")

st.markdown(
    """
    <div class='card'>
        <h2>Purpose</h2>
        <p>AirSense is an AI-based air quality prediction and asthma health advisory system designed to help people understand pollution levels and make safer daily decisions.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class='card'>
        <h2>Technology</h2>
        <ul>
            <li>Python</li>
            <li>Machine Learning</li>
            <li>Streamlit</li>
        </ul>
    </div>
    """,
    unsafe_allow_html=True,
)
