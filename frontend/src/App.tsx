import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { PlanTripPage } from './pages/PlanTripPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { DashboardPage } from './pages/DashboardPage';
import { api } from './services/api';
import { User } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if user session exists in local storage / backend
    api.getMe()
      .then((res) => {
        if (res.authenticated && res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        // Guest mode
      });
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plan" element={<PlanTripPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route
              path="/trips"
              element={
                <DashboardPage
                  user={user}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
