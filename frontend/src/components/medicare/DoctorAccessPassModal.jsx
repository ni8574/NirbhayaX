import React, { useState } from 'react';
import { Key, ShieldCheck, Clock, X, Check, Copy, AlertCircle, Building, UserCheck } from 'lucide-react';
import { medicareAPI } from '../../services/api';

export default function DoctorAccessPassModal({ isOpen, onClose, onPassCreated }) {
  const [doctorName, setDoctorName] = useState('Attending Casualty Physician');
  const [hospitalName, setHospitalName] = useState('Apex Trauma Center (AIIMS)');
  const [passData, setPassData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await medicareAPI.createPass({ doctorName, hospitalName });
      if (res.data?.success) {
        setPassData(res.data.data);
        if (onPassCreated) onPassCreated(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPass = () => {
    if (!passData) return;
    navigator.clipboard.writeText(passData.passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-800/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-teal-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">24-Hour Doctor Emergency Pass</h3>
              <p className="text-xs text-slate-400">Consent-based cryptographic medical sharing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!passData ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 leading-relaxed">
              Generate a time-locked, single-hospital access token so emergency medical staff can view blood group, drug allergies, and trauma injuries without sharing your account password.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Attending Doctor / CMO Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Vivek Malhotra, CMO"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hospital / Trauma Center
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Safdarjung Hospital Emergency"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-950/50"
              >
                {isGenerating ? 'Generating...' : 'Authorize 24h Pass'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-teal-950/80 border border-teal-500/60 flex items-center justify-center text-teal-300 mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs text-slate-400 block uppercase font-mono">Temporary Emergency Pass Code</span>
              <div className="text-2xl font-black font-mono text-white tracking-widest mt-1 bg-slate-950 py-2.5 px-4 rounded-xl border border-teal-500/50">
                {passData.passCode}
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>Authorized Doctor: <span className="text-white font-bold">{passData.doctorName}</span></div>
              <div>Facility: <span className="text-white">{passData.hospitalName}</span></div>
              <div className="text-teal-400 font-bold">Valid for 24 Hours • Auto-Expiring</div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={handleCopyPass}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

