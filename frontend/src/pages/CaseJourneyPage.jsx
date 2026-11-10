import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ShieldAlert,
  Lock,
  Scale,
  HeartPulse,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  PlayCircle,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import CaseProgressTracker from '../components/journey/CaseProgressTracker';
import JudgeDemoFlowModal from '../components/journey/JudgeDemoFlowModal';
import { caseAPI } from '../services/api';

export default function CaseJourneyPage({ setActiveTab }) {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-2026-METRO-01');
  const [dossier, setDossier] = useState(null);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDossier(selectedCaseId);
    }
  }, [selectedCaseId]);

  const loadCases = async () => {
    try {
      const res = await caseAPI.getAllCases();
      if (res.data?.success && res.data.data?.length > 0) {
        setCases(res.data.data);
        if (!selectedCaseId) {
          setSelectedCaseId(res.data.data[0].caseId);
        }
      }
    } catch (err) {
      console.warn('Failed to load cases:', err);
    }
  };

  const loadCaseDossier = async (caseId) => {
    setLoading(true);
    try {
      const res = await caseAPI.getCaseDetails(caseId);
      if (res.data?.success) {
        setDossier(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadJudgeDemo = async () => {
    setLoading(true);
    try {
      const res = await caseAPI.seedJudgeDemo();
      if (res.data?.success) {
        setSelectedCaseId(res.data.data.caseId);
        await loadCaseDossier(res.data.data.caseId);
        setIsJudgeModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateStage = (moduleKey) => {
    setActiveTab(moduleKey);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>CORE ENGINE • PROOF-TO-JUSTICE</span>
              </span>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-700/50">
                1 Incident = 1 Case
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Case Journey Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              The unified judicial lifecycle tracking every incident from the first tap of distress to tamper-evident blockchain verification, police complaint filing, and emergency trauma healthcare.
            </p>
          </div>

          {/* Quick 1-Click Judge Guided Demo Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handlePreloadJudgeDemo}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center space-x-2 shadow-xl shadow-purple-950/60 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Launch 3-Minute Judge Guided Tour</span>
            </button>
          </div>
        </div>

        {/* Case Switcher Ribbon */}
        <div className="mt-6 pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-semibold">Active Case Dossier:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-purple-700/60 rounded-xl font-mono text-purple-200 text-xs focus:outline-none focus:border-purple-500"
            >
              {cases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.caseId} — {c.title || 'Safety Case'}
                </option>
              ))}
              <option value="CASE-2026-METRO-01">CASE-2026-METRO-01 (Preloaded Benchmark Case)</option>
            </select>
          </div>

          <div className="text-[11px] font-mono text-teal-400 bg-teal-950/40 px-2.5 py-1 rounded-full border border-teal-800/50">
            Chain-of-Custody Intact (Section 63 BSA 2023)
          </div>
        </div>
      </div>

      {/* 5-Stage Interactive Progress Tracker */}
      <CaseProgressTracker
        dossier={dossier}
        onNavigateStage={handleNavigateStage}
      />

      {/* 5 Connected Module Dossier Cards */}
      {dossier && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span>Connected Forensic Dossier Exhibits</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1: SOS Protection */}
            <div className="glass-card p-5 rounded-2xl border border-rose-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">STAGE 01 • SOS</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    RESOLVED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">Protection & GPS Tracking</h4>
                <div className="text-xs text-slate-300 space-y-1 mt-2 font-mono">
                  <div>Session: <span className="text-slate-400">{dossier.stage1_SOS?.sessionId}</span></div>
                  <div>GPS: <span className="text-teal-300">28.6295° N, 77.2075° E</span></div>
                  <div>Alerts Dispatched: <span className="text-rose-400">{dossier.stage1_SOS?.alertsDispatchedCount || 3} contacts</span></div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateStage('sos')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>Open SOS Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Card 2: Evidence AI */}
            <div className="glass-card p-5 rounded-2xl border border-purple-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">STAGE 02 • AI SCENE</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    COUNT ONLY
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">OpenCV & Whisper AI</h4>
                <div className="text-xs text-slate-300 space-y-1 mt-2">
                  <div>Exhibits Preserved: <span className="font-mono text-white">{dossier.stage2_EvidenceAI?.evidenceCount || 1} file(s)</span></div>
                  <div>Person Count: <span className="font-mono text-teal-300">2 individuals detected</span></div>
                  <div className="text-[11px] text-slate-400 italic">"Zero facial recognition. Verbal distress transcribed."</div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateStage('ai')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/50 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>Open Evidence AI</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Card 3: Blockchain Vault */}
            <div className="glass-card p-5 rounded-2xl border border-teal-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-teal-400 font-bold">STAGE 03 • WEB3</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    NOTARIZED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">EvidenceRegistry.sol</h4>
                <div className="text-xs text-slate-300 space-y-1 mt-2 font-mono">
                  <div>Block Height: <span className="text-white">#{dossier.stage3_VaultIntegrity?.blockHeight || 4829105}</span></div>
                  <div className="truncate">Tx: <span className="text-teal-400">{(dossier.stage3_VaultIntegrity?.latestTxHash || '0x2044...').substring(0, 18)}...</span></div>
                  <div>Network: <span className="text-slate-400">Hardhat Local Node</span></div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateStage('vault')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-800/50 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>Open Vault & Tamper Lab</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Card 4: Justice Complaint */}
            <div className="glass-card p-5 rounded-2xl border border-indigo-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">STAGE 04 • JUSTICE</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    ACKNOWLEDGED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">Bilingual Police Complaint</h4>
                <div className="text-xs text-slate-300 space-y-1 mt-2 font-mono">
                  <div>Receipt: <span className="text-white">{dossier.stage4_JusticeComplaint?.acknowledgementReceipt || 'ACK-2026-METRO-99'}</span></div>
                  <div>IO Badge: <span className="text-indigo-300">#{dossier.stage4_JusticeComplaint?.officerBadgeNumber || 'DL-WSD-8329'}</span></div>
                  <div>QR Code: <span className="text-teal-400 font-bold">Verified Admissible</span></div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateStage('justice')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-800/50 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>View Court Dossier PDF</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Card 5: MediCare */}
            <div className="glass-card p-5 rounded-2xl border border-emerald-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 05 • MEDICARE</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    MLC ACTIVE
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">Healthcare & Trauma Support</h4>
                <div className="text-xs text-slate-300 space-y-1 mt-2 font-mono">
                  <div>Hospital: <span className="text-white">Apex Trauma Center (AIIMS)</span></div>
                  <div>MLC Case: <span className="text-emerald-300 font-bold">MLC-AIIMS-2026-8812</span></div>
                  <div>Emergency Doctor: <span className="text-teal-400">Dr. Sunita Rao (On Duty)</span></div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateStage('medicare')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/50 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <span>Open MediCare Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3-Minute Guided Judge Interactive Demo Modal */}
      <JudgeDemoFlowModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onNavigateModule={(mod) => {
          setIsJudgeModalOpen(false);
          setActiveTab(mod);
        }}
      />
    </div>
  );
}

