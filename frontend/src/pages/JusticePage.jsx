import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileText,
  Printer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Languages
} from 'lucide-react';
import ComplaintWizardForm from '../components/justice/ComplaintWizardForm';
import BilingualPDFViewer from '../components/justice/BilingualPDFViewer';
import ComplaintStatusTracker from '../components/justice/ComplaintStatusTracker';
import { justiceAPI, aiAPI } from '../services/api';

export default function JusticePage({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('wizard'); // 'wizard', 'preview', 'tracker'
  const [currentCaseId, setCurrentCaseId] = useState('CASE-2026-DEMO');
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or fetch existing complaint for the case
  useEffect(() => {
    fetchComplaint(currentCaseId);
  }, [currentCaseId]);

  const fetchComplaint = async (caseId) => {
    setIsLoading(true);
    try {
      const res = await justiceAPI.getComplaint(caseId);
      if (res.data?.success && res.data.data) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      // If none exists, we allow drafting
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplaintSaved = (savedComplaint) => {
    setComplaint(savedComplaint);
    setActiveSubTab('preview');
  };

  const handleSubmitToPolice = async (complaintId) => {
    try {
      const res = await justiceAPI.submitComplaint(complaintId);
      if (res.data?.success) {
        // Refresh complaint
        await fetchComplaint(complaint?.caseId || currentCaseId);
        setActiveSubTab('tracker');
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // 1-Click Judge Demo Preset
  const handleLoadJudgeSample = async () => {
    const samplePayload = {
      caseId: 'CASE-2026-METRO-01',
      incidentType: 'stalking_harassment',
      whatHappened: 'Subject followed complainant along the pedestrian walkway outside Barakhamba Road Metro Station Gate 3 for approximately 400 meters, making verbal intimidation remarks. The complainant activated NIRBHAYA SOS and recorded acoustic audio distress evidence.',
      dateTime: new Date().toISOString(),
      location: {
        address: 'Barakhamba Road Metro Station, Gate No. 3',
        landmark: 'Near Pillar 42, Connaught Place Outer Circle'
      },
      witnesses: [
        { name: 'Ramesh Kumar (Auto Driver)', contact: '+91 98101 22334', statementSummary: 'Observed two-wheeler circling around complainant.' }
      ],
      language: 'bilingual'
    };

    setIsLoading(true);
    try {
      const res = await justiceAPI.createDraft(samplePayload);
      if (res.data?.success) {
        setComplaint(res.data.data.complaint);
        setCurrentCaseId('CASE-2026-METRO-01');
        setActiveSubTab('preview');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                <span>Module 4 • NIRBHAYA JUSTICE</span>
              </span>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-700/50">
                Bilingual PDF + BSA Sec 63
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Police Complaint Generator & Electronic Court Dossier
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Transform raw emergency logs into structured, court-ready police complaints with bilingual formatting (Hindi + English), cryptographic evidence references, and embedded verification QR codes.
            </p>
          </div>

          {/* Quick Presets & Switchers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleLoadJudgeSample}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-950/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Load 1-Click Judge Sample</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
            >
              <span>Verify Vault Hashes</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Ribbon */}
        <div className="mt-6 pt-4 border-t border-indigo-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              <strong>Judicial Standard:</strong> Formatted under Bharatiya Sakshya Adhiniyam 2023 (Section 63) & Section 65B Indian Evidence Act.
            </span>
          </div>
          <span className="font-mono text-[11px] text-teal-400 bg-teal-950/40 px-2.5 py-0.5 rounded-full border border-teal-800/50">
            Intake Gateway • Central Women Safety Station
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-indigo-900/30 pb-3">
        <button
          onClick={() => setActiveSubTab('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'wizard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Incident Reporting Wizard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Bilingual Court Dossier PDF</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'tracker'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Intake & Status Tracker</span>
          {complaint?.status && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
              {complaint.status.toUpperCase()}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Wizard */}
      {activeSubTab === 'wizard' && (
        <ComplaintWizardForm
          caseId={currentCaseId}
          initialData={complaint}
          onComplaintSaved={handleComplaintSaved}
          onSwitchToPreview={() => setActiveSubTab('preview')}
        />
      )}

      {/* Tab 2: Bilingual Court PDF Preview */}
      {activeSubTab === 'preview' && (
        <BilingualPDFViewer
          complaint={complaint}
          onSubmitToPolice={handleSubmitToPolice}
        />
      )}

      {/* Tab 3: Complaint Tracker */}
      {activeSubTab === 'tracker' && (
        <ComplaintStatusTracker
          complaint={complaint}
        />
      )}
    </div>
  );
}

