import streamlit as st

def load_custom_css():
    css = """
    <style>
    /* Global Reset & Typography */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    
    html, body, [class*="css"]  {
        font-family: 'Outfit', sans-serif !important;
    }

    /* Background and Layout - Bright & Airy Mesh Gradient */
    .stApp {
        background: linear-gradient(120deg, #f0f9ff 0%, #cffafe 50%, #e0f2fe 100%);
        background-attachment: fixed;
        color: #0f172a;
    }
    
    .block-container {
        padding-top: 2rem;
    }

    /* Sidebar - Light Frosted Glass */
    section[data-testid="stSidebar"] {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.6);
    }
    section[data-testid="stSidebar"] * {
        color: #1e293b;
    }

    /* Cards - Premium White Glassmorphism */
    .card, .panel {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 1);
        border-radius: 24px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(14, 165, 233, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        margin-bottom: 1.5rem;
    }
    .card:hover, .panel:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 50px rgba(14, 165, 233, 0.15);
    }

    /* Typography inside cards */
    .card h1, .card h2, .card h3, .panel h1, .panel h2, .panel h3 {
        color: #0369a1;
        margin-top: 0;
        font-weight: 800;
    }
    .card p, .panel p {
        color: #475569;
        line-height: 1.7;
        font-size: 1.05rem;
    }
    
    /* Result Box / Alerts */
    .result-box, .warn {
        background: rgba(14, 165, 233, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(56, 189, 248, 0.5);
        border-radius: 20px;
        padding: 1.8rem;
        margin-top: 1.5rem;
        text-align: center;
        box-shadow: 0 8px 32px rgba(14, 165, 233, 0.1);
    }
    .warn {
        background: rgba(254, 226, 226, 0.6);
        border-color: rgba(248, 113, 113, 0.6);
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
        text-align: left;
    }

    /* Titles and Subtitles */
    .title {
        font-size: 4.5rem;
        font-weight: 800;
        text-align: center;
        background: linear-gradient(90deg, #0284c7, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(255,255,255,0.5);
    }
    .subtitle {
        text-align: center;
        font-size: 1.4rem;
        color: #0284c7;
        font-weight: 600;
        margin-bottom: 2rem;
    }
    .small-title {
        color: #0369a1;
        letter-spacing: 3px;
        font-size: 0.9rem;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }
    
    /* Metrics */
    .aqi {
        font-size: 5.5rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.1;
        margin: 10px 0;
    }
    .metric {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0284c7;
    }
    
    /* Buttons */
    .stButton button {
        background: linear-gradient(135deg, #0ea5e9, #3b82f6);
        color: white;
        border: none;
        border-radius: 999px;
        height: 55px;
        padding: 0 2.5rem;
        font-size: 1.15rem;
        font-weight: 700;
        box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
        transition: all 0.3s ease;
    }
    .stButton button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 30px rgba(14, 165, 233, 0.5);
        color: white;
    }

    /* Badges */
    .badge {
        display: inline-block;
        padding: 0.4rem 1.2rem;
        background: rgba(14, 165, 233, 0.15);
        border: 1px solid rgba(14, 165, 233, 0.3);
        border-radius: 999px;
        color: #0369a1;
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 1rem;
    }

    /* Globe Animation */
    .globe {
        width: 180px;
        height: 180px;
        margin: 40px auto;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #e0f2fe, #38bdf8, #0369a1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 75px;
        box-shadow: 0 15px 50px rgba(14, 165, 233, 0.4), inset -15px -15px 40px rgba(0,0,0,0.1);
        animation: float 4s ease-in-out infinite, spin 20s linear infinite;
    }
    
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
    }
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)
