import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { healthAPI } from '../../services/api';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

export default function ProofToJusticeOverview({ setActiveTab }) {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const res = await healthAPI.check();
        if (mounted) {
          setHealth(res.data);
          setHealthLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setHealth({
            status: 'offline',
            error: err.message
          });
          setHealthLoading(false);
        }
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Live System Diagnostics Ribbon */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-purple-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              System Telemetry & Zero-Setup Diagnostics
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${health?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="font-mono text-slate-300">
              API: {health?.status === 'online' ? 'Connected (200 OK)' : 'Connecting...'}
            </span>
            {health?.database?.isInMemory && (
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50 text-[10px] font-mono">
                Resilient Memory DB
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Node Environment</span>
            <span className="font-mono text-slate-200">Express + Vite + Hardhat</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Database Engine</span>
            <span className="font-mono text-teal-300">
              {health?.database?.connected ? 'MongoDB Active' : 'Fallback Engine'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Blockchain Target</span>
            <span className="font-mono text-purple-300">Hardhat (Local / Amoy)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Active Identity</span>
            <span className="font-mono text-amber-300">
              {isAuthenticated ? `${user?.fullName} (${user?.pseudonymId})` : 'Guest / Demo Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Why NIRBHAYA X Differentiator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-purple-800/40 transition">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            Chain-of-Custody Invalidation Solved
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            In standard cases, digital evidence is rejected in court due to accusations of manipulation. NIRBHAYA X anchors client-side SHA-256 hashes to the blockchain before police or third parties touch it, fulfilling Section 65B/BSA 63 admissibility criteria.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-teal-800/40 transition">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            Ethical & Non-Accusatory AI
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strictly NO facial recognition and NO biometric profiling. The AI microservice counts individuals present, extracts video frames and audio transcripts, and drafts purely factual, objective police complaints with zero bias.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-rose-800/40 transition">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            The 1-Click Judge Demo Path
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluating NIRBHAYA X takes under 3 minutes: trigger an SOS → inspect the AI analysis of incident media → verify the on-chain hash → simulate a 1-byte file tamper → download the QR-verified complaint PDF.
          </p>
          <button
            onClick={() => setActiveTab('journey')}
            className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-rose-300 hover:text-rose-200"
          >
            <span>Launch Case Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}

