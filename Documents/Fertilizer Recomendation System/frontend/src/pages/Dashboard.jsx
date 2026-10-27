import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import StatCard from '../components/dashboard/StatCard';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Sprout, 
  Leaf, 
  Award, 
  Flame, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      // 1. Fetch dashboard data (includes stats, recent predictions, weather)
      const dashRes = await api.get('/api/dashboard');
      
      // 2. Fetch full analytics (includes charts data)
      const analyticsRes = await api.get('/api/analytics');
      
      setData({
        ...dashRes.data,
        analytics: analyticsRes.data
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner fullPage={false} />
      </div>
    );
  }

  const { stats, recent_predictions, weather, analytics } = data || {};

  return (
    <div className="space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-400" />
            Farming Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and predictive insights for your crops.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/25 transition-all duration-200 disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <Link
            to="/predict"
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-gradient-emerald text-white text-sm font-bold shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Sprout className="w-4 h-4" />
            <span>New Prediction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Predictions"
          value={stats?.total_predictions || 0}
          icon={Sprout}
          color="emerald"
          subtext={`Today: ${stats?.today_predictions || 0} analyses`}
        />
        <StatCard
          title="Top Fertilizer"
          value={stats?.most_recommended_fertilizer !== 'None' ? stats?.most_recommended_fertilizer : 'N/A'}
          icon={Leaf}
          color="blue"
          subtext={`Most recommended chemical`}
        />
        <StatCard
          title="Most Planted Crop"
          value={stats?.most_selected_crop !== 'None' ? stats?.most_selected_crop : 'N/A'}
          icon={Flame}
          color="amber"
          subtext={`Soil Type: ${stats?.most_selected_soil !== 'None' ? stats?.most_selected_soil : 'N/A'}`}
        />
        <StatCard
          title="Avg Confidence"
          value={stats?.total_predictions > 0 ? `${(stats.average_confidence * 100).toFixed(1)}%` : '0.0%'}
          icon={Award}
          color="purple"
          subtext={`ML Model Accuracy: ${(stats?.model_accuracy * 100).toFixed(1)}%`}
        />
      </div>

      {/* Charts & Weather Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Prediction Trend Area Chart */}
        <div className="lg:col-span-2 glass-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Prediction Performance</h3>
            <h2 className="text-lg font-bold text-slate-200 mb-4">30-Day Analysis Traffic</h2>
          </div>
          
          <div className="h-64 w-full">
            {analytics?.prediction_trend && analytics.prediction_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.prediction_trend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tickFormatter={(tick) => tick.slice(5)} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredictions)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No historical records available to plot trends.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Weather Forecast widget */}
        <div>
          <WeatherWidget weather={weather} />
        </div>
      </div>

      {/* Analytics Breakdowns (Crop distributions & nutrient averages) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Crop distribution Pie Chart */}
        <div className="glass-card">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Crop Analysis Shares</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="h-44 w-44 shrink-0">
              {analytics?.crop_distribution && analytics.crop_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.crop_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.crop_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  No crops loaded.
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2.5 max-h-44 overflow-y-auto w-full">
              {analytics?.crop_distribution && analytics.crop_distribution.length > 0 ? (
                analytics.crop_distribution.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-500 font-bold">{item.value} runs</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Run predictions to populate charts.</p>
              )}
            </div>
          </div>
        </div>

        {/* N-P-K nutrient averages */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Average Soil Chemistry</h3>
            <div className="space-y-4">
              {analytics?.npk_distribution ? (
                analytics.npk_distribution.map((item) => {
                  let maxVal = 100;
                  if (item.nutrient.includes('Nitrogen')) maxVal = 140;
                  else if (item.nutrient.includes('Phosphorus')) maxVal = 100;
                  else if (item.nutrient.includes('Potassium')) maxVal = 200;
                  
                  const percentage = Math.min((item.average / maxVal) * 100, 100);
                  
                  return (
                    <div key={item.nutrient} className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-semibold">{item.nutrient}</span>
                        <span className="text-emerald-400 font-black">{item.average} mg/kg</span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500">No N-P-K averages logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-5 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Recent Computations</h3>
            <h2 className="text-lg font-bold text-slate-200">History Log</h2>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View Full Log</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recent_predictions && recent_predictions.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 uppercase border-b border-slate-800/80">
                  <th className="py-3.5 px-4 font-semibold">Recommended Fertilizer</th>
                  <th className="py-3.5 px-4 font-semibold">Target Crop</th>
                  <th className="py-3.5 px-4 font-semibold">Soil Type</th>
                  <th className="py-3.5 px-4 font-semibold text-center">N-P-K Ratio</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Confidence</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {recent_predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-200">{p.recommended_fertilizer}</td>
                    <td className="py-4 px-4 text-slate-300">{p.inputs?.['Crop Type']}</td>
                    <td className="py-4 px-4 text-slate-300">{p.inputs?.['Soil Type']}</td>
                    <td className="py-4 px-4 text-center font-mono text-slate-400">{p.explanation?.npk_ratio || 'N/A'}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold">
                        {(p.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-500">
                      {new Date(p.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              <p>No prediction records found. Complete a recommendation query to see results here.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
