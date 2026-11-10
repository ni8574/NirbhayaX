import React, { useState } from 'react';
import { vaultAPI } from '../../services/api';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ConsentManagerModal({ isOpen, onClose, evidenceItem, onConsentUpdated }) {
  const [role, setRole] = useState('police');
  const [granteeEmail, setGranteeEmail] = useState('');
  const [durationHours, setDurationHours] = useState(72);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !evidenceItem) return null;

  const handleGrant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await vaultAPI.grantConsent({
        evidenceId: evidenceItem.evidenceId,
        granteeEmail,
        role,
        durationHours
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setGranteeEmail('');
        if (onConsentUpdated) onConsentUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (granteePseudonym) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await vaultAPI.revokeConsent({
        evidenceId: evidenceItem.evidenceId,
        granteePseudonym
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        if (onConsentUpdated) onConsentUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const activeGrants = evidenceItem.consentList?.filter(g => !g.revoked) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/70 to-slate-900 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Consent-Based Access Delegation</h3>
              <p className="text-[11px] text-slate-400 font-mono">Evidence ID: {evidenceItem.evidenceId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Active Grants List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Currently Authorized Access Grants ({activeGrants.length})
            </h4>

            {activeGrants.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                No external parties currently hold access. You are the sole controller.
              </div>
            ) : (
              <div className="space-y-2">
                {activeGrants.map((grant, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs capitalize">{grant.role} Officer</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {grant.granteePseudonymOrRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Valid until: {new Date(grant.validUntil).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(grant.granteePseudonymOrRole)}
                      disabled={loading}
                      className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800 transition"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grant New Access Form */}
          <form onSubmit={handleGrant} className="p-4 rounded-2xl bg-slate-950 border border-purple-900/30 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Grant Time-Limited Access
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Authority</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="police">Police Department</option>
                  <option value="lawyer">Legal Aid / Lawyer</option>
                  <option value="ngo">Women Support NGO</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Validity Window</label>
                <select
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours</option>
                  <option value={72}>72 Hours (Standard)</option>
                  <option value={168}>7 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Recipient Identity / Email (Optional)</label>
              <input
                type="text"
                value={granteeEmail}
                onChange={e => setGranteeEmail(e.target.value)}
                placeholder="e.g. inspector.sharma@delhipolice.gov.in"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Authorize Access On-Chain</span>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

