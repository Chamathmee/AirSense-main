"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Droplets,
  Gauge,
  HeartPulse,
  Home,
  Info,
  Leaf,
  LocateFixed,
  Menu,
  Wind,
  X,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Waves,
  BookOpen,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PageKey = "home" | "predict" | "air-quality" | "asthma" | "about";

type Prediction = {
  aqi: number;
  category: string;
  advice: string;
};

function getCategoryTone(category: string) {
  const value = category.toLowerCase();
  if (value.includes("good")) return "green";
  if (value.includes("moderate")) return "amber";
  if (value.includes("unhealthy")) return "red";
  return "cyan";
}

const trendData = [
  { time: "6 AM", aqi: 56 },
  { time: "9 AM", aqi: 62 },
  { time: "12 PM", aqi: 74 },
  { time: "3 PM", aqi: 78 },
  { time: "6 PM", aqi: 71 },
  { time: "9 PM", aqi: 63 },
  { time: "Now", aqi: 78 },
];

const navItems: { key: PageKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "predict", label: "Predict AQI", icon: Sparkles },
  { key: "air-quality", label: "Air Quality", icon: Wind },
  { key: "asthma", label: "Asthma Guide", icon: HeartPulse },
  { key: "about", label: "About", icon: Info },
];

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Leaf />
      </div>
      <div>
        <strong>AirSense</strong>
        <span>Healthier air, clearer days</span>
      </div>
    </div>
  );
}

function Sidebar({
  current,
  onNavigate,
}: {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-label">Workspace</div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item ${current === key ? "active" : ""}`}
            onClick={() => onNavigate(key)}
          >
            <Icon /> <span>{label}</span>
            {key === "home" && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <CircleHelp />
          <div>
            <strong>Need help?</strong>
            <span>Learn how AirSense works</span>
          </div>
          <ArrowRight />
        </div>
        <div className="sidebar-footer">
          <div className="status-dot" /> Data updated 2 min ago
        </div>
      </div>
    </aside>
  );
}

function Header({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
}) {
  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu />
      </button>
      <div>
        <div className="eyebrow">AIR QUALITY MONITORING</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="location-pill">
        <LocateFixed />
        <div>
          <span>Current location</span>
          <strong>Colombo, Sri Lanka</strong>
        </div>
        <ChevronDown />
      </div>
    </header>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>
          {value}
          <small>{unit}</small>
        </strong>
      </div>
      <span className="live-indicator">Live</span>
    </div>
  );
}

