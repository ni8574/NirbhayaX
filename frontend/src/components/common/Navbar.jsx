import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDisguise } from '../../context/DisguiseContext';
import {
  Shield,
  ShieldAlert,
  Languages,
  EyeOff,
  User,
  LogOut,
  Sparkles,
  Radio,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ onOpenAuth, activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { toggleDisguise } = useDisguise();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'sos', label: t.nav.sos },
    { id: 'ai', label: t.nav.ai },
    { id: 'vault', label: t.nav.vault },
    { id: 'justice', label: t.nav.justice },
    { id: 'medicare', label: t.nav.medicare },
    { id: 'journey', label: t.nav.journey }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-teal-500 p-0.5 shadow-lg shadow-purple-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-100 to-teal-300">
                  NIRBHAYA <span className="text-teal-400">X</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {t.brand.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Center */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Exit Disguise */}
            <button
              onClick={toggleDisguise}
              title="Quick Exit (Disguise Mode)"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.quickExit}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch Language (English / हिन्दी)"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              <Languages className="w-3.5 h-3.5 text-teal-400" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-slate-200">{user?.fullName}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-mono px-1 rounded bg-teal-900/60 text-teal-300 border border-teal-700/40">
                      {user?.pseudonymId || 'NX-USER'}
                    </span>
                    <span className="text-[10px] text-purple-400 capitalize">({user?.role})</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title={t.nav.logout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => demoLogin('user')}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.nav.demoJudge}</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition"
                >
                  {t.nav.login}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-900/30 bg-slate-950 px-4 py-3 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                demoLogin('user');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-teal-600 text-white text-xs font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.nav.demoJudge}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

