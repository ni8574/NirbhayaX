import React, { useState } from 'react';
import { FileText, Copy, Check, Scale, ShieldAlert, ArrowRight } from 'lucide-react';

export default function FactualSummaryCard({ factualSummary, onForwardToComplaint }) {
  const [copied, setCopied] = useState(false);

  if (!factualSummary) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(factualSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl border border-indigo-800/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-700/40 text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Objective Factual Incident Summary</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                BSA Sec 63 Compliant
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Neutral non-accusatory drafting assistance for court records
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Summary Content */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 leading-relaxed text-sm text-slate-200">
        {factualSummary}
      </div>

      {/* Ethical Guardrail Disclaimer */}
      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-200/80 flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Ethical AI Guardrail:</strong> This summary strictly presents objective scene data without attributing criminal guilt, naming unverified individuals, or speculating on intent.
        </p>
      </div>

      {/* Action forward */}
      {onForwardToComplaint && (
        <button
          onClick={onForwardToComplaint}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-950/50"
        >
          <span>Insert into NIRBHAYA JUSTICE Police Complaint (Phase 5)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

