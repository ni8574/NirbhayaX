import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Lock,
  Scale,
  HeartPulse,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  ExternalLink,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function JudgeDemoFlowModal({ isOpen, onClose, onNavigateModule }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes

  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(() => {
        setTimerSeconds(s => Math.max(0, s - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      moduleKey: 'sos',
      title: 'Stage 01: Immediate Protection (NIRBHAYA SOS)',
      subtitle: 'One-Tap Distress Trigger, WebSocket GPS Stream & Offline Queue',
      color: 'from-rose-600 to-red-600',
      badge: 'TACTICAL DEFENSE',
      details: [
        'Large tactile SOS button delivers instant 880Hz audio tone and haptic vibration feedback.',
        'Starts real-time WebSocket GPS location broadcasting with zero personal data leakage.',
        'Safety Circle contacts receive simulated SMS and push notification alerts instantly.',
        'Offline SOS queue with IndexedDB & Service Worker backoff ensures resilience during network loss.'
      ],
      wowFactor: 'Quick Exit disguise calculator: typing 777= reveals/hides emergency state instantly.'
    },
    {
      step: 2,
      moduleKey: 'ai',
      title: 'Stage 02: Evidence Ingestion (NIRBHAYA EVIDENCE AI)',
      subtitle: 'Responsible OpenCV Scene Analysis, Whisper STT & 0-100% Completeness',
      color: 'from-purple-600 to-indigo-600',
      badge: 'RESPONSIBLE AI',
      details: [
        'OpenCV computer vision performs Person & Face COUNT ONLY — zero facial recognition, zero biometric profiling.',
        'Whisper speech-to-text transcribes distress voice statements, extracting key verbal triggers.',
        'Video keyframe extractor samples crucial sequential intervals for scene reconstruction.',
        '4-factor weighted rubric evaluates evidence completeness (0-100%) and flags missing judicial elements.'
      ],
      wowFactor: 'DPDP Act 2023 compliant: strictly counts subjects without infringing citizen privacy.'
    },
    {
      step: 3,
      moduleKey: 'vault',
      title: 'Stage 03: Cryptographic Integrity (NIRBHAYA VAULT)',
      subtitle: 'Client SHA-256 Hashing, AES-256-GCM Vault & Blockchain Notarization',
      color: 'from-teal-600 to-emerald-600',
      badge: 'WEB3 NOTARIZATION',
      details: [
        'Client-side SHA-256 calculated using Web Crypto API in the browser before upload.',
        'Sensitive media encrypted with AES-256-GCM and stored off-chain; raw files are NEVER stored on-chain.',
        'Solidity smart contract EvidenceRegistry.sol notarizes the hash on Hardhat with block height & txHash.',
        'Live 1-Byte Tamper Test flips 1 bit: causes 92% hash avalanche effect, smart contract rejects immediately!'
      ],
      wowFactor: 'Judicial wow: The 1-click Tamper Lab proves file integrity under Section 63 BSA 2023.'
    },
    {
      step: 4,
      moduleKey: 'justice',
      title: 'Stage 04: Legal Recourse (NIRBHAYA JUSTICE)',
      subtitle: 'Bilingual Police Complaint Generator, BSA 63 Certificate & QR Verification',
      color: 'from-indigo-600 to-purple-600',
      badge: 'COURT DOSSIER',
      details: [
        'Automated bilingual drafting wizard in English and Hindi (भारतीय न्याय संहिता BNS 2023 aligned).',
        'Auto-attaches cryptographic SHA-256 evidence hashes and on-chain transaction receipts from the Vault.',
        'Generates Section 63 Bharatiya Sakshya Adhiniyam 2023 (formerly 65B IEA) Electronic Certificate.',
        'Embeds a high-density QR code linking judges directly to on-chain verification.'
      ],
      wowFactor: 'Ready for court filing: Generates pixel-perfect bilingual printable PDFs directly in browser.'
    },
    {
      step: 5,
      moduleKey: 'medicare',
      title: 'Stage 05: Post-Incident Support (NIRBHAYA MEDICARE)',
      subtitle: 'Proximity Hospital Routing, Medico-Legal Injury Locker & ER Doctor Pass',
      color: 'from-emerald-600 to-teal-600',
      badge: 'EMERGENCY HEALTHCARE',
      details: [
        'Haversine distance routing to nearest verified 24/7 trauma centers and women healthcare clinics.',
        '1-tap emergency ambulance dialers (102 Free Ambulance, 108 Emergency, CATS 1099, 112).',
        'AES-256 encrypted medical locker stores blood group, critical allergies, and Medico-Legal Case (MLC) logs.',
        'Generates temporary 24-hour doctor access pass allowing attending ER physicians to view health data.'
      ],
      wowFactor: 'Complete continuum of care: Victim is protected from the first tap to the hospital and court.'
    }
  ];

  const current = demoSteps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-800/60 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Ribbon */}
        <div className="p-4 bg-slate-950 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/50 text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <span>Judge 3-Minute Guided Demonstration</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-purple-300 font-mono">
                  STEP {currentStep} OF 5
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating the complete Proof-to-Justice architecture in 180 seconds
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 font-mono text-xs text-teal-300 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-800/50">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Ribbon */}
        <div className="grid grid-cols-5 p-2 bg-slate-950/80 gap-1.5 border-b border-purple-900/30">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${
                currentStep === s.step
                  ? 'bg-purple-600 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              STAGE 0{s.step}
            </button>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="p-6 space-y-5 flex-1">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              {current.badge}
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {current.title}
            </h2>
            <p className="text-xs text-slate-300">
              {current.subtitle}
            </p>
          </div>

          {/* Technical bullet points */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            {current.details.map((d, i) => (
              <div key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200 leading-relaxed">{d}</span>
              </div>
            ))}
          </div>

          {/* WOW Factor Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-700/50 flex items-start space-x-2.5 text-xs">
            <Award className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Hackathon Judge Differentiator
              </span>
              <p className="text-purple-200 mt-0.5 leading-relaxed">
                {current.wowFactor}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Jump-In Footer */}
        <div className="p-4 bg-slate-950 border-t border-purple-900/40 flex items-center justify-between gap-3">
          <button
            onClick={() => onNavigateModule(current.moduleKey)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
          >
            <span>Open Live {current.badge} Module</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(s => Math.min(5, s + 1))}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/40"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Tour</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

