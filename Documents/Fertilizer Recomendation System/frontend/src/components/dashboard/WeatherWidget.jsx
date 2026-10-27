import React from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Info } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  const {
    location,
    temperature,
    humidity,
    condition,
    soil_moisture_estimate,
    description,
    forecast
  } = weather;

  const getWeatherIcon = (cond) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-10 h-10 text-blue-400" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-10 h-10 text-slate-400 animate-pulse" />;
    return <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />;
  };

  return (
    <div className="glass-card relative overflow-hidden flex flex-col justify-between h-full">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agro Weather Widget</h3>
            <h2 className="text-xl font-bold text-slate-100">{location}</h2>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
            Live Feed
          </span>
        </div>

        {/* Current Weather Details */}
        <div className="flex items-center space-x-6 my-5">
          {getWeatherIcon(condition)}
          <div>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-100">{temperature}</span>
              <span className="text-xl text-emerald-400 font-medium">°C</span>
            </div>
            <p className="text-sm text-slate-300 font-medium capitalize">{condition}</p>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center space-x-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Humidity</p>
              <p className="text-sm font-semibold text-slate-200">{humidity}%</p>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center space-x-3">
            <Thermometer className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Soil Moisture</p>
              <p className="text-sm font-semibold text-slate-200">{soil_moisture_estimate}</p>
            </div>
          </div>
        </div>

        {/* Farming Tip */}
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-start space-x-3 my-4">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Farming Tip:</strong> {description}
          </p>
        </div>
      </div>

      {/* Forecast list */}
      <div className="border-t border-slate-800/80 pt-4 mt-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">3-Day Outlook</h4>
        <div className="grid grid-cols-3 gap-2">
          {forecast.map((f, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-slate-900/30 border border-slate-800/40">
              <p className="text-xs font-medium text-slate-400">{f.day}</p>
              <div className="my-1.5 flex justify-center">{getWeatherIcon(f.condition)}</div>
              <p className="text-sm font-bold text-slate-200">{f.temp}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
