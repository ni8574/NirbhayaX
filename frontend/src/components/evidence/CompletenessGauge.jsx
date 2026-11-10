import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Layers, Award } from 'lucide-react';

export default function CompletenessGauge({ completeness }) {
  if (!completeness) return null;

  const score = completeness.completenessScore || 75;
  const breakdown = completeness.breakdown || {
    mediaIntegrity: 30,
    timestampMetadata: 25,
    geolocation: 25,
    transcriptCorroboration: 8
  };
  const completedDetails = completeness.completedDetails || [];
  const missingDetails = completeness.missingDetails || [];
  const explanation = completeness.explanation || 'Evidence completeness evaluated across media, timestamp, geolocation and witness corroboration.';

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-teal-400 border-teal-500 bg-teal-950/40';
    if (s >= 60) return 'text-purple-400 border-purple-500 bg-purple-950/40';
    return 'text-amber-400 border-amber-500 bg-amber-950/40';
  };

  return (
    <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/40 text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Evidence Completeness Score</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                0–100% Metric
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Forensic weighting under Section 63 BSA 2023 standards
            </p>
          </div>
        </div>

        {/* Circular / Badge Score */}
        <div className={`px-4 py-2 rounded-2xl border text-xl font-extrabold font-mono flex items-center space-x-1 ${getScoreColor(score)}`}>
          <span>{score}</span>
          <span className="text-xs text-slate-400 font-normal">/100</span>
        </div>
      </div>

      {/* Progress Bar with Color */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-400 transition-all duration-700"
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          {explanation}
        </p>
      </div>

      {/* Weighted Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Media Integrity</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {breakdown.mediaIntegrity || 0}<span className="text-xs text-slate-500">/30</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Timestamp & EXIF</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {breakdown.timestampMetadata || 0}<span className="text-xs text-slate-500">/25</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Geolocation</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {breakdown.geolocation || 0}<span className="text-xs text-slate-500">/25</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Corroboration</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {breakdown.transcriptCorroboration || 0}<span className="text-xs text-slate-500">/20</span>
          </div>
        </div>
      </div>

      {/* Checklist: Completed vs Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Completed */}
        <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-900/40 space-y-2">
          <div className="text-xs font-bold text-teal-300 flex items-center space-x-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Preserved Details ({completedDetails.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {completedDetails.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing details */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
          <div className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Missing Information Checker ({missingDetails.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {missingDetails.length > 0 ? (
              missingDetails.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">All essential forensic fields established.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

