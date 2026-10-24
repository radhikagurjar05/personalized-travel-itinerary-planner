import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Trash2, 
  Edit3, 
  Eye, 
  PlusCircle, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { SavedItinerary, User } from '../types';

interface DashboardPageProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onOpenAuth }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rename Modal State
  const [renamingTrip, setRenamingTrip] = useState<SavedItinerary | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [savingRename, setSavingRename] = useState(false);

  // Delete Confirmation State
  const [deletingTrip, setDeletingTrip] = useState<SavedItinerary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listItineraries();
      setTrips(res.itineraries || []);
    } catch (err: any) {
      setError(err.message || 'Could not load your saved trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleOpenRename = (trip: SavedItinerary) => {
    setRenamingTrip(trip);
    setNewTitle(trip.title);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingTrip || !newTitle.trim()) return;

    setSavingRename(true);
    try {
      await api.updateItinerary(renamingTrip.id, { title: newTitle.trim() });
      setTrips((prev) =>
        prev.map((t) => (t.id === renamingTrip.id ? { ...t, title: newTitle.trim() } : t))
      );
      setRenamingTrip(null);
    } catch (err: any) {
      alert(err.message || 'Failed to rename trip.');
    } finally {
      setSavingRename(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTrip) return;
    setDeleting(true);
    try {
      await api.deleteItinerary(deletingTrip.id);
      setTrips((prev) => prev.filter((t) => t.id !== deletingTrip.id));
      setDeletingTrip(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Saved Trips
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user
              ? `Manage and export your personalized itineraries, ${user.name.split(' ')[0]}.`
              : 'Viewing saved itineraries on this browser. Sign in to sync across devices.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Sign In to Sync
            </button>
          )}

          <button
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading your saved itineraries from PostgreSQL...</p>
        </div>
      ) : trips.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Saved Trips Yet</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            You haven't saved any itineraries to your account yet. Fill out our trip planner to generate a tailored itinerary in seconds!
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="mt-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Your First Trip</span>
          </button>
        </div>
      ) : (
        /* Trips Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    {trip.duration_days} Days ({trip.start_date})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize text-[11px] font-semibold">
                    {trip.travel_pace}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {trip.title}
                </h3>

                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{trip.destination}</span>
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Est. Budget:</span>
                  <span className="font-bold text-emerald-700">
                    {trip.currency} {trip.budget?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => navigate(`/itinerary?id=${trip.id}`)}
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenRename(trip)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                    title="Rename trip"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingTrip(trip)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Delete trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      {renamingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Rename Trip</h3>
            <form onSubmit={handleSaveRename} className="space-y-4">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingTrip(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRename}
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingRename ? 'Saving...' : 'Save Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delete Itinerary?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deletingTrip.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTrip(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Keep Trip
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
