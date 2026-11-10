import React, { useState } from 'react';
import { computeClientSha256 } from '../../services/cryptoClient';
import { vaultAPI } from '../../services/api';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Scale,
  ArrowRight
} from 'lucide-react';

export default function IntegrityVerifier() {
  const [fileToVerify, setFileToVerify] = useState(null);
  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!dropped) return;
    setFileToVerify(dropped);
    setResult(null);
    setErrorMsg(null);

    // Compute hash and verify immediately
    setIsVerifying(true);
    try {
      const hash = await computeClientSha256(dropped);
      setManualHash(hash);
      const res = await vaultAPI.verify(hash);
      if (res.data?.success) {
        setResult(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualHash.trim()) return;
    setIsVerifying(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await vaultAPI.verify(manualHash.trim());
      if (res.data?.success) {
        setResult(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-900/30 space-y-5">
      
      {/* Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-purple-900/30">
        <FileSearch className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-sm font-bold text-white">On-Chain Evidence Integrity Verifier</h3>
          <p className="text-[11px] text-slate-400">
            Re-upload any evidence file or paste a SHA-256 fingerprint to verify against the smart contract
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => document.getElementById('verify-file-input').click()}
        className="p-6 border-2 border-dashed border-purple-700/30 hover:border-purple-500 rounded-2xl bg-slate-950/40 text-center cursor-pointer transition"
      >
        <input
          id="verify-file-input"
          type="file"
          className="hidden"
          onChange={handleFileDrop}
        />
        <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-slate-200">
          Drop any file here to test against the blockchain
        </h4>
        <p className="text-[11px] text-slate-400 mt-1">
          {fileToVerify ? `Selected: ${fileToVerify.name}` : 'Calculates SHA-256 in real-time and queries EvidenceRegistry.sol'}
        </p>
      </div>

      {/* Or Paste Hash */}
      <form onSubmit={handleManualVerify} className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Or paste 64-character SHA-256 Hash directly:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualHash}
            onChange={(e) => setManualHash(e.target.value)}
            placeholder="e.g. e7f04053eaef014c3957c8bba5c7eae37ea8eb87ceb3d83443b246d87917534a"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={isVerifying || !manualHash}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
          >
            {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Verify</span>}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className={`p-5 rounded-2xl border transition animate-fade-in ${result.isAuthentic ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-rose-950/20 border-rose-500/50'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              {result.isAuthentic ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <span className={`text-base font-black ${result.isAuthentic ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {result.verdict}
                </span>
                <span className="text-xs text-slate-400 block">
                  {result.isAuthentic ? 'Cryptographic Integrity Guaranteed' : 'Integrity Compromised / Unregistered'}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              EvidenceRegistry.sol
            </span>
          </div>

          <div className="mt-3 text-xs text-slate-300 leading-relaxed">
            {result.explanation}
          </div>

          {result.isAuthentic && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Notarized On-Chain</span>
                <span className="font-mono text-slate-200">
                  {result.onChainRecord.registeredAt ? new Date(result.onChainRecord.registeredAt).toLocaleString() : 'Timestamp Verified'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Evidence ID</span>
                <span className="font-mono text-teal-300 font-bold">
                  {result.onChainRecord.evidenceId || result.evidenceItem?.evidenceId || 'EVD-VERIFIED'}
                </span>
              </div>
            </div>
          )}

          {/* Legal Admissibility Disclaimer Box */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Scale className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-300">Admissibility Distinction:</strong> Blockchain notarization proves mathematically that this digital file is bit-for-bit identical to the record registered at the specified timestamp (fulfilling Section 65B of Indian Evidence Act / Section 63 of BSA 2023). It does not replace the court's judicial determination of substantive relevance.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

