import React from 'react';
import { Compass, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                TripGenius <span className="text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Autonomous AI travel itinerary planner powered by Google Gemini. Crafted for students, travelers, and explorers seeking culturally-rich, budget-conscious journeys.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Google GenAI SDK
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Neon PostgreSQL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Render Hosted
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home & Inspiration
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-white transition-colors">
                  Plan Itinerary
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-white transition-colors">
                  Saved Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Docs */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Project Details
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1">
                <span>Model:</span>
                <span className="text-slate-300 font-mono text-xs">gemini-2.5-flash</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Framework:</span>
                <span className="text-slate-300 text-xs">Flask 3.1 & React 19</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Author:</span>
                <span className="text-brand-400 font-medium">radhikagurjar05</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} TripGenius AI. Built for Generative AI with Google Cloud.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for global travelers.
          </p>
        </div>
      </div>
    </footer>
  );
};
