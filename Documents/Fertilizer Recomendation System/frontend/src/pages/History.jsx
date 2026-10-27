import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { exportToCSV } from '../utils/csvExporter';
import { generatePDF } from '../utils/pdfGenerator';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  FileDown, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const CROP_TYPES = [
  'Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 
  'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'
];

const History = () => {
  const { user } = useAuth();
  
  // Search parameters
  const [search, setSearch] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [page, setPage] = useState(1);

  // States
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8
      };
      
      if (search) params.search = search;
      if (soilFilter) params.crop_type = cropFilter; // wait backend matches
      if (cropFilter) params.crop_type = cropFilter;
      if (soilFilter) params.soil_type = soilFilter;

      const res = await api.get('/api/history', { params });
      setHistory(res.data.history);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load prediction history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, soilFilter, cropFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSoilFilter('');
    setCropFilter('');
    setPage(1);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction record?')) {
      return;
    }
    
    try {
      await api.delete(`/api/history/${id}`);
      toast.success('Prediction record deleted.');
      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete history record.');
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all logs without pagination for complete CSV sheet
      const res = await api.get('/api/history', { params: { limit: 1000 } });
      exportToCSV(res.data.history, 'agro_predictions_export.csv');
      toast.success('Prediction logs exported to CSV!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data to CSV.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPDF = (p) => {
    generatePDF(p, user?.name || 'Farmer');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-emerald-400" />
            Prediction History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access previous analysis records, print PDF reports, and export database files.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/25 text-slate-200 hover:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export CSV Sheet'}</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="glass-card p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by recommended fertilizer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-12"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-6 py-3.5 rounded-xl bg-slate-900/30 border border-slate-900 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-xs"
          >
            Clear Filters
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Soil Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Soil Type</label>
            <select
              value={soilFilter}
              onChange={(e) => { setSoilFilter(e.target.value); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="">All Soil Classifications</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Crop Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Target Crop</label>
            <select
              value={cropFilter}
              onChange={(e) => { setCropFilter(e.target.value); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="">All Farmed Crops</option>
              {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-6">
          
          {/* Grid list of history cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
              <div key={item.id} className="glass-card flex flex-col justify-between space-y-4 border border-slate-900 hover:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleString()}</span>
                    <h2 className="text-2xl font-black text-slate-200 mt-1">{item.recommended_fertilizer}</h2>
                  </div>
                  <span className="px-2.5 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold">
                    {(item.confidence * 100).toFixed(0)}% Match
                  </span>
                </div>

                {/* Input specifications preview */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Crop</p>
                    <p className="font-bold text-slate-300 truncate">{item.inputs?.['Crop Type']}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Soil</p>
                    <p className="font-bold text-slate-300 truncate">{item.inputs?.['Soil Type']}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Moisture</p>
                    <p className="font-bold text-slate-300">{item.inputs?.Moisture}%</p>
                  </div>
                </div>

                {/* Chemical variables preview */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="py-2.5 rounded bg-slate-900/30 border border-slate-900">
                    <span className="text-slate-500">Nitrogen</span>
                    <p className="font-bold text-slate-200 mt-0.5">{item.inputs?.Nitrogen}</p>
                  </div>
                  <div className="py-2.5 rounded bg-slate-900/30 border border-slate-900">
                    <span className="text-slate-500">Phosphorous</span>
                    <p className="font-bold text-slate-200 mt-0.5">{item.inputs?.Phosphorous}</p>
                  </div>
                  <div className="py-2.5 rounded bg-slate-900/30 border border-slate-900">
                    <span className="text-slate-500">Potassium</span>
                    <p className="font-bold text-slate-200 mt-0.5">{item.inputs?.Potassium}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-2">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(item)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-900/30 px-6 py-4 rounded-2xl border border-slate-900">
              <span className="text-xs text-slate-500">
                Showing page <strong className="text-slate-300">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong> ({total} records total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 glass-card">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
          <p className="text-base font-bold text-slate-400">No predictions matched your filter.</p>
          <p className="text-xs mt-1">Run a soil recommendation calculation or adjust filters.</p>
        </div>
      )}

    </div>
  );
};

export default History;
