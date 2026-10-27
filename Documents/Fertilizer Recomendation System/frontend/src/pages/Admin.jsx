import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  ShieldAlert, 
  Cpu, 
  Users, 
  BookOpen, 
  UploadCloud, 
  Play, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle, 
  X,
  FileSpreadsheet,
  PlusCircle,
  HelpCircle,
  Database
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('models'); // 'models', 'fertilizers', 'users'

  // Model Retrain/Upload states
  const [modelMetrics, setModelMetrics] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);

  // Fertilizer CRUD states
  const [fertilizers, setFertilizers] = useState([]);
  const [showFertModal, setShowFertModal] = useState(false);
  const [editingFert, setEditingFert] = useState(null);
  const [fertForm, setFertForm] = useState({
    name: '',
    description: '',
    suitable_crops: '',
    suitable_soil: '',
    npk_ratio: '',
    usage: '',
    application_method: '',
    advantages: '',
    disadvantages: '',
    best_season: '',
    dosage: '',
    price: 15.00,
    manufacturer: '',
    image: ''
  });

  // Users List states
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFert, setLoadingFert] = useState(false);

  const fetchModelMetrics = async () => {
    try {
      const res = await api.get('/api/analytics');
      setModelMetrics(res.data.model_performance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsersList(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load registered users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAllFertilizers = async () => {
    setLoadingFert(true);
    try {
      const res = await api.get('/api/fertilizers', { params: { limit: 100 } });
      setFertilizers(res.data.fertilizers);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch fertilizers catalog.');
    } finally {
      setLoadingFert(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchModelMetrics();
      fetchAllFertilizers();
    }
  }, [user]);

  // Tab trigger handlers
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'fertilizers') fetchAllFertilizers();
    else if (activeTab === 'models') fetchModelMetrics();
  }, [activeTab]);

  // File Upload handler
  const handleUploadDataset = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file first.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    setUploading(true);
    try {
      await api.post('/api/admin/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('New dataset uploaded successfully!');
      setCsvFile(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to upload CSV file.');
    } finally {
      setUploading(false);
    }
  };

  // Model Retrain trigger handler
  const handleRetrainModel = async () => {
    setTraining(true);
    try {
      const res = await api.post('/api/admin/retrain-model');
      setModelMetrics(res.data.metrics);
      toast.success('Machine learning model successfully retrained! Performance updated.');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Retraining script failed.');
    } finally {
      setTraining(false);
    }
  };

  // User Deletion handler
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This removes profile and histories.')) {
      return;
    }
    
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User and data removed.');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to delete user.');
    }
  };

  // Fertilizer CRUD helper open modals
  const handleOpenFertModal = (fert = null) => {
    if (fert) {
      setEditingFert(fert);
      setFertForm({
        name: fert.name,
        description: fert.description,
        suitable_crops: fert.suitable_crops.join(', '),
        suitable_soil: fert.suitable_soil.join(', '),
        npk_ratio: fert.npk_ratio,
        usage: fert.usage,
        application_method: fert.application_method,
        advantages: fert.advantages.join('\n'),
        disadvantages: fert.disadvantages.join('\n'),
        best_season: fert.best_season,
        dosage: fert.dosage,
        price: fert.price || 15.00,
        manufacturer: fert.manufacturer || '',
        image: fert.image || ''
      });
    } else {
      setEditingFert(null);
      setFertForm({
        name: '',
        description: '',
        suitable_crops: '',
        suitable_soil: '',
        npk_ratio: '',
        usage: '',
        application_method: '',
        advantages: '',
        disadvantages: '',
        best_season: '',
        dosage: '',
        price: 15.00,
        manufacturer: '',
        image: ''
      });
    }
    setShowFertModal(true);
  };

  // Fertilizer submit handler (Create/Update)
  const handleFertilizerSubmit = async (e) => {
    e.preventDefault();
    
    const formattedPayload = {
      name: fertForm.name,
      description: fertForm.description,
      suitable_crops: fertForm.suitable_crops.split(',').map(s => s.trim()).filter(Boolean),
      suitable_soil: fertForm.suitable_soil.split(',').map(s => s.trim()).filter(Boolean),
      npk_ratio: fertForm.npk_ratio,
      usage: fertForm.usage,
      application_method: fertForm.application_method,
      advantages: fertForm.advantages.split('\n').map(s => s.trim()).filter(Boolean),
      disadvantages: fertForm.disadvantages.split('\n').map(s => s.trim()).filter(Boolean),
      best_season: fertForm.best_season,
      dosage: fertForm.dosage,
      price: parseFloat(fertForm.price) || null,
      manufacturer: fertForm.manufacturer || null,
      image: fertForm.image || null
    };

    try {
      if (editingFert) {
        await api.put(`/api/admin/fertilizers/${editingFert.id}`, formattedPayload);
        toast.success('Fertilizer updated successfully!');
      } else {
        await api.post('/api/admin/fertilizers', formattedPayload);
        toast.success('New fertilizer created in catalog!');
      }
      setShowFertModal(false);
      fetchAllFertilizers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to save fertilizer.');
    }
  };

  // Delete fertilizer handler
  const handleDeleteFert = async (id) => {
    if (!window.confirm('Delete this fertilizer product from the library database?')) {
      return;
    }
    
    try {
      await api.delete(`/api/admin/fertilizers/${id}`);
      toast.success('Product deleted from database.');
      fetchAllFertilizers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Deletion failed.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold">Unauthenticated Access Denied</h2>
        <p className="text-slate-400 text-xs">You must have administrative role parameters to view this portal console.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-page">
      
      {/* Header Panel */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900/60 flex items-center space-x-3.5">
        <div className="p-3 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-2xl">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100">Administrative Console</h1>
          <p className="text-slate-400 text-sm mt-0.5">Control machine learning parameters, edit fertilizer databases, and manage farmers profiles.</p>
        </div>
      </div>

      {/* Tabs list menu */}
      <div className="flex border-b border-slate-950 gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'models' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Cpu className="w-4.5 h-4.5" />
          <span>ML Modeling Pipelines</span>
        </button>
        <button
          onClick={() => setActiveTab('fertilizers')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'fertilizers' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Fertilizer Library CRUD</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'users' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Farmers Accounts</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Metrics card details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card space-y-4">
              <h3 className="text-sm font-bold text-slate-300 border-b border-slate-900 pb-2 uppercase tracking-wider">Model Quality Indicators</h3>
              
              {modelMetrics ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">Model Name</span>
                    <p className="text-base font-extrabold text-slate-200 mt-1">{modelMetrics.model_name}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">Validation Accuracy</span>
                    <p className="text-base font-extrabold text-emerald-400 mt-1">{(modelMetrics.accuracy * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">Precision Score</span>
                    <p className="text-base font-extrabold text-slate-200 mt-1">{(modelMetrics.precision * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">Recall Rate</span>
                    <p className="text-base font-extrabold text-slate-200 mt-1">{(modelMetrics.recall * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">F1 Score</span>
                    <p className="text-base font-extrabold text-slate-200 mt-1">{(modelMetrics.f1 * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-slate-500">Cross Validation Acc</span>
                    <p className="text-base font-extrabold text-slate-200 mt-1">{(modelMetrics.cv_accuracy * 100).toFixed(2)}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-6">Metrics not loaded.</div>
              )}

              {modelMetrics?.trained_at && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Last trained at <strong>{new Date(modelMetrics.trained_at).toLocaleString()}</strong></span>
                </div>
              )}
            </div>

            {/* Retrain Action buttons */}
            <div className="glass-card space-y-4">
              <h3 className="text-sm font-bold text-slate-300 border-b border-slate-900 pb-2 uppercase tracking-wider">Trigger Retraining Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clicking the action button compiles a Scikit-Learn training process. It loads the uploaded dataset CSV file, scales numerical parameters, fits Decision Trees, RF, SVM, and XGBoost classifiers, and serializes the best pickle model object.
              </p>
              
              <button
                onClick={handleRetrainModel}
                disabled={training}
                className="px-6 py-4 rounded-xl bg-gradient-emerald text-white text-xs font-bold transition-all shadow shadow-emerald-500/10 hover:scale-[1.01] flex items-center space-x-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {training ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Fitting classifiers...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run training pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dataset Upload Sidebar */}
          <div className="glass-card space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-300 border-b border-slate-900 pb-2 uppercase tracking-wider">Dataset Uploader</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Upload a structured csv file containing columns: Temperature, Humidity, Moisture, Soil Type, Crop Type, Nitrogen, Potassium, Phosphorous, and Fertilizer Name.
              </p>
              
              <form onSubmit={handleUploadDataset} className="space-y-4 mt-6">
                <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 text-center transition-all cursor-pointer bg-slate-900/10 relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-300 block truncate">
                    {csvFile ? csvFile.name : 'Choose CSV file to drop'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Maximum size 10MB</span>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !csvFile}
                  className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:text-white hover:border-slate-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  {uploading ? 'Uploading sheet...' : 'Upload Data Sheet'}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'fertilizers' && (
        <div className="space-y-6 animate-page">
          <div className="flex justify-between items-center bg-slate-900/20 p-4 rounded-2xl border border-slate-900">
            <span className="text-xs text-slate-400">Database has <strong>{fertilizers.length}</strong> fertilizer items registered.</span>
            <button
              onClick={() => handleOpenFertModal()}
              className="px-5 py-3 rounded-xl bg-gradient-emerald text-white text-xs font-bold transition-all shadow hover:scale-[1.01] flex items-center space-x-1.5 cursor-pointer border border-emerald-400/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Fertilizer</span>
            </button>
          </div>

          {loadingFert ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : fertilizers.length > 0 ? (
            <div className="overflow-x-auto glass border border-slate-900 rounded-3xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 uppercase border-b border-slate-800 bg-slate-900/30">
                    <th className="py-4 px-6 font-bold">Name</th>
                    <th className="py-4 px-6 font-bold">NPK Ratio</th>
                    <th className="py-4 px-6 font-bold">Suitable Soils</th>
                    <th className="py-4 px-6 font-bold text-center">Dosage</th>
                    <th className="py-4 px-6 font-bold text-center">Price</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950">
                  {fertilizers.map(f => (
                    <tr key={f.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-200">{f.name}</td>
                      <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{f.npk_ratio}</td>
                      <td className="py-4 px-6 text-slate-400 max-w-[200px] truncate">{f.suitable_soil.join(', ')}</td>
                      <td className="py-4 px-6 text-center text-slate-300">{f.dosage}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-200">${f.price?.toFixed(2)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleOpenFertModal(f)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/25 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFert(f.id)}
                            className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">No fertilizers catalog records found.</div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-page">
          {loadingUsers ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : usersList.length > 0 ? (
            <div className="overflow-x-auto glass border border-slate-900 rounded-3xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 uppercase border-b border-slate-800 bg-slate-900/30">
                    <th className="py-4 px-6 font-bold">User Details</th>
                    <th className="py-4 px-6 font-bold">Email</th>
                    <th className="py-4 px-6 font-bold">Phone</th>
                    <th className="py-4 px-6 font-bold">Location</th>
                    <th className="py-4 px-6 font-bold text-center">Predictions Count</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                            className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900"
                            alt="avatar"
                          />
                          <div>
                            <p className="font-bold text-slate-200">{u.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">{u.email}</td>
                      <td className="py-4 px-6 text-slate-400">{u.phone}</td>
                      <td className="py-4 px-6 text-slate-400">{u.location}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-200">{u.prediction_count || 0}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                          className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-300 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">No users found.</div>
          )}
        </div>
      )}

      {/* CRUD Fertilizer Edit Modal */}
      {showFertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl glass border border-slate-800 rounded-3xl shadow-2xl animate-fade-in my-8 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-900 shrink-0">
              <h3 className="text-base font-bold text-slate-100">
                {editingFert ? `Edit Product: ${editingFert.name}` : 'Register New Fertilizer'}
              </h3>
              <button
                onClick={() => setShowFertModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFertilizerSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fertilizer Name</label>
                  <input
                    type="text"
                    value={fertForm.name}
                    onChange={(e) => setFertForm(prev => ({ ...prev, name: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NPK Chemical Ratio</label>
                  <input
                    type="text"
                    placeholder="e.g. 46-0-0"
                    value={fertForm.npk_ratio}
                    onChange={(e) => setFertForm(prev => ({ ...prev, npk_ratio: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Description</label>
                <textarea
                  rows="3"
                  value={fertForm.description}
                  onChange={(e) => setFertForm(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-input text-xs py-2.5"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suitable Soils (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Sandy, Loamy, Clayey"
                    value={fertForm.suitable_soil}
                    onChange={(e) => setFertForm(prev => ({ ...prev, suitable_soil: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suitable Crops (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Paddy, Wheat, Maize"
                    value={fertForm.suitable_crops}
                    onChange={(e) => setFertForm(prev => ({ ...prev, suitable_crops: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Season</label>
                  <input
                    type="text"
                    value={fertForm.best_season}
                    onChange={(e) => setFertForm(prev => ({ ...prev, best_season: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage amount</label>
                  <input
                    type="text"
                    placeholder="50-100 kg/acre"
                    value={fertForm.dosage}
                    onChange={(e) => setFertForm(prev => ({ ...prev, dosage: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Estimate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fertForm.price}
                    onChange={(e) => setFertForm(prev => ({ ...prev, price: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer</label>
                  <input
                    type="text"
                    value={fertForm.manufacturer}
                    onChange={(e) => setFertForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Image URL</label>
                  <input
                    type="url"
                    value={fertForm.image}
                    onChange={(e) => setFertForm(prev => ({ ...prev, image: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Advantages (one per line)</label>
                  <textarea
                    rows="3"
                    value={fertForm.advantages}
                    onChange={(e) => setFertForm(prev => ({ ...prev, advantages: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Disadvantages (one per line)</label>
                  <textarea
                    rows="3"
                    value={fertForm.disadvantages}
                    onChange={(e) => setFertForm(prev => ({ ...prev, disadvantages: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Usage Description</label>
                  <input
                    type="text"
                    value={fertForm.usage}
                    onChange={(e) => setFertForm(prev => ({ ...prev, usage: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Method</label>
                  <input
                    type="text"
                    value={fertForm.application_method}
                    onChange={(e) => setFertForm(prev => ({ ...prev, application_method: e.target.value }))}
                    className="glass-input text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFertModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold transition-all text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-gradient-emerald text-white font-bold transition-all text-xs cursor-pointer"
                >
                  Save Fertilizer Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
