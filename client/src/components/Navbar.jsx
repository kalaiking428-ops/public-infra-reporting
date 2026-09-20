import React from 'react';
import { 
  Shield, PlusCircle, Search, LayoutDashboard, Home, 
  LogIn, LogOut, User, FileText, CheckCircle2 
} from 'lucide-react';

export function Navbar({ currentPage, onNavigate, currentUser, onLogout }) {
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
                  ? 'bg-blue-50 text-blue-700 font-semibold'
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
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Complaint
            </button>

            {/* My Reports tab (shown when citizen is logged in) */}
            {currentUser && currentUser.role === 'citizen' && (
              <button
                onClick={() => onNavigate('my_reports')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'my_reports'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                My Reports
              </button>
            )}

            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Authority Portal
            </button>
          </nav>

          {/* Right Action CTAs & Auth Controls */}
          <div className="flex items-center gap-3">
            
            {/* Report Button */}
            <button
              onClick={() => onNavigate('report')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  onClick={() => onNavigate(currentUser.role === 'citizen' ? 'my_reports' : 'admin')}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded-xl transition"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    currentUser.role === 'admin' || currentUser.role === 'officer'
                      ? 'bg-indigo-600 ring-2 ring-indigo-200'
                      : 'bg-blue-600 ring-2 ring-blue-200'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      currentUser.role === 'admin' ? 'text-indigo-600' : 'text-blue-600'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Bottom Navigation Bar */}
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

          {currentUser && currentUser.role === 'citizen' ? (
            <button
              onClick={() => onNavigate('my_reports')}
              className={`flex flex-col items-center py-1 ${currentPage === 'my_reports' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center py-1 ${currentPage === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Authority</span>
            </button>
          )}

          <button
            onClick={() => currentUser ? onLogout() : onNavigate('login')}
            className={`flex flex-col items-center py-1 ${currentPage === 'login' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            {currentUser ? <LogOut className="w-4 h-4 text-rose-500" /> : <User className="w-4 h-4" />}
            <span>{currentUser ? 'Logout' : 'Login'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
