import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackIssuePage } from './pages/TrackIssuePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { Shield, PhoneCall, Mail, ExternalLink, Heart, Lock } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'report', 'track', 'admin', 'login', 'my_reports'
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Restore user session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('civicalert_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('civicalert_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civicalert_user');
    setCurrentPage('home');
  };

  const navigateTo = (page, ticketId = '') => {
    if (page === 'my_reports' && !currentUser) {
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Navigation */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={(p) => navigateTo(p)} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={(p) => navigateTo(p)}
            onSelectTicket={(id) => navigateTo('track', id)}
          />
        )}

        {currentPage === 'report' && (
          <ReportIssuePage 
            onNavigate={(p) => navigateTo(p)}
            onSelectTicket={(id) => navigateTo('track', id)}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'track' && (
          <TrackIssuePage 
            ticketId={selectedTicketId}
            onNavigate={(p) => navigateTo(p)}
          />
        )}

        {currentPage === 'admin' && (
          // If accessing Admin without admin/officer login, offer prompt or show with alert
          !currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'officer') ? (
            <div className="max-w-md mx-auto py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Municipal Authority Access Required
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The operations console is reserved for verified municipal department officers and supervisors. Please sign in with your official account.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Sign In as Officer / Admin
                </button>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Back to Community Feed
                </button>
              </div>
            </div>
          ) : (
            <AdminDashboardPage 
              onSelectTicket={(id) => navigateTo('track', id)}
            />
          )
        )}

        {currentPage === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onNavigate={(p) => navigateTo(p)}
          />
        )}

        {currentPage === 'my_reports' && (
          <MyReportsPage
            user={currentUser}
            onNavigate={(p) => navigateTo(p)}
            onSelectTicket={(id) => navigateTo('track', id)}
          />
        )}

      </main>

      {/* Civic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900">CivicAlert</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized digital platform bridging citizens and municipal administration for rapid infrastructure repair and maintenance.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Quick Actions</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <button onClick={() => navigateTo('report')} className="hover:text-blue-600 transition">
                    Report New Grievance
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('track')} className="hover:text-blue-600 transition">
                    Track Existing Ticket
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('home')} className="hover:text-blue-600 transition">
                    Public City Map & Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo(currentUser ? 'admin' : 'login')} className="hover:text-blue-600 transition font-medium text-indigo-600">
                    Municipal Officer Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Emergency Hotlines */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Emergency Civic Hotlines</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Road Hazards: 1800-201-ROAD</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sanitation & Waste: 1800-201-WASTE</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Electrical & Lighting: 1800-201-LIGHT</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                  <span>Water & Drainage: 1800-201-WATER</span>
                </li>
              </ul>
            </div>

            {/* Standards & Transparency */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Civic Transparency</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All complaints logged in this portal are public records. Work orders, assigned field personnel, and photographic evidence before and after resolution are accessible to all residents.
              </p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} CivicAlert Municipal Infrastructure Management System.</p>
            <p className="flex items-center gap-1">
              Built for civic improvement & community wellbeing
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
