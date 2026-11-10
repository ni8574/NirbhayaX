import React, { useState } from 'react';
import { computeClientSha256, formatBytes } from '../../services/cryptoClient';
import { vaultAPI } from '../../services/api';
import {
  UploadCloud,
  FileCheck2,
  Lock,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function EvidenceUploader({ onEvidenceUploaded, linkedCaseId }) {
  const [file, setFile] = useState(null);
  const [clientHash, setClientHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
    setUploadResult(null);

    // Compute SHA-256 client-side before upload
    setIsHashing(true);
    try {
      const hash = await computeClientSha256(selected);
      setClientHash(hash);
    } catch (err) {
      console.warn('Client hashing error:', err);
      setErrorMsg('Failed to calculate client-side hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    setFile(dropped);
    setErrorMsg(null);
    setUploadResult(null);

    setIsHashing(true);
    try {
      const hash = await computeClientSha256(dropped);
      setClientHash(hash);
    } catch (err) {
      setErrorMsg('Failed to calculate client-side hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientSha256', clientHash);
    if (linkedCaseId) {
      formData.append('caseId', linkedCaseId);
    }

    try {
      const res = await vaultAPI.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (res.data?.success) {
        setUploadResult(res.data);
        if (onEvidenceUploaded) {
          onEvidenceUploaded(res.data.evidence);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Evidence upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setClientHash('');
    setUploadResult(null);
    setErrorMsg(null);
    setUploadProgress(0);
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-900/30">
      
      {/* Header */}
      <div className="flex items-center space-x-2 pb-4 border-b border-purple-900/30 mb-5">
        <Lock className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Immutable Evidence Notarization Vault</h3>
          <p className="text-[11px] text-slate-400">
            Client-Side SHA-256 • AES-256-GCM Encrypted Storage • On-Chain Polygon/Hardhat Proof
          </p>
        </div>
      </div>

      {/* Upload Box / Drag & Drop */}
      {!file && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-purple-700/40 hover:border-teal-400/60 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-900/40 group"
          onClick={() => document.getElementById('evidence-file-input').click()}
        >
          <input
            id="evidence-file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-300 mx-auto mb-3 group-hover:scale-105 transition shadow-lg">
            <UploadCloud className="w-7 h-7 text-teal-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">
            Drag & drop media file or <span className="text-teal-400 underline">browse</span>
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Supports CCTV/dashcam footage (MP4), audio recordings (WAV/MP3), photos (JPG/PNG), and legal documents (PDF up to 50MB).
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">🔒 100% Client-Side Hashing</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">🛡️ AES-256 Off-Chain</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">⚡ Zero PII On-Chain</span>
          </div>
        </div>
      )}

      {/* File Selected Stage */}
      {file && !uploadResult && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-purple-800/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-teal-400 border border-teal-500/30">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{file.name}</div>
                <div className="text-xs text-slate-400">{formatBytes(file.size)} • {file.type || 'Binary Data'}</div>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={isUploading}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700"
            >
              Change File
            </button>
          </div>

          {/* Client SHA-256 Hash Card */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-900/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-teal-300 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Client-Side SHA-256 Fingerprint:</span>
              </span>
              {isHashing ? (
                <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Computing digest...</span>
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">Computed locally in browser</span>
              )}
            </div>

            <div className="p-2 bg-slate-950 rounded-lg font-mono text-[11px] text-purple-200 break-all select-all border border-slate-800">
              {clientHash || 'Computing...'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              This fingerprint is notarized on the blockchain. Any subsequent alteration of even 1 bit in this file will invalidate its verification.
            </p>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleUploadSubmit}
            disabled={isUploading || isHashing}
            className="w-full py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-600 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/40 transition flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Encrypting & Notarizing On-Chain ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Encrypt with AES-256 & Notarize on Blockchain</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Notarization Result Card */}
      {uploadResult && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-teal-900/30">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Evidence Successfully Notarized on Blockchain!</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700 text-xs font-mono font-bold">
              {uploadResult.evidence.evidenceId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Transaction Hash</span>
              <span className="font-mono text-purple-300 text-[11px] break-all">
                {uploadResult.blockchain.txHash}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Block Number</span>
              <span className="font-mono text-teal-300 font-bold text-sm">
                #{uploadResult.blockchain.blockNumber}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Encryption Standard</span>
              <span className="font-mono text-slate-200">AES-256-GCM (Off-Chain Vault)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Contract Registry</span>
              <span className="font-mono text-slate-200 text-[10px] break-all">
                {uploadResult.blockchain.contractAddress}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Upload Another Evidence Item
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

