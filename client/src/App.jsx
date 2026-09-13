import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackIssuePage } from './pages/TrackIssuePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Shield, PhoneCall, Mail, ExternalLink, Heart } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'report', 'track', 'admin'
  const [selectedTicketId, setSelectedTicketId] = useState('');

  const navigateTo = (page, ticketId = '') => {
    setCurrentPage(page);
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} onNavigate={(p) => navigateTo(p)} />

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
          />
        )}

        {currentPage === 'track' && (
          <TrackIssuePage 
            ticketId={selectedTicketId}
            onNavigate={(p) => navigateTo(p)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage 
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
                  <button onClick={() => navigateTo('admin')} className="hover:text-blue-600 transition font-medium text-indigo-600">
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
                All complaints logged in this portal are public public-records. Work orders, assigned field personnel, and photographic evidence before and after resolution are accessible to all residents.
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
