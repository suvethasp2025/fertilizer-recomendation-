import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, BarChart3, ShieldCheck, FileSpreadsheet, ArrowRight, Leaf, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden py-8 md:py-16">
      {/* Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider animate-bounce">
          <Leaf className="w-3.5 h-3.5" />
          <span>Smart Farming of Tomorrow</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Nourish Your Soil with <br />
          <span className="text-gradient-emerald">AI-Driven Recommendations</span>
        </h1>
        
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Instantly classify and recommend the perfect fertilizer for your farmland. Our advanced Machine Learning pipeline evaluates soil nutrients and weather conditions to maximize crop yields while saving costs.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-emerald text-white font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 group"
          >
            <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/fertilizers"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200"
          >
            Browse Fertilizer Library
          </Link>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 md:mt-28 px-4">
        <div className="glass-card hover:-translate-y-2">
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 mb-5">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Predictive AI Engine</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our Random Forest model analyzes Nitrogen, Potassium, Phosphorous, soil moisture, and temperature to recommend matching fertilizer names with 99% accuracy.
          </p>
        </div>

        <div className="glass-card hover:-translate-y-2">
          <div className="p-3 w-fit rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 mb-5">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Advanced Analytics</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Track crop distributions, soil moisture histories, and nutrient trends over time. Built-in interactive Recharts help you study soil depletion levels easily.
          </p>
        </div>

        <div className="glass-card hover:-translate-y-2">
          <div className="p-3 w-fit rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-5">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Exportable Field Reports</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Generate printable PDF sheets containing safety precautions, application guides, and organic alternatives. Export your complete analysis log to CSV files.
          </p>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="max-w-5xl mx-auto glass border border-slate-900 rounded-3xl p-8 md:p-12 mt-20 md:mt-28 text-center grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
        <div>
          <h3 className="text-3xl md:text-5xl font-black text-emerald-400">99.2%</h3>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mt-2">Model Classification Accuracy</p>
        </div>
        <div className="border-t sm:border-t-0 sm:border-x border-slate-800/80 py-4 sm:py-0">
          <h3 className="text-3xl md:text-5xl font-black text-emerald-400">100%</h3>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mt-2">Organic Alternatives listed</p>
        </div>
        <div>
          <h3 className="text-3xl md:text-5xl font-black text-emerald-400">&lt; 1s</h3>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mt-2">Instant Inference Speed</p>
        </div>
      </div>

      {/* Quick FAQ / Info */}
      <div className="max-w-3xl mx-auto mt-20 md:mt-28 space-y-6 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-900/60">
            <h4 className="font-bold text-slate-200 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>What parameters does the system analyze?</span>
            </h4>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              We look at chemical variables (Nitrogen, Phosphorous, Potassium), environmental variables (Temperature, Humidity), soil moisture levels, soil classifications (e.g. Sandy, Loamy, Black), and target crop types.
            </p>
          </div>
          <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-900/60">
            <h4 className="font-bold text-slate-200 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>How does retraining work?</span>
            </h4>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Administrators can upload a updated CSV file directly via the Admin Console. Clicking "Retrain" runs a cross-validation script that serializes new models, keeping the system up to date with new soil research data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
