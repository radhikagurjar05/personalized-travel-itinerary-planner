import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  Compass, 
  Printer, 
  Download, 
  Bookmark, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Utensils, 
  CloudRain, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Send, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import type { ItineraryData, TripFormInputs } from '../types';

export const ItineraryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Itinerary state
  const [itinerary, setItinerary] = useState<ItineraryData | null>(location.state?.itinerary || null);
  const [originalRequest] = useState<TripFormInputs | null>(location.state?.originalRequest || null);
  const [savedId, setSavedId] = useState<string | null>(searchParams.get('id') || null);
  
  // UI States
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [exportingPdf, setExportingPdf] = useState(false);

  // If page was loaded directly with ?id=..., fetch from backend
  useEffect(() => {
    const tripId = searchParams.get('id');
    if (tripId && !itinerary) {
      setLoadingTrip(true);
      api.getItinerary(tripId)
        .then((res) => {
          setItinerary(res.itinerary.itinerary_data);
          setSavedId(res.itinerary.id);
        })
        .catch((err) => {
          setStatusMessage({ text: 'Unable to load the requested trip: ' + err.message, type: 'error' });
        })
        .finally(() => setLoadingTrip(false));
    }
  }, [searchParams]);

  // Expand all days by default if fewer than 5 days
  useEffect(() => {
    if (itinerary && itinerary.days) {
      const initial: Record<number, boolean> = {};
      itinerary.days.forEach((d) => {
        initial[d.day_number] = true;
      });
      setExpandedDays(initial);
    }
  }, [itinerary]);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: itinerary.trip_title,
        destination: itinerary.destination,
        starting_city: originalRequest?.starting_city || null,
        start_date: itinerary.start_date,
        end_date: itinerary.end_date,
        duration_days: itinerary.duration_days,
        travelers_count: itinerary.travelers_count,
        budget: itinerary.budget_summary?.total_estimated_cost || 0,
        currency: itinerary.budget_summary?.currency || 'USD',
        travel_pace: itinerary.travel_pace,
        interests: originalRequest?.travel_interests || [],
        preferences: originalRequest || {},
        itinerary_data: itinerary,
      };

      const res = await api.saveItinerary(payload);
      setSavedId(res.itinerary.id);
      setSaveSuccess(true);
      setStatusMessage({ text: 'Trip saved successfully to your dashboard!', type: 'success' });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save itinerary', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary || !refinementPrompt.trim()) return;

    setRefining(true);
    setStatusMessage(null);

    try {
      const res = await api.refineItinerary(
        itinerary,
        refinementPrompt.trim(),
        savedId || undefined,
        originalRequest || undefined
      );

      setItinerary(res.data);
      setRefinementPrompt('');
      setStatusMessage({
        text: `Itinerary revised successfully based on: "${refinementPrompt}"`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Refinement failed', type: 'error' });
    } finally {
      setRefining(false);
    }
  };

  const handleQuickRefinement = (promptText: string) => {
    setRefinementPrompt(promptText);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('printable-itinerary');
    if (!element) return;

    setExportingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${itinerary?.trip_title.replace(/[^a-zA-Z0-9]/g, '_') || 'TripGenius_Itinerary'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  if (loadingTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Loading your saved itinerary...</h3>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Itinerary Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          You haven't generated an itinerary yet, or the page was refreshed. Let's create one now!
        </p>
        <button
          onClick={() => navigate('/plan')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          Plan a New Trip
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top action toolbar (Hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/plan')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Preferences & Regenerate</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Print or save as PDF via system dialog"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Export clean PDF file"
          >
            {exportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          {/* Save Trip button */}
          <button
            onClick={handleSaveTrip}
            disabled={saving || saveSuccess}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-500 text-white'
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved in My Trips' : 'Save Trip'}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`no-print p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Printable Itinerary Content */}
      <div id="printable-itinerary" className="space-y-8 bg-transparent">
        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-100/40 via-emerald-50/20 to-transparent -z-10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/70">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 Planned
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold capitalize">
              {itinerary.travel_pace} Pace
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {itinerary.trip_title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            {itinerary.overview}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Destination
              </span>
              <p className="font-bold text-slate-900 text-sm">{itinerary.destination}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-600" /> Travel Dates
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {itinerary.start_date} → {itinerary.end_date}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-600" /> Travelers
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {itinerary.travelers_count} Explorer{itinerary.travelers_count > 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Total Estimated Cost
              </span>
              <p className="font-bold text-emerald-700 text-sm">
                {itinerary.budget_summary?.currency}{' '}
                {itinerary.budget_summary?.total_estimated_cost?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Breakdown Summary */}
        {itinerary.budget_summary && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Estimated Budget Breakdown</span>
              </h2>
              <span className="text-xs text-slate-600 font-medium">
                Currency: {itinerary.budget_summary.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase">Lodging</span>
                <span className="text-sm font-bold text-slate-900">
                  {itinerary.budget_summary.currency} {itinerary.budget_summary.accommodation_total}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase">Dining</span>
                <span className="text-sm font-bold text-slate-900">
                  {itinerary.budget_summary.currency} {itinerary.budget_summary.food_total}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase">Activities</span>
                <span className="text-sm font-bold text-slate-900">
                  {itinerary.budget_summary.currency} {itinerary.budget_summary.activities_total}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase">Transit</span>
                <span className="text-sm font-bold text-slate-900">
                  {itinerary.budget_summary.currency} {itinerary.budget_summary.transport_total}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase">Misc / Buffer</span>
                <span className="text-sm font-bold text-slate-900">
                  {itinerary.budget_summary.currency} {itinerary.budget_summary.miscellaneous_total}
                </span>
              </div>
            </div>

            {itinerary.budget_summary.cost_breakdown_note && (
              <p className="text-xs text-slate-600 italic">
                * {itinerary.budget_summary.cost_breakdown_note}
              </p>
            )}
          </div>
        )}

        {/* Day-by-Day Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Day-by-Day Detailed Itinerary
            </h2>
            <div className="no-print flex items-center gap-2">
              <button
                onClick={() => {
                  const all: Record<number, boolean> = {};
                  itinerary.days.forEach((d) => (all[d.day_number] = true));
                  setExpandedDays(all);
                }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setExpandedDays({})}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {itinerary.days.map((day) => {
            const isExpanded = !!expandedDays[day.day_number];

            return (
              <div
                key={day.day_number}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Day Header Accordion Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(day.day_number)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-extrabold text-lg flex items-center justify-center shrink-0 border border-brand-100">
                      D{day.day_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                          Day {day.day_number} • {day.date}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          Est. Daily: {itinerary.budget_summary?.currency} {day.estimated_daily_cost}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        {day.theme}
                      </h3>
                    </div>
                  </div>

                  <div className="no-print p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Day Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 space-y-6 border-t border-slate-100">
                    {/* Time Slots: Morning, Afternoon, Evening */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Morning Slot */}
                      {day.morning && (
                        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/80 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-2">
                              <span className="flex items-center gap-1.5">
                                <Sun className="w-4 h-4 text-amber-600" /> Morning
                              </span>
                              <span className="text-[11px] font-normal text-amber-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {day.morning.suggested_duration}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mb-1">
                              {day.morning.attraction_name}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {day.morning.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-amber-100">
                            {day.morning.tips && (
                              <p className="text-[11px] text-amber-900 bg-white/70 p-2 rounded-lg">
                                💡 {day.morning.tips}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Cost: {itinerary.budget_summary?.currency} {day.morning.estimated_cost}
                              </span>
                              {day.morning.map_search_url && (
                                <a
                                  href={day.morning.map_search_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                                >
                                  <span>Map</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Afternoon Slot */}
                      {day.afternoon && (
                        <div className="bg-sky-50/50 rounded-2xl p-5 border border-sky-100/80 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-sky-800 mb-2">
                              <span className="flex items-center gap-1.5">
                                <Sunset className="w-4 h-4 text-sky-600" /> Afternoon
                              </span>
                              <span className="text-[11px] font-normal text-sky-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {day.afternoon.suggested_duration}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mb-1">
                              {day.afternoon.attraction_name}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {day.afternoon.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-sky-100">
                            {day.afternoon.tips && (
                              <p className="text-[11px] text-sky-900 bg-white/70 p-2 rounded-lg">
                                💡 {day.afternoon.tips}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Cost: {itinerary.budget_summary?.currency} {day.afternoon.estimated_cost}
                              </span>
                              {day.afternoon.map_search_url && (
                                <a
                                  href={day.afternoon.map_search_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                                >
                                  <span>Map</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Evening Slot */}
                      {day.evening && (
                        <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/80 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-indigo-800 mb-2">
                              <span className="flex items-center gap-1.5">
                                <Moon className="w-4 h-4 text-indigo-600" /> Evening
                              </span>
                              <span className="text-[11px] font-normal text-indigo-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {day.evening.suggested_duration}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mb-1">
                              {day.evening.attraction_name}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {day.evening.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-indigo-100">
                            {day.evening.tips && (
                              <p className="text-[11px] text-indigo-900 bg-white/70 p-2 rounded-lg">
                                💡 {day.evening.tips}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Cost: {itinerary.budget_summary?.currency} {day.evening.estimated_cost}
                              </span>
                              {day.evening.map_search_url && (
                                <a
                                  href={day.evening.map_search_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                                >
                                  <span>Map</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meal & Alternative Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      {day.meal_recommendations && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-brand-600" /> Meal Picks
                          </span>
                          {day.meal_recommendations.lunch && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">Lunch:</span> {day.meal_recommendations.lunch}
                            </p>
                          )}
                          {day.meal_recommendations.dinner && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">Dinner:</span> {day.meal_recommendations.dinner}
                            </p>
                          )}
                        </div>
                      )}

                      {day.rainy_day_alternative && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <CloudRain className="w-3.5 h-3.5 text-sky-600" /> Weather Alternative
                          </span>
                          <p className="text-slate-600">{day.rainy_day_alternative}</p>
                          {day.route_optimization_tip && (
                            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                              📍 <span className="font-semibold">Route Tip:</span> {day.route_optimization_tip}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Local Secrets, Packing & Travel Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Cuisine Highlights */}
          {itinerary.local_cuisine_recommendations && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-600" /> Must-Try Local Cuisine
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {itinerary.local_cuisine_recommendations.map((food, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing suggestions */}
          {itinerary.packing_suggestions && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Packing Essentials
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {itinerary.packing_suggestions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practical & Safety Tips */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Practical Advice
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {itinerary.practical_tips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Assumptions & Limitations Note */}
        {itinerary.assumptions_and_limitations && (
          <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Transparency Notice:</span>{' '}
            {itinerary.assumptions_and_limitations}
          </div>
        )}
      </div>

      {/* Natural Language Refinement Chatbox (Hidden on print) */}
      <section className="no-print bg-white rounded-3xl p-6 sm:p-8 border border-brand-200 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Refine Your Itinerary with AI
            </h3>
            <p className="text-xs text-slate-500">
              Tell Gemini in plain English how you want to adjust this trip.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Make this trip cheaper',
            'Add more historical places',
            'Make the pace more relaxed',
            'Include more vegetarian options',
            'Replace day 2 afternoon with outdoor parks',
            'Reduce travel time between activities',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => handleQuickRefinement(promptText)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition-colors cursor-pointer"
            >
              + {promptText}
            </button>
          ))}
        </div>

        {/* Refinement input form */}
        <form onSubmit={handleRefine} className="flex gap-2">
          <input
            type="text"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="e.g. Add a cooking class on day 1 or find cheaper dining spots..."
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <button
            type="submit"
            disabled={refining || !refinementPrompt.trim()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {refining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Revising...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Revise</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
};
