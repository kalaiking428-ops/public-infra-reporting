import React, { useState } from 'react';
import { 
  User, Mail, Lock, Phone, Shield, ArrowRight, CheckCircle2, 
  AlertCircle, Sparkles, Building2, Eye, EyeOff, LogIn, UserPlus 
} from 'lucide-react';
import { api } from '../services/api';

export function LoginPage({ onLoginSuccess, onNavigate, returnPage = 'home' }) {
  const [activeTab, setActiveTab] = useState('citizen_login'); // 'citizen_login', 'citizen_register', 'admin_login'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      setSuccessMsg(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onNavigate(returnPage || 'home');
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: 'citizen'
      });
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onNavigate('home');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      if (data.user.role !== 'admin' && data.user.role !== 'officer') {
        setError('This account does not have municipal authority privileges.');
        setLoading(false);
        return;
      }
      setSuccessMsg(`Authority Access Verified: ${data.user.name}`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onNavigate('admin');
      }, 600);
    } catch (err) {
      setError(err.message || 'Official login failed. Check your department credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login Handlers
  const loginAsDemoCitizen = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login('priya.s@example.com', 'citizen123');
      onLoginSuccess(data.user);
      onNavigate(returnPage || 'home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login('admin@citygov.org', 'admin123');
      onLoginSuccess(data.user);
      onNavigate('admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4">
      
      {/* Header card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to CivicAlert
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Public Infrastructure Issue Reporting & Municipal Redressal Portal
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => handleTabSwitch('citizen_login')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'citizen_login'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Citizen Login</span>
          </button>

          <button
            onClick={() => handleTabSwitch('citizen_register')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'citizen_register'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>

          <button
            onClick={() => handleTabSwitch('admin_login')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin_login'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Authority Staff</span>
          </button>
        </div>

        {/* Tab Form Content */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: CITIZEN LOGIN */}
          {activeTab === 'citizen_login' && (
            <form onSubmit={handleCitizenLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya.s@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In as Citizen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('citizen_register')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CITIZEN REGISTRATION */}
          {activeTab === 'citizen_register' && (
            <form onSubmit={handleCitizenRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9840123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Citizen Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('citizen_login')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Log in here
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MUNICIPAL AUTHORITY LOGIN */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 leading-relaxed">
                👮 <strong>Authorized Staff Only:</strong> Sign in with your assigned municipal department credentials to triage, assign work orders, and update incident statuses.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@citygov.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Department Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter official password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Access Authority Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick 1-Click Demo Test Accounts:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={loginAsDemoCitizen}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-left transition group"
            >
              <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600">
                👤 Demo Citizen
              </span>
              <span className="block text-[11px] text-slate-500 font-mono">
                priya.s@example.com
              </span>
            </button>

            <button
              type="button"
              onClick={loginAsDemoAdmin}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition group"
            >
              <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                👮 Demo Admin Officer
              </span>
              <span className="block text-[11px] text-slate-500 font-mono">
                admin@citygov.org
              </span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