function AqiGauge({ aqi }: { aqi: number }) {
  const progress = Math.min(Math.max(aqi / 200, 0), 1);
  const angle = Math.PI * (1 - progress);
  const markerX = 90 + 72 * Math.cos(angle);
  const markerY = 92 - 72 * Math.sin(angle);
  return (
    <div className="gauge-wrap">
      <svg
        viewBox="0 0 180 110"
        className="gauge"
        aria-label={`AQI gauge showing ${aqi}`}
      >
        <path
          d="M 18 92 A 72 72 0 0 1 162 92"
          fill="none"
          stroke="rgba(255,255,255,.11)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d={`M 18 92 A 72 72 0 0 1 ${markerX} ${markerY}`}
          fill="none"
          stroke="#f3b84b"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx={markerX} cy={markerY} r="5" fill="#f9d37d" />
      </svg>
      <div className="gauge-value">
        <strong>{aqi}</strong>
        <span>AQI</span>
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AIR QUALITY TREND</span>
          <h2>Today&apos;s air quality</h2>
        </div>
        <div className="segmented">
          <button className="selected">Today</button>
          <button>7 Days</button>
          <button>30 Days</button>
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-dot" /> AQI index
        </span>
        <span>Updated every hour</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#48c9cf" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#48c9cf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71879c", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 120]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71879c", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "#122c43",
                border: "1px solid #254863",
                borderRadius: 10,
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#55cbd0"
              strokeWidth={3}
              fill="url(#aqiFill)"
              dot={{ r: 3, fill: "#55cbd0", strokeWidth: 2, stroke: "#10283d" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const [conditions, setConditions] = useState<{
    aqi: number;
    category: string;
    advice: string;
    pm25: number;
    pm10: number;
    temperature: number;
    humidity: number;
    wind_speed: number;
    updated_at: string;
  } | null>(null);
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  useEffect(() => {
    let active = true;
    const loadConditions = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8001/current-conditions",
        );
        if (!response.ok) throw new Error("Live conditions request failed");
        const data = await response.json();
        if (active) setConditions(data);
      } catch (error) {
        console.error("Live conditions failed:", error);
      }
    };
    loadConditions();
    const refresh = window.setInterval(loadConditions, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(refresh);
    };
  }, []);

  const aqi = conditions?.aqi ?? 78;
  const category = conditions?.category ?? "MODERATE";
  const categoryLabel = category
    .replace("UNHEALTHY FOR SENSITIVE GROUPS", "Sensitive groups")
    .replace("VERY UNHEALTHY / HAZARDOUS", "Very unhealthy");
  const categoryTone = category.toLowerCase().includes("good")
    ? "green"
    : category.toLowerCase().includes("moderate")
      ? "amber"
      : "red";
  const updatedAt = conditions
    ? new Date(conditions.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "demo data";

  return (
    <>
      <Header
        title={`${greeting}, there`}
        subtitle="Here's your air quality overview for today."
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <div className="hero-grid">
        <section className="aqi-card">
          <div className="card-top">
            <div>
              <span className="eyebrow light">CURRENT AIR QUALITY</span>
              <div className="status-line">
                <h2>{categoryLabel}</h2>
                <span className={`status-badge ${categoryTone}`}>
                  {categoryLabel}
                </span>
              </div>
              <p>{conditions?.advice ?? "Loading live conditions..."}</p>
            </div>
            <div className="sun-icon">
              <CloudSun />
            </div>
          </div>
          <div className="gauge-row">
            <AqiGauge aqi={aqi} />
            <div className="aqi-scale">
              <div>
                <span>Good</span>
                <strong>0–50</strong>
              </div>
              <div className={categoryTone === "amber" ? "active" : ""}>
                <span>Moderate</span>
                <strong>51–100</strong>
              </div>
              <div className={categoryTone === "red" ? "active" : ""}>
                <span>Unhealthy</span>
                <strong>101+</strong>
              </div>
            </div>
          </div>
          <div className="aqi-foot">
            <span>
              <span className="pulse" /> Live reading
            </span>
            <span>Updated {updatedAt}</span>
          </div>
        </section>
        <section className="assessment-card">
          <div className="card-top">
            <div>
              <span className="eyebrow light">AI HEALTH ASSESSMENT</span>
              <h2>{categoryLabel} risk</h2>
            </div>
            <div className="ai-badge">
              <BrainCircuit />
            </div>
          </div>
          <div className="assessment-body">
            <p>
              {conditions?.advice ??
                "The AI health assessment will appear when live conditions load."}
            </p>
            <div className="advisory">
              <ShieldCheck />
              <div>
                <strong>Asthma advisory</strong>
                <span>
                  {conditions?.advice ?? "Checking current air conditions."}
                </span>
              </div>
            </div>
          </div>
          <button className="text-button" onClick={() => onNavigate("asthma")}>
            View health guidance <ArrowRight />
          </button>
        </section>
      </div>
      <div className="section-heading stats-heading">
        <div>
          <span className="eyebrow">ENVIRONMENTAL CONDITIONS</span>
          <h2>Live conditions</h2>
        </div>
        <span className="updated">
          <span className="pulse" /> Sensors active
        </span>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={Waves}
          label="PM2.5"
          value={conditions ? conditions.pm25.toFixed(1) : "--"}
          unit="µg/m³"
          tone="cyan"
        />
        <StatCard
          icon={Wind}
          label="PM10"
          value={conditions ? conditions.pm10.toFixed(1) : "--"}
          unit="µg/m³"
          tone="blue"
        />
        <StatCard
          icon={Thermometer}
          label="Temperature"
          value={conditions ? conditions.temperature.toFixed(1) : "--"}
          unit="°C"
          tone="orange"
        />
        <StatCard
          icon={Droplets}
          label="Humidity"
          value={conditions ? conditions.humidity.toFixed(0) : "--"}
          unit="%"
          tone="purple"
        />
        <StatCard
          icon={Wind}
          label="Wind speed"
          value={conditions ? conditions.wind_speed.toFixed(1) : "--"}
          unit="km/h"
          tone="green"
        />
      </div>
      <TrendChart />
      <div className="quick-actions">
        <button onClick={() => onNavigate("air-quality")}>
          <Wind /> Check air quality <ArrowRight />
        </button>
        <button onClick={() => onNavigate("predict")}>
          <Sparkles /> Predict AQI <ArrowRight />
        </button>
        <button onClick={() => onNavigate("asthma")}>
          <HeartPulse /> Asthma guide <ArrowRight />
        </button>
      </div>
      <Disclaimer />
    </>
  );
}

function PredictPage({
  onNavigate,
  onPrediction,
}: {
  onNavigate: (page: PageKey) => void;
  onPrediction: (prediction: Prediction) => void;
}) {
  const [values, setValues] = useState({
    pm25: "24",
    pm10: "46",
    temperature: "30",
    humidity: "68",
    wind: "2.5",
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  const fields = [
    ["pm25", "PM2.5", "µg/m³"],
    ["pm10", "PM10", "µg/m³"],
    ["temperature", "Temperature", "°C"],
    ["humidity", "Humidity", "%"],
    ["wind", "Wind speed", "m/s"],
  ] as const;

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pm25: parseFloat(values.pm25) || 0,
          pm10: parseFloat(values.pm10) || 0,
          temperature: parseFloat(values.temperature) || 0,
          humidity: parseFloat(values.humidity) || 0,
          wind_speed: parseFloat(values.wind) || 0,
        }),
      });
      const data = await res.json();
      setPrediction(data);
      onPrediction(data);
    } catch (error) {
      console.error("Prediction failed:", error);
      alert(
        "Failed to connect to the prediction API. Ensure the FastAPI server is running on port 8001.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTone = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("good")) return "green";
    if (c.includes("moderate")) return "amber";
    if (c.includes("unhealthy")) return "red";
    return "cyan";
  };

  const getResultTitle = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("good")) return "Looking good";
    if (c.includes("moderate")) return "Use some caution";
    if (c.includes("unhealthy")) return "Take care outdoors";
    return "Air quality alert";
  };

  const getResultSummary = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("good")) {
      return "These conditions are expected to be comfortable for most people, including those with respiratory sensitivities.";
    }
    if (c.includes("moderate")) {
      return "Air quality is acceptable, but sensitive people should consider reducing prolonged or heavy outdoor activity.";
    }
    return "Air quality may affect health. Limit outdoor exposure and follow the asthma advisory below.";
  };

  return (
    <>
      <Header
        title="AI air quality prediction"
        subtitle="Enter environmental conditions to estimate what comes next."
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <div className="predict-layout">
        <section className="form-card">
          <div className="form-intro">
            <div className="ai-badge large">
              <Sparkles />
            </div>
            <div>
              <h2>Environmental inputs</h2>
              <p>
                Use the latest readings from your area for a more accurate
                estimate.
              </p>
            </div>
          </div>
          <div className="input-grid">
            {fields.map(([key, label, unit]) => (
              <label key={key}>
                <span>{label}</span>
                <div className="input-wrap">
                  <input
                    value={values[key as keyof typeof values]}
                    onChange={(event) =>
                      update(key as keyof typeof values, event.target.value)
                    }
                    inputMode="decimal"
                  />
                  <b>{unit}</b>
                </div>
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button
              className="primary-button"
              onClick={handlePredict}
              disabled={loading}
            >
              <Sparkles /> {loading ? "Predicting..." : "Predict air quality"}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setValues({
                  pm25: "",
                  pm10: "",
                  temperature: "",
                  humidity: "",
                  wind: "",
                });
                setPrediction(null);
              }}
            >
              <RotateCcw /> Reset
            </button>
          </div>
        </section>
        {prediction && (
          <section className={`result-card result-${getTone(prediction.category)}`}>
            <div className="result-head">
              <div>
                <span className="eyebrow light">PREDICTION RESULT</span>
                <h2>{getResultTitle(prediction.category)}</h2>
              </div>
              {getTone(prediction.category) === "green" ? <CheckCircle2 /> : <AlertTriangle />}
            </div>
            <div className="result-aqi">
              <strong>{prediction.aqi}</strong>
              <span>Estimated AQI</span>
            </div>
            <div className="result-tags">
              <span className={`status-badge ${getTone(prediction.category)}`}>
                {prediction.category}
              </span>
              <span className="risk-tag">
                <ShieldCheck /> AI Analyzed
              </span>
            </div>
            <p>{getResultSummary(prediction.category)}</p>
            <div className="result-advisory">
              <HeartPulse />
              <div>
                <strong>Asthma advisory</strong>
                <span>{prediction.advice}</span>
              </div>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("asthma")}
            >
              View asthma guide <ArrowRight />
            </button>
          </section>
        )}
      </div>
      <Disclaimer />
    </>
  );
}

