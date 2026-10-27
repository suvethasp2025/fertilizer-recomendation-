import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { generatePDF } from '../utils/pdfGenerator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Sprout, 
  Thermometer, 
  Droplets, 
  Compass, 
  Wind, 
  Search, 
  FileDown, 
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const CROP_TYPES = [
  'Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 
  'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'
];

const Predict = () => {
  const { user } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    temperature: 28.0,
    humidity: 60.0,
    moisture: 35.0,
    nitrogen: 60.0,
    potassium: 40.0,
    phosphorous: 45.0,
    soil_type: 'Loamy',
    crop_type: 'Wheat'
  });

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-fill weather parameters using user location
  const handleFetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const city = user?.location || '';
      const res = await api.get(`/api/weather?city=${city}`);
      setFormData(prev => ({
        ...prev,
        temperature: parseFloat(res.data.temperature.toFixed(1)),
        humidity: parseFloat(res.data.humidity.toFixed(1))
      }));
      toast.success(`Weather details loaded for "${res.data.location}"`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load current weather. Please enter values manually.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Artificially delay a tiny bit (800ms) to play the agronomy computation animation
    setTimeout(async () => {
      try {
        const payload = {
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          moisture: parseFloat(formData.moisture),
          nitrogen: parseFloat(formData.nitrogen),
          potassium: parseFloat(formData.potassium),
          phosphorous: parseFloat(formData.phosphorous),
          soil_type: formData.soil_type,
          crop_type: formData.crop_type
        };

        const res = await api.post('/api/predict', payload);
        setResult(res.data);
        toast.success('Soil analysis calculated successfully!');
      } catch (error) {
        console.error(error);
        const detail = error.response?.data?.detail || 'Analysis calculation failed.';
        toast.error(detail);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      temperature: 28.0,
      humidity: 60.0,
      moisture: 35.0,
      nitrogen: 60.0,
      potassium: 40.0,
      phosphorous: 45.0,
      soil_type: 'Loamy',
      crop_type: 'Wheat'
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generatePDF(result, user?.name || 'Farmer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <Sprout className="w-7 h-7 text-emerald-400" />
            Nutrient Recommendation Form
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Input soil properties to find the best matching fertilizer.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card py-20 flex flex-col justify-center items-center space-y-4">
          <LoadingSpinner size="large" />
          <h3 className="text-lg font-bold text-slate-200 animate-pulse">Running ML Predictive Classifiers...</h3>
          <p className="text-xs text-slate-500">Mapping Nitrogen, Phosphorous, and Potassium ratios against model trees.</p>
        </div>
      ) : result ? (
        // Recommendation Result Panel
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Hero Card */}
          <div className="glass-card border-2 border-emerald-500/20 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 text-center relative overflow-hidden p-8">
            {/* Ambient light glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex justify-center items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Recommended Fertilizer
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-wide text-white drop-shadow-md">
              {result.recommended_fertilizer}
            </h1>
            
            <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-400">NPK Ratio:</span>
              <span className="text-xs font-bold text-slate-200">{result.explanation?.npk_ratio}</span>
              <span className="text-slate-700">|</span>
              <span className="text-xs font-semibold text-emerald-400">Confidence:</span>
              <span className="text-xs font-bold text-slate-200">{(result.confidence * 100).toFixed(1)}%</span>
            </div>

            {/* Actions */}
            <div className="flex justify-center items-center gap-3.5 mt-8 border-t border-slate-800/60 pt-6">
              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-2 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Run New Query</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-3 rounded-xl bg-gradient-emerald text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/10 hover:scale-102 transition-all duration-200 border border-emerald-400/20"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Report PDF</span>
              </button>
            </div>
          </div>

          {/* Breakdown Explanation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Why this choice */}
            <div className="glass-card md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wider">Agronomic Rationale</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation?.why_this}</p>
              
              <div className="space-y-1 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Suggested Application Method</p>
                <p className="text-sm text-slate-200 font-medium">{result.explanation?.application_method}</p>
              </div>
            </div>

            {/* Input Soil details */}
            <div className="glass-card space-y-4">
              <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wider">Soil Chemistry</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400">Nitrogen (N)</span>
                  <span className="font-bold text-slate-200">{result.inputs?.Nitrogen} mg/kg</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400">Phosphorus (P)</span>
                  <span className="font-bold text-slate-200">{result.inputs?.Phosphorous} mg/kg</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400">Potassium (K)</span>
                  <span className="font-bold text-slate-200">{result.inputs?.Potassium} mg/kg</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400">Soil Moisture</span>
                  <span className="font-bold text-slate-200">{result.inputs?.Moisture}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400">Soil Classification</span>
                  <span className="font-bold text-emerald-400">{result.inputs?.['Soil Type']}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages & Organic options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-sm font-bold text-emerald-400 border-b border-emerald-500/10 pb-2 uppercase tracking-wider mb-3">Key Advantages</h3>
              <ul className="space-y-2">
                {result.explanation?.advantages?.map((adv, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card">
              <h3 className="text-sm font-bold text-indigo-400 border-b border-indigo-500/10 pb-2 uppercase tracking-wider mb-3">Organic Alternatives</h3>
              <ul className="space-y-2">
                {result.explanation?.organic_alternatives?.map((org, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2.5">
                    <span className="text-indigo-400 font-bold shrink-0 mt-0.5">✦</span>
                    <span>{org}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safety card */}
          <div className="glass-card border border-rose-500/15 bg-rose-500/5 p-5">
            <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="uppercase tracking-wider">Handling & Safety Precautions</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.explanation?.safety_tips?.map((safe, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-rose-400 shrink-0 font-bold">•</span>
                  <span>{safe}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      ) : (
        // Prediction Input Form Panel
        <form onSubmit={handleSubmit} className="glass-card space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Chemical and Environmental Inputs</h3>
            <button
              type="button"
              onClick={handleFetchWeather}
              disabled={weatherLoading}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700/60 disabled:opacity-50 transition-all duration-200"
            >
              <Wind className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
              <span>{weatherLoading ? 'Loading climate...' : 'Auto-fill Weather details'}</span>
            </button>
          </div>

          {/* Environmental metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Temp Slider */}
            <div className="space-y-2 p-4 bg-slate-900/30 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-rose-400" /> Temperature</span>
                <span className="font-bold text-slate-200">{formData.temperature}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 my-4"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>10°C (Cool)</span>
                <span>50°C (Hot)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2 p-4 bg-slate-900/30 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-blue-400" /> Humidity</span>
                <span className="font-bold text-slate-200">{formData.humidity}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                step="0.1"
                value={formData.humidity}
                onChange={(e) => handleInputChange('humidity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 my-4"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>15% (Dry)</span>
                <span>100% (Humid)</span>
              </div>
            </div>

            {/* Moisture Slider */}
            <div className="space-y-2 p-4 bg-slate-900/30 rounded-2xl border border-slate-900 flex flex-col justify-between">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-indigo-400" /> Soil Moisture</span>
                <span className="font-bold text-slate-200">{formData.moisture}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={formData.moisture}
                onChange={(e) => handleInputChange('moisture', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 my-4"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>0% (Parched)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>
          </div>

          {/* Chemical composition inputs */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Soil Nutrients (NPK values in mg/kg)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Nitrogen */}
              <div className="space-y-2 p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Nitrogen (N)</span>
                  <span className="text-emerald-400 font-bold">{formData.nitrogen}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.nitrogen}
                  onChange={(e) => handleInputChange('nitrogen', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="glass-input py-2 text-center text-sm font-bold"
                />
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.nitrogen}
                  onChange={(e) => handleInputChange('nitrogen', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 my-1"
                />
              </div>

              {/* Phosphorus */}
              <div className="space-y-2 p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Phosphorus (P)</span>
                  <span className="text-emerald-400 font-bold">{formData.phosphorous}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.phosphorous}
                  onChange={(e) => handleInputChange('phosphorous', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="glass-input py-2 text-center text-sm font-bold"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.phosphorous}
                  onChange={(e) => handleInputChange('phosphorous', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 my-1"
                />
              </div>

              {/* Potassium */}
              <div className="space-y-2 p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Potassium (K)</span>
                  <span className="text-emerald-400 font-bold">{formData.potassium}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.potassium}
                  onChange={(e) => handleInputChange('potassium', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="glass-input py-2 text-center text-sm font-bold"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={formData.potassium}
                  onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 my-1"
                />
              </div>

            </div>
          </div>

          {/* Categoricals Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-900 pt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soil Classification</label>
              <select
                value={formData.soil_type}
                onChange={(e) => handleInputChange('soil_type', e.target.value)}
                className="glass-select py-3.5"
              >
                {SOIL_TYPES.map(soil => (
                  <option key={soil} value={soil} className="bg-slate-950 text-slate-100">{soil}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Farming Crop</label>
              <select
                value={formData.crop_type}
                onChange={(e) => handleInputChange('crop_type', e.target.value)}
                className="glass-select py-3.5"
              >
                {CROP_TYPES.map(crop => (
                  <option key={crop} value={crop} className="bg-slate-950 text-slate-100">{crop}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-emerald text-white font-bold shadow-lg shadow-emerald-500/10 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center space-x-2 border border-emerald-400/25 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Analyze and Recommend Fertilizer</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default Predict;
