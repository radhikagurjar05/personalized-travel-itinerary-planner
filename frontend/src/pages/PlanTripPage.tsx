import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Heart, 
  Hotel, 
  Utensils, 
  Accessibility, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import type { TripFormInputs } from '../types';

const INTEREST_OPTIONS = [
  { id: 'Nature and adventure', label: 'Nature & Adventure', icon: '🌲' },
  { id: 'Historical places', label: 'Historical Places', icon: '🏛️' },
  { id: 'Food and local cuisine', label: 'Food & Local Cuisine', icon: '🍜' },
  { id: 'Culture and museums', label: 'Culture & Museums', icon: '🎨' },
  { id: 'Shopping', label: 'Shopping & Bazaars', icon: '🛍️' },
  { id: 'Beaches', label: 'Beaches & Coastal', icon: '🏖️' },
  { id: 'Spiritual destinations', label: 'Spiritual & Sacred Sites', icon: '⛩️' },
  { id: 'Nightlife', label: 'Nightlife & Live Music', icon: '🎶' },
  { id: 'Family activities', label: 'Family-Friendly Fun', icon: '🎠' },
];

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD'];

const LOADING_MESSAGES = [
  'Querying Google Gemini AI for destination intelligence...',
  'Curating morning, afternoon, and evening attractions...',
  'Minimizing transit travel time and optimizing routing...',
  'Calculating realistic budget estimates and culinary picks...',
  'Preparing rainy day alternatives and local tips...',
  'Finalizing your personalized day-by-day itinerary...'
];

// Helper to format date YYYY-MM-DD
const getDefaultStartDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14); // 2 weeks out
  return d.toISOString().split('T')[0];
};

const getDefaultEndDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 18); // 4 day trip
  return d.toISOString().split('T')[0];
};

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [startingCity, setStartingCity] = useState('');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [budget, setBudget] = useState<number>(2000);
  const [currency, setCurrency] = useState('USD');
  const [travelPace, setTravelPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical places', 
    'Food and local cuisine', 
    'Culture and museums'
  ]);
  const [accommodation, setAccommodation] = useState('Balanced / Mid-range Hotel');
  const [transportation, setTransportation] = useState('Public transit & walking');
  const [dietary, setDietary] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [notes, setNotes] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotate loading tips
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  // Calculate duration
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const durationDays = calculateDays();

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!destination.trim()) {
      setError('Please specify a destination city, region, or country.');
      return;
    }
    if (durationDays < 1) {
      setError('Return date must be on or after the departure date.');
      return;
    }
    if (durationDays > 30) {
      setError('Trip duration cannot exceed 30 days.');
      return;
    }
    if (budget <= 0) {
      setError('Please enter a realistic trip budget greater than 0.');
      return;
    }

    const payload: TripFormInputs = {
      destination: destination.trim(),
      starting_city: startingCity.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
      travelers_count: Number(travelersCount),
      budget: Number(budget),
      currency,
      travel_interests: selectedInterests,
      travel_pace: travelPace,
      accommodation_preference: accommodation,
      transportation_preference: transportation,
      dietary_requirements: dietary.trim() || undefined,
      accessibility_requirements: accessibility.trim() || undefined,
      additional_preferences: notes.trim() || undefined,
    };

    setLoading(true);

    try {
      const response = await api.generateItinerary(payload);
      if (response && response.data) {
        navigate('/itinerary', {
          state: {
            itinerary: response.data,
            originalRequest: payload,
          },
        });
      } else {
        throw new Error('Received empty response from the AI planner.');
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Failed to generate itinerary. Please verify your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailored by Google Gemini AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Craft Your Personalized Itinerary
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Fill in your travel preferences below. Our AI engine builds a realistic, minute-by-minute itinerary optimized for your timeline and budget.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900">Planning Alert</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md">
        {/* Section 1: Destination & Dates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>1. Destination & Travel Dates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Japan or Paris, France"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Starting Location / Departure City
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                  placeholder="e.g. San Francisco, CA or London (Optional)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Departure Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Return Date <span className="text-rose-500">*</span>
                </label>
                {durationDays > 0 && (
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {durationDays} Day{durationDays > 1 ? 's' : ''} ({durationDays - 1} Night{durationDays - 1 !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Group, Budget & Currency */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>2. Travelers & Budget</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Travelers
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Trip Budget
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min={50}
                  step={50}
                  required
                  value={budget}
                  onChange={(e) => setBudget(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Pace & Interests */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>3. Travel Pace & Interests</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Travel Pace
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'relaxed', label: 'Relaxed', desc: '1-2 key activities per day, lots of cafe breaks and downtime' },
                { id: 'balanced', label: 'Balanced', desc: 'Well-spaced sights, leisurely meals, and steady exploration' },
                { id: 'packed', label: 'Packed & Energetic', desc: 'See as much as possible, early starts and vibrant evenings' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setTravelPace(p.id as any)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    travelPace === p.id
                      ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{p.label}</span>
                    {travelPace === p.id && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Travel Interests (Pick any that excite you)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Accommodation & Transport */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Hotel className="w-5 h-5 text-indigo-600" />
            <span>4. Logistics & Style</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Accommodation Preference
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                <option value="Hostel / Budget Lodging">Hostel / Backpacker / Budget Lodging</option>
                <option value="Balanced / Mid-range Hotel">Balanced / Mid-range Hotel & Airbnb</option>
                <option value="Boutique Hotel / B&B">Boutique Hotel / Character B&B</option>
                <option value="Luxury Resort & 5-Star">Luxury Resort & 5-Star Suites</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transportation Preference
              </label>
              <select
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                <option value="Public transit & walking">Public transit (metro/trains/buses) & walking</option>
                <option value="Rental car / Self drive">Rental car / Road trip self-drive</option>
                <option value="Taxis & rideshare">Taxis, rideshares & private drivers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Dietary, Accessibility & Special Notes */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>5. Special Requirements (Optional)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-slate-500" />
                <span>Dietary Needs & Restrictions</span>
              </label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Vegetarian, Halal, Gluten-free, Peanut allergy"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-slate-500" />
                <span>Accessibility & Mobility</span>
              </label>
              <input
                type="text"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="e.g. Wheelchair accessible, avoid steep stairs, stroller-friendly"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Preferences & Wishlist
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Celebrating an anniversary on day 3, prefer independent cafes over chain stores, love photography spots."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            * Generated itineraries include estimated attraction costs, map links, and daily sequencing.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating AI Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Generate My Itinerary</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-500/30 animate-bounce">
              <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Planning Your Journey to {destination || 'your destination'}
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Google Gemini Generative AI
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-brand-700 animate-pulse transition-all">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full w-full animate-[shimmer_2s_infinite]" />
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Please hold on while the model organizes attractions, map references, and realistic schedules.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
