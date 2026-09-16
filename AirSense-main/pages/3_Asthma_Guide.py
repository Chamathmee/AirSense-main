import streamlit as st

st.set_page_config(page_title="Asthma Guide", page_icon="🫁", layout="wide")

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_utils import load_custom_css

load_custom_css()

st.title("🫁 Asthma Guide")

st.markdown(
    """
    <div class='card'>
        <h2>How Air Pollution Affects Asthma</h2>
        <p>Polluted air can trigger:</p>
        <ul>
            <li>Breathing difficulty</li>
            <li>Coughing</li>
            <li>Chest tightness</li>
            <li>Asthma attacks</li>
        </ul>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class='card'>
        <h2>Safety Recommendations</h2>
        <p>✓ Check AQI before going outside</p>
        <p>✓ Avoid outdoor activities during poor air quality</p>
        <p>✓ Keep medication available</p>
        <p>✓ Wear protection when necessary</p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class='warn'>
        <strong>Important:</strong> If symptoms become severe, seek medical help immediately.
    </div>
    """,
    unsafe_allow_html=True,
)
