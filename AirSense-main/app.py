import streamlit as st
import base64

st.set_page_config(
    page_title="AirSense",
    page_icon="🌿",
    layout="wide"
)

from ui_utils import load_custom_css

load_custom_css()

# ---------- SIDEBAR ----------

with st.sidebar:
    st.markdown(
        """
        <div style="text-align:center; padding: 1rem 0 0.5rem;">
            <h1 style="color:#38bdf8; margin:0; font-size:2.1rem;">🌿 AirSense</h1>
            <p style="color:#dbeafe; margin:0.5rem 0 0; line-height:1.4;">Cleaner Air<br>Healthier Tomorrow</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
    st.page_link("app.py", label="🏠 Home", icon="🏠", use_container_width=True)
    st.page_link("pages/1_Predict_AQI.py", label="🤖 Predict AQI", icon="🤖", use_container_width=True)
    st.page_link("pages/2_Air_Quality.py", label="🌍 Air Quality Info", icon="🌍", use_container_width=True)
    st.page_link("pages/3_Asthma_Guide.py", label="🫁 Asthma Guide", icon="🫁", use_container_width=True)
    st.page_link("pages/4_About.py", label="ℹ️ About", icon="ℹ️", use_container_width=True)

# ---------- HEADER ----------

st.markdown(

"""

<p style="
text-align:center;
color:#38bdf8;
letter-spacing:4px;
">

AIR QUALITY INTELLIGENCE

</p>

<div class="title">

🌿 AirSense

</div>

<div class="subtitle">

AI-Based Air Quality Prediction
and Asthma Health Advisory System

</div>

<br>

""",

unsafe_allow_html=True

)

button = st.button(
"🌍 Check Air Quality"
)

st.write("")

# ---------- MAIN DASHBOARD ----------

left,right = st.columns(
[1,1],
gap="large"
)

with left:

    st.markdown(

    """

<div class="card">

<div class="small-title">

AIR QUALITY INDEX

</div>

<div class="aqi">

78

</div>

<h3 style="color:#4ade80">

● Moderate

</h3>

<p>

Air quality is acceptable.
Sensitive groups should take care.

</p>

</div>

""",

unsafe_allow_html=True

)

with right:

    st.markdown(
    """

    <div class="card">

    <h2 style="
    color:#38bdf8;
    text-align:center;
    ">

    🌍 Global Air Status

    </h2>

    <div class="globe">

        🌎

    </div>

    <p style="
    text-align:center;
    color:#cbd5e1;
    ">

    Global environmental monitoring

    </p>

    </div>

    """,

    unsafe_allow_html=True

    )

# ---------- STATISTICS ----------

st.markdown(

"""

<h1 style="margin-top:50px">

📊 Live Air Statistics

</h1>

""",

unsafe_allow_html=True

)

c1,c2,c3,c4 = st.columns(4)

data=[

("💨","PM2.5","24 µg/m³"),

("🌫️","PM10","46 µg/m³"),

("🌡️","Temperature","30 °C"),

("💧","Humidity","68 %")

]

for col,item in zip(
[c1,c2,c3,c4],
data
):

    with col:

        st.markdown(

f"""
<div class="card">

<h1>

{item[0]}

</h1>

<h3>

{item[1]}

</h3>

<div class="metric">

{item[2]}

</div>

</div>

""",

unsafe_allow_html=True

        )

# ---------- LOWER SECTION ----------

a,b = st.columns(2)

with a:

    st.markdown(

"""

<div class="card">

<h2>

🫁 Asthma Awareness

</h2>

<p>

Air pollution can affect asthma patients.
AirSense provides health guidance based
on predicted air conditions.

</p>

</div>

""",

unsafe_allow_html=True

)

with b:

    st.markdown(

"""

<div class="card">

<h2>

🌱 Cleaner Future

</h2>

<p>

Understanding air quality helps people
make safer daily decisions.

</p>

</div>

""",

unsafe_allow_html=True

)
