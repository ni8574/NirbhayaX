import React from 'react';
import { Copy, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DuplicateDetectorBadge({ duplicateData, perceptualHash, sha256 }) {
  if (!duplicateData && !perceptualHash) return null;

  const isDuplicate = duplicateData?.isDuplicate;
  const matches = duplicateData?.matches || [];
  const advice = duplicateData?.advice;

  return (
    <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${
            isDuplicate
              ? 'bg-amber-950/60 border-amber-700/40 text-amber-400'
              : 'bg-teal-950/60 border-teal-700/40 text-teal-400'
          }`}>
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Dual-Layer Duplicate Detector</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                SHA-256 + dHash
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Detects byte-exact clones and perceptual near-duplicates
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
          isDuplicate
            ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
            : 'bg-teal-950/80 text-teal-300 border-teal-600/60'
        }`}>
          {isDuplicate ? `⚠️ ${matches.length} Duplicate(s) Found` : '✅ Unique Evidence'}
        </span>
      </div>

      {/* Hashes Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Cryptographic Digest (SHA-256)</div>
          <div className="text-xs font-mono text-teal-300 truncate mt-1">
            {sha256 || 'Not computed yet'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Byte-for-byte exact matching
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Perceptual Hash (dHash)</div>
          <div className="text-xs font-mono text-purple-300 truncate mt-1">
            {perceptualHash || 'Not applicable (audio/doc)'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Resilient to recompression or resizing
          </div>
        </div>
      </div>

      {/* Advice / Matches details */}
      {isDuplicate && matches.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 space-y-2">
          <div className="text-xs font-bold text-amber-200 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Matched Evidence Items:</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300 font-mono">
            {matches.map((m, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{m.filename || m.evidenceId || m.hash}</span>
                <span className="text-amber-400">{m.matchType || '100% Match'}</span>
              </li>
            ))}
          </ul>
          {advice && (
            <p className="text-[11px] text-amber-300/90 pt-1 border-t border-amber-900/40">
              {advice}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

