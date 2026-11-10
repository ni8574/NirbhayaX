import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { vaultAPI } from '../services/api';
import EvidenceUploader from '../components/vault/EvidenceUploader';
import IntegrityVerifier from '../components/vault/IntegrityVerifier';
import BlockExplorerView from '../components/vault/BlockExplorerView';
import TamperDemoModal from '../components/vault/TamperDemoModal';
import ConsentManagerModal from '../components/vault/ConsentManagerModal';
import AuditTrailViewer from '../components/vault/AuditTrailViewer';
import {
  Lock,
  Layers,
  FileCheck2,
  Flame,
  UserCheck,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function VaultPage({ setActiveTab }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTabState] = useState('upload'); // 'upload' | 'verify' | 'explorer' | 'audit'
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvidenceForConsent, setSelectedEvidenceForConsent] = useState(null);
  const [tamperModalOpen, setTamperModalOpen] = useState(false);
  const [targetTamperId, setTargetTamperId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const res = await vaultAPI.getItems();
      if (res.data?.success) {
        setEvidenceItems(res.data.items);
      }
    } catch (err) {
      console.warn('Could not load evidence items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleOpenTamper = (id) => {
    setTargetTamperId(id || (evidenceItems[0] ? evidenceItems[0].evidenceId : null));
    setTamperModalOpen(true);
  };

  const handleOpenConsent = (item) => {
    setSelectedEvidenceForConsent(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-purple-900/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-teal-400 uppercase tracking-widest">
              MODULE 03 • STAGE 3 (INTEGRITY)
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">WEB3 SMART CONTRACT VAULT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            NIRBHAYA Evidence Vault & Blockchain Notarization
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Client-side SHA-256 generation, AES-256-GCM encrypted off-chain storage, and immutable Hardhat/Polygon Amoy smart contract notarization.
          </p>
        </div>

        {/* 1-Click Judge Tamper Demo Button */}
        <button
          onClick={() => handleOpenTamper(evidenceItems[0]?.evidenceId)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-rose-900/40 transition transform active:scale-95"
        >
          <Flame className="w-4 h-4 animate-pulse text-amber-300" />
          <span>Launch 1-Byte Tamper Demo</span>
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Notarized Items</span>
          <span className="text-2xl font-black text-white font-mono">{evidenceItems.length}</span>
          <span className="text-[10px] text-teal-400 block mt-0.5">100% On-Chain Anchored</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Encryption Standard</span>
          <span className="text-base font-black text-purple-300 font-mono">AES-256-GCM</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero PII On-Chain</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Smart Contract</span>
          <span className="text-xs font-black text-teal-300 font-mono">EvidenceRegistry</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Solidity v0.8.20</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Chain Admissibility</span>
          <span className="text-sm font-black text-amber-300">Sec 65B / BSA 63</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Electronic Record Proof</span>
        </div>
      </div>

      {/* Workspace Tab Switcher */}
      <div className="flex border-b border-purple-900/40 bg-slate-950/40 p-1.5 rounded-2xl gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTabState('upload')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'upload'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Upload & Notarize</span>
        </button>

        <button
          onClick={() => setActiveTabState('verify')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'verify'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Verify & Tamper Lab</span>
        </button>

        <button
          onClick={() => setActiveTabState('explorer')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'explorer'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Ledger Block Explorer</span>
        </button>

        <button
          onClick={() => setActiveTabState('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Immutable Audit Trail</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <EvidenceUploader onEvidenceUploaded={loadEvidence} />
          <BlockExplorerView
            evidenceItems={evidenceItems}
            onOpenConsent={handleOpenConsent}
            onOpenTamper={handleOpenTamper}
          />
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="space-y-6">
          <IntegrityVerifier />
          <div className="p-6 glass-card rounded-3xl border border-rose-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Simulate Digital Evidence Tampering (Live Judge Demo)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Alters 1 byte of the encrypted payload in memory, calculates the mutated SHA-256 hash, and verifies contract rejection live.
              </p>
            </div>
            <button
              onClick={() => handleOpenTamper(evidenceItems[0]?.evidenceId)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              Run Tamper Experiment
            </button>
          </div>
        </div>
      )}

      {activeTab === 'explorer' && (
        <BlockExplorerView
          evidenceItems={evidenceItems}
          onOpenConsent={handleOpenConsent}
          onOpenTamper={handleOpenTamper}
        />
      )}

      {activeTab === 'audit' && (
        <AuditTrailViewer />
      )}

      {/* Modals */}
      <TamperDemoModal
        isOpen={tamperModalOpen}
        onClose={() => setTamperModalOpen(false)}
        defaultEvidenceId={targetTamperId}
      />

      <ConsentManagerModal
        isOpen={!!selectedEvidenceForConsent}
        onClose={() => setSelectedEvidenceForConsent(null)}
        evidenceItem={selectedEvidenceForConsent}
        onConsentUpdated={loadEvidence}
      />

    </div>
  );
}

