import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck2,
  Scale,
  HeartHandshake,
  CheckCircle,
  Radio,
  FileText
} from 'lucide-react';

export default function HeroSection({ setActiveTab, onOpenAuth }) {
  const { t } = useLanguage();
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Tagline Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-xs text-purple-300 font-medium shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>{t.hero.badge}</span>
          </div>
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
            <span>DEMO_MODE=true</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-teal-300">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.desc}
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('sos')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-900/40 hover:shadow-rose-900/60 flex items-center justify-center space-x-2 transform transition active:scale-95"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>{t.hero.sosBtn}</span>
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 hover:text-white font-semibold text-sm transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <ArrowRight className="w-4 h-4 text-teal-400" />
              <span>{t.hero.explorePipeline}</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => demoLogin('user')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-sm font-semibold transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.hero.tryDemo}</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Stage Hero Pipeline Preview */}
        <div className="mt-14 pt-8 border-t border-purple-900/20">
          <div className="text-center mb-6">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              The 5-Stage Proof-to-Justice Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Stage 1 */}
            <div
              onClick={() => setActiveTab('sos')}
              className="glass-card p-4 rounded-xl cursor-pointer hover:border-rose-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-rose-400">STAGE 01</span>
                <Radio className="w-4 h-4 text-rose-400 group-hover:animate-pulse" />
              </div>
              <h4 className="font-bold text-sm text-white">{t.stages.stage1.name}</h4>
              <p className="text-xs text-rose-300/80 font-medium mb-1.5">{t.stages.stage1.module}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{t.stages.stage1.desc}</p>
            </div>

            {/* Stage 2 */}
            <div
              onClick={() => setActiveTab('ai')}
              className="glass-card p-4 rounded-xl cursor-pointer hover:border-purple-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-purple-400">STAGE 02</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{t.stages.stage2.name}</h4>
              <p className="text-xs text-purple-300/80 font-medium mb-1.5">{t.stages.stage2.module}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{t.stages.stage2.desc}</p>
            </div>

            {/* Stage 3 */}
            <div
              onClick={() => setActiveTab('vault')}
              className="glass-card p-4 rounded-xl cursor-pointer hover:border-teal-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-teal-400">STAGE 03</span>
                <Lock className="w-4 h-4 text-teal-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{t.stages.stage3.name}</h4>
              <p className="text-xs text-teal-300/80 font-medium mb-1.5">{t.stages.stage3.module}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{t.stages.stage3.desc}</p>
            </div>

            {/* Stage 4 */}
            <div
              onClick={() => setActiveTab('justice')}
              className="glass-card p-4 rounded-xl cursor-pointer hover:border-indigo-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-400">STAGE 04</span>
                <Scale className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{t.stages.stage4.name}</h4>
              <p className="text-xs text-indigo-300/80 font-medium mb-1.5">{t.stages.stage4.module}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{t.stages.stage4.desc}</p>
            </div>

            {/* Stage 5 */}
            <div
              onClick={() => setActiveTab('medicare')}
              className="glass-card p-4 rounded-xl cursor-pointer hover:border-emerald-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-400">STAGE 05</span>
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{t.stages.stage5.name}</h4>
              <p className="text-xs text-emerald-300/80 font-medium mb-1.5">{t.stages.stage5.module}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{t.stages.stage5.desc}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