function AirQualityPage() {
  const categories = [
    ["Good", "0–50", "Clean air with little or no risk.", "green"],
    [
      "Moderate",
      "51–100",
      "Acceptable, with care for sensitive groups.",
      "amber",
    ],
    [
      "Sensitive groups",
      "101–150",
      "May affect people with respiratory conditions.",
      "orange",
    ],
    ["Unhealthy", "151+", "Everyone may begin to experience effects.", "red"],
  ];
  const pollutants = [
    {
      icon: Waves,
      title: "PM2.5",
      text: "Fine particles that can enter deep into the lungs and bloodstream.",
    },
    {
      icon: Wind,
      title: "PM10",
      text: "Larger particles that can irritate the nose, throat, and respiratory system.",
    },
    {
      icon: Activity,
      title: "NO₂",
      text: "A gas commonly associated with traffic and industrial emissions.",
    },
  ];
  return (
    <>
      <Header
        title="Air quality information"
        subtitle="A clearer way to understand the air around you."
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <section className="info-intro">
        <div className="info-icon">
          <Gauge />
        </div>
        <div>
          <h2>What is AQI?</h2>
          <p>
            The Air Quality Index is a simple scale that communicates how clean
            or polluted the air is and what associated health effects may be of
            concern.
          </p>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE AQI SCALE</span>
          <h2>Know your number</h2>
        </div>
      </div>
      <div className="category-grid">
        {categories.map(([title, range, text, tone]) => (
          <div className={`category-card ${tone}`} key={title}>
            <span className="category-range">{range}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">COMMON POLLUTANTS</span>
          <h2>What&apos;s in the air?</h2>
        </div>
      </div>
      <div className="pollutant-grid">
        {pollutants.map(({ icon: Icon, title, text }) => (
          <div className="pollutant-card" key={title}>
            <div className="stat-icon cyan">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button className="inline-link">
              Learn more <ArrowRight />
            </button>
          </div>
        ))}
      </div>
      <section className="why-card">
        <div className="why-icon">
          <Leaf />
        </div>
        <div>
          <span className="eyebrow">WHY AIR QUALITY MATTERS</span>
          <h2>Small changes can make a meaningful difference.</h2>
          <p>
            Understanding daily air quality helps you plan outdoor time, protect
            sensitive family members, and build healthier routines.
          </p>
        </div>
      </section>
      <Disclaimer />
    </>
  );
}

function AsthmaPage({ prediction }: { prediction: Prediction | null }) {
  const category = prediction?.category ?? "No prediction yet";
  const advice = prediction?.advice ?? "Enter environmental readings in Predict AQI to receive a personalized advisory.";
  const riskText = prediction
    ? `Based on the predicted AQI of ${prediction.aqi}, current conditions are classified as ${category.toLowerCase()}.`
    : "Your personalized risk assessment will appear here after you run a prediction.";
  const activityText = prediction
    ? advice
    : "Check the AQI before going outside and use the prediction page for personalized guidance.";
  return (
    <>
      <Header
        title="Asthma health guide"
        subtitle="Understand how air pollution can affect breathing."
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <div className="guide-grid">
        <section className="guide-hero">
          <div className="lungs-art">
            <Wind />
            <HeartPulse />
          </div>
          <span className="eyebrow light">BREATHE WITH CONFIDENCE</span>
          <h2>{prediction ? `${category} air quality` : "Your breathing health matters."}</h2>
          <p>
            {riskText}
          </p>
        </section>
        <section className="guide-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 — UNDERSTANDING</span>
              <h2>How air pollution affects asthma</h2>
            </div>
          </div>
          <div className="symptom-grid">
            {[
              "Breathing difficulty",
              "Coughing",
              "Chest tightness",
              "Asthma attacks",
            ].map((item, index) => (
              <div className="symptom" key={item}>
                <span>0{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="recommendation-card">
        <div>
          <span className="eyebrow">02 — DAILY SAFETY</span>
          <h2>{prediction ? "Guidance for these conditions" : "Simple ways to stay prepared"}</h2>
        </div>
        <ul>
          {[
            prediction ? `Predicted AQI: ${prediction.aqi}` : "Check the AQI before going outside.",
            prediction ? activityText : "Avoid outdoor activities during poor air quality.",
            "Keep prescribed medication available.",
            "Follow your healthcare professional’s advice.",
          ].map((item) => (
            <li key={item}>
              <CheckCircle2 />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="warning-card">
        <AlertTriangle />
        <div>
          <span className="eyebrow">03 — WHEN TO SEEK HELP</span>
          <h2>
            {prediction && prediction.category.toLowerCase().includes("good")
              ? "Current conditions are favorable for outdoor activity."
              : "Severe breathing difficulty requires immediate medical attention."}
          </h2>
          <p>
            {prediction?.category.toLowerCase().includes("good")
              ? advice
              : "If symptoms feel sudden or severe, seek emergency care. Do not wait for an air quality update."}
          </p>
        </div>
      </section>
      <Disclaimer />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <Header
        title="About AirSense"
        subtitle="Technology with a healthier purpose."
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <section className="about-hero">
        <div className="about-brand">
          <div className="brand-mark large">
            <Leaf />
          </div>
          <div>
            <span className="eyebrow">OUR PURPOSE</span>
            <h2>Making air quality easier to understand.</h2>
          </div>
        </div>
        <p>
          AirSense is an AI-based air quality prediction and asthma health
          advisory system designed to help people monitor pollution, make
          informed decisions, and feel more confident about their environment.
        </p>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE AIRSENSE METHOD</span>
          <h2>How it works</h2>
        </div>
      </div>
      <div className="steps">
        {[
          ["01", "Environmental data", Wind],
          ["02", "Air quality analysis", Activity],
          ["03", "Estimated AQI", Gauge],
          ["04", "Health advisory", HeartPulse],
        ].map(([number, title, Icon]) => (
          <div className="step" key={number}>
            <span>{number}</span>
            <Icon />
            <strong>{title}</strong>
            {number !== "04" && <ArrowRight />}
          </div>
        ))}
      </div>
      <section className="tech-card">
        <div>
          <span className="eyebrow">BUILT FOR LEARNING & IMPACT</span>
          <h2>From university project to everyday utility.</h2>
          <p>
            AirSense brings together environmental data APIs, machine learning,
            and a Streamlit-ready interface to turn complex signals into useful
            guidance.
          </p>
        </div>
        <div className="tech-list">
          {[
            "Python",
            "Streamlit",
            "Machine Learning / AI",
            "Environmental data APIs",
          ].map((item) => (
            <span key={item}>
              <CheckCircle2 />
              {item}
            </span>
          ))}
        </div>
      </section>
      <Disclaimer />
    </>
  );
}

function Disclaimer() {
  return (
    <footer className="disclaimer">
      <Info /> AirSense provides estimated information and general health
      guidance; it does not replace professional medical advice.
    </footer>
  );
}

export default function Page() {
  const [page, setPage] = useState<PageKey>("home");
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const openMenu = () => setMenuOpen(true);
    window.addEventListener("airsense:menu", openMenu);
    return () => window.removeEventListener("airsense:menu", openMenu);
  }, []);
  const content = useMemo(
    () =>
      ({
        home: <HomePage onNavigate={setPage} />,
        predict: <PredictPage onNavigate={setPage} onPrediction={setLatestPrediction} />,
        "air-quality": <AirQualityPage />,
        asthma: <AsthmaPage prediction={latestPrediction} />,
        about: <AboutPage />,
      })[page],
    [page, latestPrediction],
  );
  const appTone = latestPrediction ? getCategoryTone(latestPrediction.category) : "cyan";
  return (
    <div className={`app-shell state-${appTone}`}>
      <Sidebar
        current={page}
        onNavigate={(next) => {
          setPage(next);
          setMenuOpen(false);
        }}
      />
      <div
        className={`mobile-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <div className={`mobile-sidebar ${menuOpen ? "open" : ""}`}>
        <button
          className="close-menu"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <Sidebar
          current={page}
          onNavigate={(next) => {
            setPage(next);
            setMenuOpen(false);
          }}
        />
      </div>
      <main className="main-content">{content}</main>
    </div>
  );
}
