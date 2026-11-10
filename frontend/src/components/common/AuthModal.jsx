import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Sparkles, Lock, Mail, User, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, demoLogin, error, loading } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState('demo'); // 'demo' | 'login' | 'register'
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  });
  const [localMessage, setLocalMessage] = useState(null);

  if (!isOpen) return null;

  const handleDemoSelect = async (role) => {
    setLocalMessage(null);
    const res = await demoLogin(role);
    if (res.success) {
      setLocalMessage(t.auth.successLogin);
      setTimeout(() => {
        onClose();
        setLocalMessage(null);
      }, 700);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null);
    const res = await login(loginForm.email, loginForm.password);
    if (res.success) {
      setLocalMessage(t.auth.successLogin);
      setTimeout(() => {
        onClose();
        setLocalMessage(null);
      }, 700);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null);
    const res = await register(regForm);
    if (res.success) {
      setLocalMessage(t.auth.successRegister);
      setTimeout(() => {
        onClose();
        setLocalMessage(null);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/40 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-purple-950/60 to-slate-900 border-b border-purple-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Secure Access Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {tab === 'demo' ? t.auth.demoTitle : tab === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.auth.pseudonymNotice}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
              tab === 'demo'
                ? 'text-teal-300 border-b-2 border-teal-400 bg-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Demo</span>
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-semibold transition ${
              tab === 'login'
                ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.nav.login}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-semibold transition ${
              tab === 'register'
                ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.nav.register}
          </button>
        </div>

        {/* Feedback Messages */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}
          {localMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{localMessage}</span>
            </div>
          )}
        </div>

        {/* Tab 1: 1-Click Judge Demo Mode */}
        {tab === 'demo' && (
          <div className="p-6 space-y-3">
            <p className="text-xs text-slate-300 mb-2">
              {t.auth.demoNotice}
            </p>
            
            <button
              onClick={() => handleDemoSelect('user')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/40 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-bold text-purple-200 group-hover:text-white">
                  👩 Priya Sharma
                </div>
                <div className="text-xs text-slate-400">
                  Citizen / Victim Profile • Ready with Safety Circle & Incident
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-purple-800 text-purple-200 font-mono">
                Victim Role
              </span>
            </button>

            <button
              onClick={() => handleDemoSelect('authority')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-bold text-teal-200 group-hover:text-white">
                  👮 Inspector Rajesh Sharma
                </div>
                <div className="text-xs text-slate-400">
                  Law Enforcement / Police Station Investigation Officer
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-teal-900 text-teal-300 font-mono">
                Authority Role
              </span>
            </button>

            <button
              onClick={() => handleDemoSelect('admin')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-bold text-slate-200 group-hover:text-white">
                  🛡️ System Administrator
                </div>
                <div className="text-xs text-slate-400">
                  Platform Oversight, Node Telemetry & Audit Logs
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                Admin Role
              </span>
            </button>
          </div>
        )}

        {/* Tab 2: Standard Login */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.emailPlaceholder}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="e.g. priya.sharma@nirbhayax.demo"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.passwordPlaceholder}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-teal-600 hover:from-purple-600 hover:to-teal-500 text-white rounded-lg text-sm font-semibold transition"
            >
              {loading ? 'Authenticating...' : t.auth.submitLogin}
            </button>
          </form>
        )}

        {/* Tab 3: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.namePlaceholder}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  placeholder="Ananya Verma"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.emailPlaceholder}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="ananya@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.phonePlaceholder}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.auth.passwordPlaceholder}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-700 to-teal-600 hover:from-purple-600 hover:to-teal-500 text-white rounded-lg text-sm font-semibold transition"
            >
              {loading ? 'Creating Account...' : t.auth.submitRegister}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

