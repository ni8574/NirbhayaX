import React, { useState, useEffect } from 'react';
import { vaultAPI } from '../../services/api';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function AuditTrailViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await vaultAPI.getAuditTrail();
      if (res.data?.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.warn('Audit fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action, status) => {
    if (status === 'TAMPER_ALERT' || action === 'TAMPER_DETECTED') {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>TAMPER ALERT</span>
        </span>
      );
    }
    if (action === 'EVIDENCE_UPLOAD') {
      return (
        <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-mono font-bold">
          UPLOAD & NOTARIZE
        </span>
      );
    }
    if (action === 'INTEGRITY_VERIFIED') {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
          VERIFIED AUTHENTIC
        </span>
      );
    }
    if (action === 'ACCESS_GRANTED') {
      return (
        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
          CONSENT GRANTED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
        {action}
      </span>
    );
  };

  return (
    <div className="glass-card rounded-3xl border border-purple-900/30 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 bg-slate-900/90 border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Immutable-Style Audit Trail</h3>
            <p className="text-[11px] text-slate-400">Verifiable chronological audit log for legal admissibility and chain of custody</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Refresh Audit Trail"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Log Feed */}
      <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No audit events recorded yet. Uploading or verifying files will log events here.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.logId || log._id}
              className={`p-3.5 rounded-2xl border transition ${
                log.status === 'TAMPER_ALERT'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  {getActionBadge(log.action, log.status)}
                  <span className="text-xs font-mono text-purple-300 font-bold">
                    {log.evidenceId || 'GLOBAL'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                <div>
                  <span className="text-slate-600">Actor Pseudonym: </span>
                  <span className="text-slate-300">{log.actorPseudonym}</span>
                </div>
                {log.txHash && (
                  <div className="truncate">
                    <span className="text-slate-600">Tx: </span>
                    <span className="text-teal-400">{log.txHash}</span>
                  </div>
                )}
              </div>

              {log.details && (
                <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

