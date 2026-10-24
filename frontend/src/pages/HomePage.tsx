import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Wallet, 
  Compass, 
  ArrowRight, 
  Bookmark, 
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

interface SampleDestination {
  city: string;
  country: string;
  image: string;
  description: string;
  duration: string;
  budgetEst: string;
  tags: string[];
}

const SAMPLE_DESTINATIONS: SampleDestination[] = [
  {
    city: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse in tranquil Zen gardens, historic geisha quarters, and thousand-year-old wooden shrines.',
    duration: '5 Days',
    budgetEst: '$1,400',
    tags: ['Culture', 'Temples', 'Cuisine']
  },
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'Experience romantic boulevards, world-class art at the Louvre, and artisanal patisseries in Montmartre.',
    duration: '4 Days',
    budgetEst: '$1,600',
    tags: ['Art', 'Romance', 'Cafes']
  },
  {
    city: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'Walk through living history from the Colosseum to the Vatican, savoring authentic carbonara.',
    duration: '4 Days',
    budgetEst: '$1,350',
    tags: ['History', 'Architecture', 'Pasta']
  },
  {
    city: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Lush terraced rice paddies, serene beachfront temples, yoga sanctuaries, and sunset surf breaks.',
    duration: '7 Days',
    budgetEst: '$1,100',
    tags: ['Nature', 'Beaches', 'Wellness']
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic neon skylines, Michelin-starred ramen stalls, anime hubs in Akihabara, and peaceful parks.',
    duration: '6 Days',
    budgetEst: '$1,800',
    tags: ['Modern', 'Shopping', 'Nightlife']
  },
  {
    city: 'New York City',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    description: 'Broadway spectacles, world-renowned museums, Central Park strolls, and high-energy urban vibes.',
    duration: '5 Days',
    budgetEst: '$2,200',
    tags: ['Museums', 'Theater', 'Dining']
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [quickDest, setQuickDest] = useState('');
  const [backendHealth, setBackendHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    api.health()
      .then(() => setBackendHealth('online'))
      .catch(() => setBackendHealth('offline'));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickDest.trim()) {
      navigate(`/plan?destination=${encodeURIComponent(quickDest.trim())}`);
    } else {
      navigate('/plan');
    }
  };

  const handleSelectDestination = (dest: string) => {
    navigate(`/plan?destination=${encodeURIComponent(dest)}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/50 via-emerald-50/20 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status & Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-800 text-xs font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Next-Gen Travel Intelligence with Gemini 2.5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              {backendHealth === 'online' && (
                <span className="text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  API Connected
                </span>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Your Dream Trip, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-500">
                Intelligently Designed in Seconds
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Tell TripGenius AI where you want to go, your budget, pace, and interests. Our Google Cloud Gemini engine builds a complete day-by-day plan with cost breakdowns, optimized routes, and local secrets.
            </p>

            {/* Quick Destination Search Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <MapPin className="w-5 h-5 text-brand-600 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={quickDest}
                  onChange={(e) => setQuickDest(e.target.value)}
                  placeholder="Where are you dreaming of going? (e.g. Kyoto, Tokyo, Paris)"
                  className="w-full pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Popular quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Trending Now:</span>
              {['Kyoto', 'Paris', 'Rome', 'Bali', 'Tokyo', 'Barcelona'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleSelectDestination(d)}
                  className="px-2.5 py-1 bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600 mb-2">
            Engineered for Real Travelers
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            Everything You Need for a Seamless Journey
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Gemini AI Generation
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time structured daily itineraries generated with Google Gemini models, complete with morning, afternoon, and evening scheduling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Transparent Budgeting
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Granular cost estimates for lodging, dining, transit, and attractions tailored to your exact budget and currency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Smarter Route Logic
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Attractions sequenced geographically to prevent backtracking, with integrated Google Maps links and rainy-day backups.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Bookmark className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Save, Refine & Export
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Persist trips to PostgreSQL, refine with conversational prompts like "make it cheaper", and export to PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Destination Inspiration Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600 mb-2">
              Handpicked Inspiration
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Featured Global Destinations
            </h3>
          </div>
          <button
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 self-start sm:self-auto group cursor-pointer"
          >
            <span>Create Custom Plan</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_DESTINATIONS.map((dest) => (
            <div
              key={dest.city}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
              onClick={() => handleSelectDestination(`${dest.city}, ${dest.country}`)}
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={`${dest.city}, ${dest.country}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-xs font-medium">
                  {dest.duration}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-semibold">
                  Est. {dest.budgetEst}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {dest.city}
                    </h4>
                    <span className="text-xs font-medium text-slate-500">
                      {dest.country}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-brand-600 group-hover:underline flex items-center gap-1">
                    Plan Trip <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl max-w-7xl mx-4 sm:mx-6 lg:mx-auto p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="max-w-3xl mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-brand-400 mb-2">
            Effortless Planning
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            From Idea to Itinerary in 3 Simple Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 text-brand-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="text-lg font-bold text-white">Enter Your Parameters</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Select destination, dates, budget, preferred pace, and specific interests from culture to culinary adventures.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 text-brand-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="text-lg font-bold text-white">Gemini Synthesizes Itinerary</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our backend invokes Google Gemini models to construct an optimized day-by-day plan with attractions, timings, and map queries.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 text-brand-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="text-lg font-bold text-white">Refine, Save & Travel</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Customize via natural language chat ("Make day 2 more relaxed"), save to PostgreSQL, or download as a PDF for offline travel.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            * All generated costs, timings, and schedules are transparent estimates. TripGenius AI does not claim verified bookings.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-brand-500/20 shrink-0 cursor-pointer"
          >
            Start Planning Now
          </button>
        </div>
      </section>
    </div>
  );
};
