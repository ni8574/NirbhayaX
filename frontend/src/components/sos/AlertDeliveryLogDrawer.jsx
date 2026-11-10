import React, { useState, useEffect } from 'react';
import { sosAPI } from '../../services/api';
import { MessageSquare, CheckCheck, RefreshCw, X, Shield, Smartphone } from 'lucide-react';

export default function AlertDeliveryLogDrawer({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await sosAPI.getAlertLogs();
      if (res.data?.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.warn('Could not fetch alert logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/70 to-slate-900 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-teal-400 border border-teal-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Outbound SMS & Push Alert Audit Feed</h3>
              <p className="text-[11px] text-slate-400">Real-time telecommunications dispatch log (DEMO_MODE=true)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-900/30 text-[11px] text-amber-300 flex items-center justify-between">
          <span>ℹ️ Demo Mode Active: Live GSM SMS gateway simulated to avoid carrier toll charges during hackathon judging.</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700">MOCK_GATEWAY</span>
        </div>

        {/* Log Stream Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No emergency alerts dispatched yet. Trigger an SOS to generate outbound SMS alerts.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col space-y-2 hover:border-purple-800/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">{log.recipientName}</span>
                    <span className="text-xs font-mono text-slate-400">({log.phone})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold flex items-center space-x-1">
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                      <span>{log.status}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-mono text-slate-300 break-words leading-relaxed">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

