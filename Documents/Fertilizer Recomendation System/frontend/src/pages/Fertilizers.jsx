import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, BookOpen, ChevronLeft, ChevronRight, X, ShieldCheck, Leaf } from 'lucide-react';

import LoadingSpinner from '../components/common/LoadingSpinner';

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const CROP_TYPES = [
  'Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 
  'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'
];

const Fertilizers = () => {
  // Query parameters
  const [search, setSearch] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState(1);
  const [page, setPage] = useState(1);

  // States
  const [fertilizers, setFertilizers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);

  const fetchFertilizers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6,
        sort_by: sortField,
        sort_order: sortOrder
      };
      
      if (search) params.search = search;
      if (soilFilter) params.soil_type = soilFilter;
      if (cropFilter) params.crop_type = cropFilter;

      const res = await api.get('/api/fertilizers', { params });
      setFertilizers(res.data.fertilizers);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load fertilizers catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFertilizers();
  }, [page, soilFilter, cropFilter, sortField, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFertilizers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSoilFilter('');
    setCropFilter('');
    setSortField('name');
    setSortOrder(1);
    setPage(1);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            Fertilizers Library
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through detailed information about common chemical fertilizers.
          </p>
        </div>
      </div>

      {/* Search & Filter Form */}
      <div className="glass-card p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search fertilizers by name or description..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Soil Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suitable Soil</label>
            <select
              value={soilFilter}
              onChange={(e) => { setSoilFilter(e.target.value); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="">All Soil Types</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Crop Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suitable Crops</label>
            <select
              value={cropFilter}
              onChange={(e) => { setCropFilter(e.target.value); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="">All Crop Types</option>
              {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sort By Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Attribute</label>
            <select
              value={sortField}
              onChange={(e) => { setSortField(e.target.value); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(parseInt(e.target.value)); setPage(1); }}
              className="glass-select py-2.5 text-xs"
            >
              <option value="1">Ascending</option>
              <option value="-1">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : fertilizers.length > 0 ? (
        <>
          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fertilizers.map((item) => (
              <div key={item.id} className="glass-card overflow-hidden group flex flex-col justify-between p-0 border border-slate-900 hover:border-emerald-500/20">
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  {/* Floating badges */}
                  <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-extrabold bg-emerald-500 text-white rounded-full uppercase tracking-wider shadow">
                    {item.npk_ratio}
                  </span>
                  
                  {item.price && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-extrabold bg-slate-950/90 text-emerald-400 border border-emerald-500/20 rounded-full">
                      ${item.price.toFixed(2)}/bag
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{item.name}</h2>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{item.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Crops list preview */}
                    <div className="flex flex-wrap gap-1.5 max-h-12 overflow-hidden">
                      {item.suitable_crops.slice(0, 3).map(crop => (
                        <span key={crop} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                          {crop}
                        </span>
                      ))}
                      {item.suitable_crops.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-500">
                          +{item.suitable_crops.length - 3} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedFertilizer(item)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/25 text-slate-300 hover:text-emerald-400 text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-900/30 px-6 py-4 rounded-2xl border border-slate-900">
              <span className="text-xs text-slate-500">
                Showing page <strong className="text-slate-300">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong> ({total} items total)
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
        </>
      ) : (
        <div className="py-20 text-center text-slate-500 glass-card">
          <BookOpen className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          <p className="text-base font-bold text-slate-400">No matching fertilizers found.</p>
          <p className="text-xs mt-1">Adjust search parameters or clear filters.</p>
        </div>
      )}

      {/* Details Modal Dialog */}
      {selectedFertilizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Image Header */}
            <div className="relative h-56 w-full shrink-0">
              <img
                src={selectedFertilizer.image || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=700"}
                alt={selectedFertilizer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <button
                onClick={() => setSelectedFertilizer(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6">
                <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-500 text-white rounded-full uppercase tracking-wider mr-2">
                  {selectedFertilizer.npk_ratio}
                </span>
                <h2 className="text-3xl font-black text-white mt-2">{selectedFertilizer.name}</h2>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm leading-relaxed">
              
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
                <p className="text-slate-300">{selectedFertilizer.description}</p>
              </div>

              {/* Specific metadata details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-900">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Best Season</p>
                  <p className="font-bold text-slate-200">{selectedFertilizer.best_season}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Average Dosage</p>
                  <p className="font-bold text-slate-200">{selectedFertilizer.dosage}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Price Estimate</p>
                  <p className="font-bold text-emerald-400">${selectedFertilizer.price?.toFixed(2)}/bag</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Manufacturer</p>
                  <p className="font-bold text-slate-200 truncate">{selectedFertilizer.manufacturer || 'General supplier'}</p>
                </div>
              </div>

              {/* Categoricals lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suitable Soils</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFertilizer.suitable_soil.map(soil => (
                      <span key={soil} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
                        {soil} Soil
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suitable Crops</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFertilizer.suitable_crops.map(crop => (
                      <span key={crop} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advantages and disadvantages lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-900 pt-6">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Product Advantages</h4>
                  <ul className="space-y-1.5">
                    {selectedFertilizer.advantages.map((adv, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Product Disadvantages</h4>
                  <ul className="space-y-1.5">
                    {selectedFertilizer.disadvantages.map((dis, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-rose-400 shrink-0 font-bold">•</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Usage & Application details */}
              <div className="border-t border-slate-900 pt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application details</h4>
                <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-2.5">
                  <p className="text-xs text-slate-300"><strong className="text-slate-400">Primary Usage:</strong> {selectedFertilizer.usage}</p>
                  <p className="text-xs text-slate-300"><strong className="text-slate-400">Method:</strong> {selectedFertilizer.application_method}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fertilizers;
