import React from 'react';
import {
  ShieldAlert,
  Camera,
  Mic,
  Film,
  Lock,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

export default function VisualEvidenceTimeline({ timeline, onVerifyInVault }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-card rounded-2xl border border-purple-900/40 p-8 text-center">
        <Clock className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
        <h4 className="text-base font-bold text-white">No Case Timeline Milestones Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Upload media evidence or trigger NIRBHAYA SOS to generate an immutable forensic timeline.
        </p>
      </div>
    );
  }

  const getMilestoneIcon = (item) => {
    switch (item.type) {
      case 'CASE_INITIATED':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'EVIDENCE_PRESERVED':
        if (item.mimeType?.includes('audio') || item.title?.includes('Audio')) {
          return <Mic className="w-4 h-4 text-teal-400" />;
        }
        if (item.mimeType?.includes('video') || item.title?.includes('Video')) {
          return <Film className="w-4 h-4 text-indigo-400" />;
        }
        return <Camera className="w-4 h-4 text-purple-400" />;
      case 'LEGAL_COMPILATION':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Lock className="w-4 h-4 text-teal-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_CHAIN_NOTARIZED':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'VERIFIED':
        return 'bg-teal-950/80 text-teal-300 border-teal-700/60';
      case 'BSA_63_READY':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      default:
        return 'bg-slate-850 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/40 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Automatic Forensic Evidence Timeline</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                Chain of Custody
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Chronological electronic event reconstruction for judicial review
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-purple-300 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-800/60">
          {timeline.length} Milestones
        </span>
      </div>

      {/* Visual Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-red-500 before:via-purple-500 before:to-emerald-500">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative group">
            {/* Timeline Node Pin */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-950 border-2 border-purple-500 flex items-center justify-center shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            </div>

            {/* Milestone Card */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-700/60 transition-all space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getMilestoneIcon(item)}
                  </div>
                  <span className="font-bold text-sm text-white">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(item.status)}`}>
                    {item.status?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Recorded'}
                  </span>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Evidence Technical Proofs */}
              {item.sha256 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <div className="text-slate-400 truncate max-w-xs">
                    SHA-256: <span className="text-teal-400">{item.sha256.substring(0, 16)}...</span>
                  </div>
                  {item.txHash && (
                    <div className="text-slate-400 truncate max-w-xs">
                      Tx: <span className="text-purple-400">{item.txHash.substring(0, 14)}...</span>
                    </div>
                  )}
                  {onVerifyInVault && (
                    <button
                      onClick={() => onVerifyInVault(item.sha256)}
                      className="text-teal-400 hover:text-teal-300 flex items-center space-x-1 text-xs"
                    >
                      <span>Verify in Vault</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

