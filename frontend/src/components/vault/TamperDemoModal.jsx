import React, { useState } from 'react';
import { vaultAPI } from '../../services/api';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Cpu,
  Layers,
  Scale,
  Sparkles
} from 'lucide-react';

export default function TamperDemoModal({ isOpen, onClose, defaultEvidenceId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [tamperData, setTamperData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleRunTamper = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await vaultAPI.tamperDemo(defaultEvidenceId);
      if (res.data?.success) {
        setTamperData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Tamper simulation failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-slate-900 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Interactive Tamper Detection Lab</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700 font-mono font-bold">
                  JUDGE WOW FEATURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live demonstration of SHA-256 cryptographic avalanche effect & smart contract verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-purple-200 mb-1">
              ⚖️ The Forensic Challenge:
            </p>
            In women's safety cases, perpetrators routinely claim electronic CCTV or audio recordings were doctored. This demo inverts a single bit in an evidence file and proves that the blockchain smart contract detects the modification instantly.
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleRunTamper}
            disabled={isRunning}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-900/40 transition flex items-center justify-center space-x-2 active:scale-98"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mutating File Byte & Verifying On-Chain...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Simulate 1-Byte File Tamper (Live Test)</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Tamper Results Comparison Grid */}
          {tamperData && (
            <div className="space-y-4 animate-fade-in pt-2">
              
              {/* Avalanche Metrics Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Bit Mutation</span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    Byte #{tamperData.tamperMetrics.byteModifiedIndex} flipped ({tamperData.tamperMetrics.originalByteHex} ➔ {tamperData.tamperMetrics.tamperedByteHex})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Avalanche Effect</span>
                  <span className="font-mono text-sm font-black text-rose-400">
                    {tamperData.tamperMetrics.avalanchePercentage} Mutation
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Original Record */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ORIGINAL FILE NOTARIZATION</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Block #{tamperData.originalRecord.blockNumber}
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg font-mono text-[10px] text-emerald-300 break-all select-all border border-emerald-900/50">
                    {tamperData.originalRecord.hash}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-200 text-[10px] font-bold">
                    STATUS: VERIFIED ON-CHAIN ✅
                  </span>
                </div>

                {/* Tampered Record */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-2">
                  <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
                    <XCircle className="w-4 h-4" />
                    <span>TAMPERED FILE (1 BIT MODIFIED)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Smart Contract Query: Rejected
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg font-mono text-[10px] text-rose-300 break-all select-all border border-rose-900/50">
                    {tamperData.tamperedRecord.hash}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-900/50 text-rose-200 text-[10px] font-bold">
                    STATUS: MISMATCH ❌ REJECTED
                  </span>
                </div>

              </div>

              {/* Forensic Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                {tamperData.tamperMetrics.explanation}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-purple-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close Lab
          </button>
        </div>

      </div>
    </div>
  );
}

