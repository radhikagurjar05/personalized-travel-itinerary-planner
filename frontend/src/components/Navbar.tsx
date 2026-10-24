import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, User as UserIcon, LogOut, PlusCircle } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                TripGenius <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">AI</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-600 -mt-1">
                Google Cloud Gemini
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-brand-600 bg-brand-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/plan"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/plan') ? 'text-brand-600 bg-brand-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Plan Trip
            </Link>
            <Link
              to="/trips"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/trips') ? 'text-brand-600 bg-brand-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Trips
            </Link>
          </nav>

          {/* Action & Auth */}
          <div className="flex items-center gap-3">
            <Link
              to="/plan"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan My Trip</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/trips"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="View your saved trips"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
