import React from 'react';
import { Shield, PlusCircle, Search, MapPin, LayoutDashboard, Home } from 'lucide-react';

export function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
                CivicAlert
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 ml-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                City Infrastructure
              </span>
            </div>
          </div>

          {/* Nav Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Overview & Feed
            </button>

            <button
              onClick={() => onNavigate('track')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'track'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Complaint
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'admin'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Authority Portal
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('report')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center py-1 ${currentPage === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => onNavigate('report')}
            className={`flex flex-col items-center py-1 ${currentPage === 'report' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report</span>
          </button>
          <button
            onClick={() => onNavigate('track')}
            className={`flex flex-col items-center py-1 ${currentPage === 'track' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center py-1 ${currentPage === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Authority</span>
          </button>
        </div>

      </div>
    </header>
  );
}
