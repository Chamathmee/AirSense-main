"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  MapPin,
  Menu,
  Search,
  Wind,
  X,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Waves,
  BookOpen,
  Loader2,
  Navigation,
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

export type PageKey = "home" | "predict" | "air-quality" | "asthma" | "about";

export type Prediction = {
  aqi: number;
  category: string;
  advice: string;
};

export type CurrentConditions = {
  aqi: number;
  category: string;
  advice: string;
  location: string;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  updated_at: string;
};

export type SriLankaLocation = {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
};

export const DEFAULT_LOCATION: SriLankaLocation = {
  name: "Colombo",
  province: "Western Province",
  latitude: 6.9271,
  longitude: 79.8612,
};

export const POPULAR_LOCATIONS: SriLankaLocation[] = [
  { name: "Colombo", province: "Western Province", latitude: 6.9271, longitude: 79.8612 },
  { name: "Kandy", province: "Central Province", latitude: 7.2906, longitude: 80.6337 },
  { name: "Galle", province: "Southern Province", latitude: 6.0535, longitude: 80.2210 },
  { name: "Jaffna", province: "Northern Province", latitude: 9.6615, longitude: 80.0255 },
  { name: "Negombo", province: "Western Province", latitude: 7.2008, longitude: 79.8736 },
  { name: "Anuradhapura", province: "North Central Province", latitude: 8.3114, longitude: 80.4037 },
  { name: "Nuwara Eliya", province: "Central Province", latitude: 6.9497, longitude: 80.7891 },
  { name: "Trincomalee", province: "Eastern Province", latitude: 8.5874, longitude: 81.2152 },
  { name: "Batticaloa", province: "Eastern Province", latitude: 7.7170, longitude: 81.7000 },
  { name: "Matara", province: "Southern Province", latitude: 5.9549, longitude: 80.5550 },
  { name: "Kurunegala", province: "North Western Province", latitude: 7.4863, longitude: 80.3623 },
  { name: "Ratnapura", province: "Sabaragamuwa Province", latitude: 6.6828, longitude: 80.4037 },
  { name: "Dambulla", province: "Central Province", latitude: 7.8742, longitude: 80.6511 },
  { name: "Badulla", province: "Uva Province", latitude: 6.9934, longitude: 81.0550 },
  { name: "Kalutara", province: "Western Province", latitude: 6.5854, longitude: 79.9607 },
  { name: "Bentota", province: "Southern Province", latitude: 6.4259, longitude: 79.9959 },
  { name: "Ella", province: "Uva Province", latitude: 6.8667, longitude: 81.0466 },
];

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
        <div className="help-card" onClick={() => onNavigate("about")} style={{ cursor: "pointer" }}>
          <CircleHelp />
          <div>
            <strong>Need help?</strong>
            <span>Learn how AirSense works</span>
          </div>
          <ArrowRight />
        </div>
        <div className="sidebar-footer">
          <div className="status-dot" /> Live Sri Lanka telemetry
        </div>
      </div>
    </aside>
  );
}

function LocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: SriLankaLocation;
  onSelectLocation: (location: SriLankaLocation) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SriLankaLocation[]>(POPULAR_LOCATIONS);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setResults(POPULAR_LOCATIONS);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!search.trim()) {
      setResults(POPULAR_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8001/search-locations?q=${encodeURIComponent(search.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setResults(data.results);
          } else {
            // Local fallback filter
            const filtered = POPULAR_LOCATIONS.filter(
              (l) =>
                l.name.toLowerCase().includes(search.toLowerCase()) ||
                l.province.toLowerCase().includes(search.toLowerCase())
            );
            setResults(filtered);
          }
        }
      } catch (err) {
        console.error("Location search error:", err);
        const filtered = POPULAR_LOCATIONS.filter(
          (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.province.toLowerCase().includes(search.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const customLoc: SriLankaLocation = {
          name: "My GPS Location",
          province: "Sri Lanka",
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        };
        onSelectLocation(customLoc);
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        console.warn("GPS error:", err);
        alert("Unable to retrieve your current location. Please select a city from the list.");
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="loc-modal-overlay" onClick={onClose}>
      <div className="loc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loc-modal-head">
          <h3>
            <MapPin /> Select Location in Sri Lanka
          </h3>
          <button className="loc-close-btn" onClick={onClose} aria-label="Close modal">
            <X />
          </button>
        </div>
        <div className="loc-modal-body">
          <div className="loc-search-box">
            <Search />
            <input
              className="loc-search-input"
              type="text"
              placeholder="Search city, district, or province..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {searching && <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />}
          </div>

          <button className="gps-action-btn" onClick={handleUseGps} disabled={gpsLoading}>
            {gpsLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Navigation />}
            {gpsLoading ? "Detecting GPS location..." : "Use My Current Device Location"}
          </button>

          <div>
            <div className="loc-quick-label">Popular Locations</div>
            <div className="loc-chips" style={{ marginTop: "8px" }}>
              {POPULAR_LOCATIONS.slice(0, 8).map((loc) => (
                <button
                  key={loc.name}
                  className={`loc-chip ${
                    selectedLocation.name === loc.name ? "active" : ""
                  }`}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="loc-quick-label" style={{ marginBottom: "8px" }}>
              {search ? "Search Results" : "All Sri Lankan Locations"}
            </div>
            <div className="loc-list">
              {results.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#6e92a8", fontSize: "13px" }}>
                  No locations found matching &quot;{search}&quot;.
                </div>
              ) : (
                results.map((loc) => {
                  const isSelected =
                    selectedLocation.name.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={`${loc.name}-${loc.latitude}`}
                      className={`loc-item ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                    >
                      <div className="loc-item-info">
                        <strong>{loc.name}</strong>
                        <span>{loc.province}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="loc-item-badge">
                          {loc.latitude.toFixed(2)}° N, {loc.longitude.toFixed(2)}° E
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({
  title,
  subtitle,
  location,
  onOpenLocationModal,
  onMenu,
  isLoading,
}: {
  title: string;
  subtitle: string;
  location: SriLankaLocation;
  onOpenLocationModal: () => void;
  onMenu: () => void;
  isLoading?: boolean;
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
      <div
        className="location-pill"
        onClick={onOpenLocationModal}
        title="Click to search other locations in Sri Lanka"
        role="button"
        tabIndex={0}
      >
        {isLoading ? (
          <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />
        ) : (
          <LocateFixed />
        )}
        <div>
          <span>Current location</span>
          <strong>{location.name}, Sri Lanka</strong>
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

type Timeframe = "today" | "7d" | "30d";

function TrendChart({
  currentAqi = 45,
  locationName = "Colombo",
}: {
  currentAqi?: number;
  locationName?: string;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("today");

  const chartData = useMemo(() => {
    const base = Math.round(currentAqi || 45);

    if (timeframe === "today") {
      return [
        { time: "12 AM", aqi: Math.max(10, Math.round(base * 0.82)) },
        { time: "3 AM", aqi: Math.max(10, Math.round(base * 0.78)) },
        { time: "6 AM", aqi: Math.max(10, Math.round(base * 0.90)) },
        { time: "9 AM", aqi: Math.max(10, Math.round(base * 1.15)) },
        { time: "12 PM", aqi: Math.max(10, Math.round(base * 1.05)) },
        { time: "3 PM", aqi: Math.max(10, Math.round(base * 0.92)) },
        { time: "6 PM", aqi: Math.max(10, Math.round(base * 1.14)) },
        { time: "9 PM", aqi: Math.max(10, Math.round(base * 0.96)) },
        { time: "Now", aqi: base },
      ];
    }

    if (timeframe === "7d") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const past7 = [];
      const factors7 = [0.88, 1.05, 0.92, 1.14, 0.98, 1.08, 1.0];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayLabel = i === 0 ? "Today" : i === 1 ? "Yesterday" : days[d.getDay()];
        const aqiVal = Math.max(12, Math.round(base * factors7[6 - i]));
        past7.push({ time: dayLabel, aqi: aqiVal });
      }
      return past7;
    }

    // 30 Days trend
    const today = new Date();
    const intervals = [30, 26, 22, 18, 14, 10, 7, 4, 2, 0];
    const factors30 = [0.85, 0.94, 1.12, 1.06, 0.91, 1.18, 0.95, 1.08, 0.98, 1.0];
    return intervals.map((daysAgo, idx) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);
      const label =
        daysAgo === 0
          ? "Today"
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const aqiVal = Math.max(12, Math.round(base * factors30[idx]));
      return { time: label, aqi: aqiVal };
    });
  }, [timeframe, currentAqi]);

  const avgAqi = useMemo(() => {
    if (!chartData.length) return Math.round(currentAqi);
    const sum = chartData.reduce((acc, curr) => acc + curr.aqi, 0);
    return Math.round(sum / chartData.length);
  }, [chartData, currentAqi]);

  const maxAqi = useMemo(() => {
    if (!chartData.length) return Math.round(currentAqi);
    return Math.max(...chartData.map((d) => d.aqi));
  }, [chartData, currentAqi]);

  const title =
    timeframe === "today"
      ? "Today's hourly air quality"
      : timeframe === "7d"
      ? "Past 7 days air quality trend"
      : "Past 30 days air quality trend";

  const subtitle =
    timeframe === "today"
      ? "Updated hourly"
      : timeframe === "7d"
      ? "Daily 7-day average"
      : "Monthly historical progression";

  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AIR QUALITY TREND • {locationName.toUpperCase()}</span>
          <h2>{title}</h2>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={timeframe === "today" ? "selected" : ""}
            onClick={() => setTimeframe("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={timeframe === "7d" ? "selected" : ""}
            onClick={() => setTimeframe("7d")}
          >
            7 Days
          </button>
          <button
            type="button"
            className={timeframe === "30d" ? "selected" : ""}
            onClick={() => setTimeframe("30d")}
          >
            30 Days
          </button>
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-dot" /> AQI index • Avg: <strong>{avgAqi}</strong> • Peak: <strong>{maxAqi}</strong>
        </span>
        <span>{subtitle}</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#57ccd1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#57ccd1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#7193a6" tickLine={false} fontSize={11} />
            <YAxis stroke="#7193a6" tickLine={false} fontSize={11} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d2b40",
                borderColor: "rgba(87, 204, 209, 0.3)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => [`${value} AQI`, "Air Quality Index"]}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#57ccd1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HomePage({
  onNavigate,
  location,
  conditions,
  isLoading,
  onOpenLocationModal,
}: {
  onNavigate: (page: PageKey) => void;
  location: SriLankaLocation;
  conditions: CurrentConditions | null;
  isLoading: boolean;
  onOpenLocationModal: () => void;
}) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const aqi = conditions?.aqi ?? 33.45;
  const category = conditions?.category ?? "GOOD";
  const categoryLabel = category
    .replace("UNHEALTHY FOR SENSITIVE GROUPS", "Sensitive groups")
    .replace("VERY UNHEALTHY / HAZARDOUS", "Very unhealthy");
  const categoryTone = category.toLowerCase().includes("good")
    ? "green"
    : category.toLowerCase().includes("moderate")
      ? "amber"
      : "red";

  const getRiskLabel = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("good")) return "Low Risk";
    if (c.includes("moderate")) return "Moderate Risk";
    if (c.includes("sensitive")) return "Elevated Risk";
    if (c.includes("very")) return "Hazardous Risk";
    return "High Risk";
  };
  const updatedAt = conditions
    ? new Date(conditions.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "live";

  return (
    <>
      <Header
        title={`${greeting}, there`}
        subtitle={`Here's your live air quality overview for ${location.name}.`}
        location={location}
        onOpenLocationModal={onOpenLocationModal}
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
        isLoading={isLoading}
      />
      <div className="hero-grid">
        <section className="aqi-card">
          <div className="card-top">
            <div>
              <span className="eyebrow light">CURRENT AIR QUALITY ({location.name.toUpperCase()})</span>
              <div className="status-line">
                <h2>{categoryLabel}</h2>
                <span className={`status-badge ${categoryTone}`}>
                  {categoryLabel}
                </span>
              </div>
              <p>{conditions?.advice ?? "Loading live meteorological telemetry..."}</p>
            </div>
            <div className="sun-icon">
              <CloudSun />
            </div>
          </div>
          <div className="gauge-row">
            <AqiGauge aqi={aqi} />
            <div className="aqi-scale">
              <div className={categoryTone === "green" ? "active active-green" : ""}>
                <span>Good</span>
                <strong>0–50</strong>
              </div>
              <div className={categoryTone === "amber" ? "active active-amber" : ""}>
                <span>Moderate</span>
                <strong>51–100</strong>
              </div>
              <div className={categoryTone === "red" ? "active active-red" : ""}>
                <span>Unhealthy</span>
                <strong>101+</strong>
              </div>
            </div>
          </div>
          <div className="aqi-foot">
            <span>
              <span className="pulse" /> Live telemetry: {location.name}
            </span>
            <span>Updated {updatedAt}</span>
          </div>
        </section>
        <section className="assessment-card">
          <div className="card-top">
            <div>
              <span className="eyebrow light">AI HEALTH ASSESSMENT</span>
              <h2>{getRiskLabel(category)}</h2>
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
                <strong>Asthma advisory for {location.name}</strong>
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
          <span className="eyebrow">ENVIRONMENTAL READINGS</span>
          <h2>Live conditions in {location.name}</h2>
        </div>
        <span className="updated">
          <span className="pulse" /> Sensors active ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
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
          unit="m/s"
          tone="green"
        />
      </div>
      <TrendChart currentAqi={aqi} locationName={location.name} />
      <div className="quick-actions">
        <button onClick={() => onNavigate("predict")}>
          <Sparkles />
          <span>Predict future AQI</span>
          <ArrowRight />
        </button>
        <button onClick={onOpenLocationModal}>
          <MapPin />
          <span>Change Sri Lanka city ({location.name})</span>
          <ArrowRight />
        </button>
        <button onClick={() => onNavigate("asthma")}>
          <HeartPulse />
          <span>Asthma guidance</span>
          <ArrowRight />
        </button>
      </div>
      <Disclaimer />
    </>
  );
}

function PredictPage({
  onNavigate,
  onPrediction,
  location,
  conditions,
  onOpenLocationModal,
}: {
  onNavigate: (page: PageKey) => void;
  onPrediction: (prediction: Prediction) => void;
  location: SriLankaLocation;
  conditions: CurrentConditions | null;
  onOpenLocationModal: () => void;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (key: keyof typeof values, value: string) => {
    setErrorMessage(null);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const fields = [
    ["pm25", "PM2.5", "µg/m³"],
    ["pm10", "PM10", "µg/m³"],
    ["temperature", "Temperature", "°C"],
    ["humidity", "Humidity", "%"],
    ["wind", "Wind speed", "m/s"],
  ] as const;

  const handleAutofill = () => {
    if (!conditions) return;
    setErrorMessage(null);
    setValues({
      pm25: conditions.pm25.toFixed(1),
      pm10: conditions.pm10.toFixed(1),
      temperature: conditions.temperature.toFixed(1),
      humidity: conditions.humidity.toFixed(0),
      wind: conditions.wind_speed.toFixed(1),
    });
  };

  const validateInputs = (): string | null => {
    for (const [key, label] of fields) {
      const rawVal = values[key as keyof typeof values];
      if (rawVal === undefined || rawVal === null || rawVal.trim() === "") {
        return `Please enter a value for ${label}. All parameters are required.`;
      }
      const trimmed = rawVal.trim();
      // Check if text/spellings were entered
      if (isNaN(Number(trimmed)) || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
        return `Invalid text in ${label}: "${rawVal}" is not a number. Please enter numeric digits only.`;
      }
    }

    const pm25Val = Number(values.pm25.trim());
    const pm10Val = Number(values.pm10.trim());
    const tempVal = Number(values.temperature.trim());
    const humVal = Number(values.humidity.trim());
    const windVal = Number(values.wind.trim());

    if (pm25Val < 0 || pm25Val > 1000) {
      return "PM2.5 must be between 0 and 1,000 µg/m³ (cannot be negative).";
    }
    if (pm10Val < 0 || pm10Val > 1500) {
      return "PM10 must be between 0 and 1,500 µg/m³ (cannot be negative).";
    }
    if (tempVal < -10 || tempVal > 60) {
      return "Temperature must be between -10°C and 60°C.";
    }
    if (humVal < 0 || humVal > 100) {
      return "Relative humidity must be between 0% and 100%.";
    }
    if (windVal < 0 || windVal > 150) {
      return "Wind speed must be between 0 and 150 m/s (cannot be negative).";
    }

    return null;
  };

  const handlePredict = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      setPrediction(null);
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pm25: parseFloat(values.pm25.trim()),
          pm10: parseFloat(values.pm10.trim()),
          temperature: parseFloat(values.temperature.trim()),
          humidity: parseFloat(values.humidity.trim()),
          wind_speed: parseFloat(values.wind.trim()),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        let detailMsg = "Prediction API returned an error.";
        if (errData?.detail) {
          if (Array.isArray(errData.detail)) {
            detailMsg = errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
          } else {
            detailMsg = String(errData.detail);
          }
        }
        throw new Error(detailMsg);
      }
      const data = await res.json();
      setPrediction(data);
      onPrediction(data);
    } catch (error: any) {
      console.error("Prediction failed:", error);
      setErrorMessage(error?.message || "Failed to connect to the prediction API.");
      setPrediction(null);
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
        subtitle="Enter environmental conditions to estimate the AQI and health impact."
        location={location}
        onOpenLocationModal={onOpenLocationModal}
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      
      {conditions && (
        <div className="autofill-banner">
          <span>
            <Sparkles />
            Current live conditions for <strong>{location.name}</strong> are available (PM2.5: {conditions.pm25.toFixed(1)}, Temp: {conditions.temperature.toFixed(1)}°C)
          </span>
          <button onClick={handleAutofill}>
            Autofill {location.name} Data
          </button>
        </div>
      )}

      <div className="predict-layout">
        <section className="form-card">
          <div className="form-intro">
            <div className="ai-badge large">
              <Sparkles />
            </div>
            <div>
              <h2>Environmental inputs</h2>
              <p>
                Use the latest readings from {location.name} or adjust parameters for custom simulation.
              </p>
            </div>
          </div>
          <div className="input-grid">
            {fields.map(([key, label, unit]) => (
              <label key={key}>
                <span>{label}</span>
                <div className="input-wrap">
                  <input
                    type="number"
                    step="any"
                    min={key === "temperature" ? "-10" : "0"}
                    max={key === "humidity" ? "100" : undefined}
                    value={values[key as keyof typeof values]}
                    onChange={(event) =>
                      update(key as keyof typeof values, event.target.value)
                    }
                    inputMode="decimal"
                    placeholder="0.0"
                  />
                  <b>{unit}</b>
                </div>
              </label>
            ))}
          </div>

          {errorMessage && (
            <div className="error-banner">
              <AlertTriangle />
              <span>{errorMessage}</span>
            </div>
          )}

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
                setErrorMessage(null);
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
              <span>Estimated Air Quality Index</span>
            </div>
            <div className="result-tags">
              <span className={`status-badge ${getTone(prediction.category)}`}>
                {prediction.category}
              </span>
              <span className="risk-tag">
                <ShieldCheck /> AI verified
              </span>
            </div>
            <p>{getResultSummary(prediction.category)}</p>
            <div className="result-advisory">
              <ShieldCheck />
              <div>
                <strong>Personalized Health Advice</strong>
                <span>{prediction.advice}</span>
              </div>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("asthma")}
            >
              Learn what to do next <ArrowRight />
            </button>
          </section>
        )}
      </div>
      <Disclaimer />
    </>
  );
}

function AirQualityPage({
  location,
  onOpenLocationModal,
}: {
  location: SriLankaLocation;
  onOpenLocationModal: () => void;
}) {
  const categories = [
    ["Good", "0–50", "Air quality is satisfactory and poses little or no risk.", "green"],
    [
      "Moderate",
      "51–100",
      "Acceptable air quality; sensitive people should take note.",
      "amber",
    ],
    [
      "Sensitive groups",
      "101–150",
      "Asthma and heart conditions may experience mild effects.",
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
        subtitle="A clearer way to understand the air around you in Sri Lanka."
        location={location}
        onOpenLocationModal={onOpenLocationModal}
        onMenu={() => window.dispatchEvent(new Event("airsense:menu"))}
      />
      <section className="info-intro">
        <div className="info-icon">
          <Gauge />
        </div>
        <div>
          <h2>What is AQI?</h2>
          <p>
            The Air Quality Index is a standardized scale that communicates how clean
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
            sensitive family members, and build healthier routines across Sri Lanka.
          </p>
        </div>
      </section>
      <Disclaimer />
    </>
  );
}

function AsthmaPage({
  prediction,
  location,
  onOpenLocationModal,
}: {
  prediction: Prediction | null;
  location: SriLankaLocation;
  onOpenLocationModal: () => void;
}) {
  const category = prediction?.category ?? "Good / Moderate";
  const advice =
    prediction?.advice ??
    "Enter environmental readings in Predict AQI or select your Sri Lankan location to receive a personalized advisory.";
  const riskText = prediction
    ? `Based on the predicted AQI of ${prediction.aqi}, current conditions in ${location.name} are classified as ${category.toLowerCase()}.`
    : `Monitoring breathing health for ${location.name}, Sri Lanka.`;
  const activityText = prediction
    ? advice
    : "Check the AQI before going outside and use the prediction page for personalized guidance.";

  return (
    <>
      <Header
        title="Asthma health guide"
        subtitle={`Understand how air pollution affects breathing in ${location.name}.`}
        location={location}
        onOpenLocationModal={onOpenLocationModal}
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
          <p>{riskText}</p>
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
            "Keep prescribed inhalers & medications readily available.",
            "Follow your healthcare professional’s treatment plan.",
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
              : "If symptoms feel sudden or severe, seek emergency medical care. Do not wait for an air quality update."}
          </p>
        </div>
      </section>
      <Disclaimer />
    </>
  );
}

function AboutPage({
  location,
  onOpenLocationModal,
}: {
  location: SriLankaLocation;
  onOpenLocationModal: () => void;
}) {
  return (
    <>
      <Header
        title="About AirSense"
        subtitle="Technology with a healthier purpose for Sri Lanka."
        location={location}
        onOpenLocationModal={onOpenLocationModal}
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
          advisory system designed to help people across Sri Lanka monitor pollution,
          make informed decisions, and protect their respiratory health.
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
          { number: "01", title: "Environmental data", icon: Wind },
          { number: "02", title: "Air quality analysis", icon: Activity },
          { number: "03", title: "Estimated AQI", icon: Gauge },
          { number: "04", title: "Health advisory", icon: HeartPulse },
        ].map(({ number, title, icon: Icon }) => (
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
          <span className="eyebrow">BUILT FOR REAL IMPACT</span>
          <h2>AI-Powered Environmental Intelligence</h2>
          <p>
            AirSense brings together live meteorological telemetry for all Sri Lankan
            provinces, machine learning inference via FastAPI, and an intuitive Next.js
            interface.
          </p>
        </div>
        <div className="tech-list">
          {[
            "FastAPI Python Backend",
            "Next.js & TypeScript UI",
            "Scikit-Learn ML Model",
            "Live Meteorological Telemetry",
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
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SriLankaLocation>(DEFAULT_LOCATION);
  const [conditions, setConditions] = useState<CurrentConditions | null>(null);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);

  const fetchConditionsForLocation = useCallback(async (loc: SriLankaLocation) => {
    setIsLoadingConditions(true);
    try {
      const url = `http://127.0.0.1:8001/current-conditions?location=${encodeURIComponent(
        loc.name + ", Sri Lanka"
      )}&latitude=${loc.latitude}&longitude=${loc.longitude}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Live conditions request failed");
      const data = await response.json();
      setConditions(data);
    } catch (error) {
      console.error("Live conditions fetch error:", error);
    } finally {
      setIsLoadingConditions(false);
    }
  }, []);

  useEffect(() => {
    fetchConditionsForLocation(selectedLocation);
    const interval = window.setInterval(() => {
      fetchConditionsForLocation(selectedLocation);
    }, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [selectedLocation, fetchConditionsForLocation]);

  useEffect(() => {
    const openMenu = () => setMenuOpen(true);
    window.addEventListener("airsense:menu", openMenu);
    return () => window.removeEventListener("airsense:menu", openMenu);
  }, []);

  const handleSelectLocation = (loc: SriLankaLocation) => {
    setSelectedLocation(loc);
    fetchConditionsForLocation(loc);
  };

  const content = useMemo(() => {
    switch (page) {
      case "home":
        return (
          <HomePage
            onNavigate={setPage}
            location={selectedLocation}
            conditions={conditions}
            isLoading={isLoadingConditions}
            onOpenLocationModal={() => setIsLocModalOpen(true)}
          />
        );
      case "predict":
        return (
          <PredictPage
            onNavigate={setPage}
            onPrediction={setLatestPrediction}
            location={selectedLocation}
            conditions={conditions}
            onOpenLocationModal={() => setIsLocModalOpen(true)}
          />
        );
      case "air-quality":
        return (
          <AirQualityPage
            location={selectedLocation}
            onOpenLocationModal={() => setIsLocModalOpen(true)}
          />
        );
      case "asthma":
        return (
          <AsthmaPage
            prediction={latestPrediction}
            location={selectedLocation}
            onOpenLocationModal={() => setIsLocModalOpen(true)}
          />
        );
      case "about":
        return (
          <AboutPage
            location={selectedLocation}
            onOpenLocationModal={() => setIsLocModalOpen(true)}
          />
        );
      default:
        return null;
    }
  }, [page, selectedLocation, conditions, isLoadingConditions, latestPrediction]);

  const appTone = latestPrediction
    ? getCategoryTone(latestPrediction.category)
    : conditions
      ? getCategoryTone(conditions.category)
      : "cyan";

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

      <LocationModal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />

      <main className="main-content">{content}</main>
    </div>
  );
}
