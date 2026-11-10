import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Clock,
  Award,
  Copy,
  ShieldCheck,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCheck,
  Search
} from 'lucide-react';
import EvidenceUploader from '../components/evidence/EvidenceUploader';
import EvidenceCaptureModal from '../components/evidence/EvidenceCaptureModal';
import PersonCountCard from '../components/evidence/PersonCountCard';
import AudioTranscriptViewer from '../components/evidence/AudioTranscriptViewer';
import KeyframeTimelineViewer from '../components/evidence/KeyframeTimelineViewer';
import FactualSummaryCard from '../components/evidence/FactualSummaryCard';
import CompletenessGauge from '../components/evidence/CompletenessGauge';
import DuplicateDetectorBadge from '../components/evidence/DuplicateDetectorBadge';
import VisualEvidenceTimeline from '../components/evidence/VisualEvidenceTimeline';
import { aiAPI } from '../services/api';

export default function EvidenceAIPage({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('analyze'); // 'analyze', 'timeline', 'completeness', 'duplicates'
  const [currentCaseId, setCurrentCaseId] = useState('CASE-2026-DEMO');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [duplicateCheckData, setDuplicateCheckData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [completenessData, setCompletenessData] = useState(null);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState('camera');
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [dupTargetInput, setDupTargetInput] = useState('');
  const [dupResult, setDupResult] = useState(null);
  const [isCheckingDup, setIsCheckingDup] = useState(false);

  // Fetch timeline and completeness on case change or tab change
  useEffect(() => {
    fetchCaseData(currentCaseId);
  }, [currentCaseId]);

  const fetchCaseData = async (caseId) => {
    setIsLoadingTimeline(true);
    try {
      const [tlRes, compRes] = await Promise.allSettled([
        aiAPI.getTimeline(caseId),
        aiAPI.getCompleteness(caseId)
      ]);

      if (tlRes.status === 'fulfilled' && tlRes.value?.data?.success) {
        setTimelineData(tlRes.value.data.data.timeline || []);
      }
      if (compRes.status === 'fulfilled' && compRes.value?.data?.success) {
        setCompletenessData(compRes.value.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch case timeline:', e);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleAnalysisComplete = async (result) => {
    setAnalysisResult(result);
    if (result.evidence?.caseId) {
      setCurrentCaseId(result.evidence.caseId);
    }

    // Auto-check duplicates for this newly uploaded item
    try {
      const checkRes = await aiAPI.checkDuplicates({
        targetHash: result.sha256Hash || result.serverSha256,
        caseId: result.evidence?.caseId || currentCaseId
      });
      if (checkRes.data?.success) {
        setDuplicateCheckData(checkRes.data.data);
      }
    } catch (e) {
      // non-blocking
    }

    // Refresh timeline
    fetchCaseData(result.evidence?.caseId || currentCaseId);
  };

  const handleManualDuplicateCheck = async () => {
    if (!dupTargetInput) return;
    setIsCheckingDup(true);
    try {
      const res = await aiAPI.checkDuplicates({
        targetHash: dupTargetInput.trim(),
        caseId: currentCaseId
      });
      if (res.data?.success) {
        setDupResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingDup(false);
    }
  };

  const handleOpenCapture = (mode) => {
    setCaptureMode(mode);
    setCaptureModalOpen(true);
  };

  const handleCapturedMedia = async (media) => {
    // Media captured from camera or mic
    try {
      let file;
      if (media.type === 'image' && media.dataUrl) {
        const res = await fetch(media.dataUrl);
        const blob = await res.blob();
        file = new File([blob], media.filename, { type: media.mimeType });
      } else if (media.blob) {
        file = new File([media.blob], media.filename, { type: media.mimeType });
      }

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', currentCaseId);
        formData.append('incidentType', 'emergency_distress');

        const uploadRes = await aiAPI.analyze(formData);
        if (uploadRes.data?.success) {
          handleAnalysisComplete({
            ...uploadRes.data.data,
            localFile: file,
            previewUrl: media.type === 'image' ? media.dataUrl : null
          });
        }
      }
    } catch (err) {
      console.error('Capture upload error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Module 2 • NIRBHAYA EVIDENCE AI</span>
              </span>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-700/50">
                OpenCV + Whisper STT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Responsible AI Scene Analysis & Evidence Corroboration
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated person and face count (zero facial recognition), speech transcription, video keyframe extraction, neutral incident summarization, and 0-100% legal completeness evaluation.
            </p>
          </div>

          {/* Quick Stats or Case Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-800/40 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-mono">Current Dossier</div>
                <div className="text-sm font-bold text-white font-mono">{currentCaseId}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vault')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
            >
              <span>Verify in Vault</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Responsible AI Ethics Notice Bar */}
        <div className="mt-6 pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              <strong>Ethical AI Guardrail:</strong> Person & Face Count ONLY • Zero Biometric Identity Profiling • Non-Accusatory Neutral Drafts
            </span>
          </div>
          <span className="font-mono text-[11px] text-teal-400 bg-teal-950/40 px-2.5 py-0.5 rounded-full border border-teal-800/50">
            Section 63 BSA 2023 / Section 65B IEA
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-purple-900/30 pb-3">
        {[
          { id: 'analyze', label: 'Ingestion & Scene AI', icon: Sparkles },
          { id: 'timeline', label: 'Forensic Case Timeline', icon: Clock },
          { id: 'completeness', label: 'Completeness & Missing Info Audit', icon: Award },
          { id: 'duplicates', label: 'Duplicate & Near-Match Lab', icon: Copy }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeSubTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 border border-purple-500'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INGESTION & SCENE AI */}
      {activeSubTab === 'analyze' && (
        <div className="space-y-6">
          {/* Uploader Section */}
          <EvidenceUploader
            defaultCaseId={currentCaseId}
            onAnalysisComplete={handleAnalysisComplete}
            onOpenCapture={handleOpenCapture}
          />

          {/* Analysis Results View */}
          {analysisResult ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <span>Real-Time AI Analysis & Cryptographic Anchoring Dossier</span>
                </h3>
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/50">
                  {analysisResult.mediaType?.toUpperCase()} EVIDENCE
                </span>
              </div>

              {/* Grid Layout: Visuals & Counts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Person Count Card */}
                <PersonCountCard
                  visionAnalysis={analysisResult.analysis?.visionAnalysis || analysisResult.visionAnalysis}
                  imagePreview={analysisResult.previewUrl || analysisResult.visionAnalysis?.thumbnailBase64}
                />

                {/* Completeness Gauge */}
                <CompletenessGauge
                  completeness={analysisResult.analysis?.completeness || analysisResult.completeness}
                />
              </div>

              {/* Audio Transcript & Video Keyframes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AudioTranscriptViewer
                  audioAnalysis={analysisResult.analysis?.audioAnalysis || analysisResult.audioAnalysis}
                />

                <KeyframeTimelineViewer
                  keyframes={analysisResult.analysis?.visionAnalysis?.extractedKeyframes || analysisResult.visionAnalysis?.extractedKeyframes}
                />
              </div>

              {/* Factual Neutral Summary */}
              <FactualSummaryCard
                factualSummary={analysisResult.analysis?.factualSummary || analysisResult.factualSummary}
                onForwardToComplaint={() => setActiveTab('justice')}
              />

              {/* Duplicate Detection Badge */}
              <DuplicateDetectorBadge
                duplicateData={duplicateCheckData}
                sha256={analysisResult.sha256Hash || analysisResult.serverSha256}
                perceptualHash={analysisResult.analysis?.perceptualHash || analysisResult.perceptualHash}
              />
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
              Upload an image, audio clip, or video above to trigger real-time Responsible AI scene analysis.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORENSIC CASE TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <VisualEvidenceTimeline
            timeline={timelineData}
            onVerifyInVault={(hash) => setActiveTab('vault')}
          />
        </div>
      )}

      {/* TAB 3: COMPLETENESS & MISSING INFO AUDIT */}
      {activeSubTab === 'completeness' && (
        <div className="space-y-6">
          <CompletenessGauge
            completeness={completenessData || {
              completenessScore: 81,
              breakdown: { mediaIntegrity: 30, timestampMetadata: 25, geolocation: 25, transcriptCorroboration: 8 },
              completedDetails: [
                'High-integrity electronic media files preserved',
                'Device EXIF capture timestamp extracted',
                'Incident geographic coordinates anchored to case session'
              ],
              missingDetails: [
                'Third-party bystander or formal witness statement not yet attached'
              ],
              explanation: 'Forensic evaluation: 81/100 score under Section 63 BSA 2023 standards.'
            }}
          />

          <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Section 63 BSA 2023 / Section 65B IEA Legal Admissibility Checklist</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-teal-400 font-bold font-mono">1. Originality Proof</div>
                <p className="text-slate-300 leading-relaxed">
                  Cryptographic SHA-256 pre-upload hashing verifies identical bits from sensor to courtroom.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-purple-400 font-bold font-mono">2. Tamper-Evidence</div>
                <p className="text-slate-300 leading-relaxed">
                  Blockchain block height & transaction timestamp prove zero post-incident alteration.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-indigo-400 font-bold font-mono">3. Contextual Neutrality</div>
                <p className="text-slate-300 leading-relaxed">
                  AI statements are non-accusatory, preserving objective credibility before judicial officers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DUPLICATE & NEAR-MATCH LAB */}
      {activeSubTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-purple-800/40 p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-teal-400" />
                <span>Forensic Hash Duplicate & Near-Match Query</span>
              </h4>
              <p className="text-xs text-slate-400">
                Input any SHA-256 hash or perceptual difference hash (dHash) to inspect duplicate claims across all dossier records.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={dupTargetInput}
                onChange={(e) => setDupTargetInput(e.target.value)}
                placeholder="Enter SHA-256 hash or 16-character perceptual hash..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleManualDuplicateCheck}
                disabled={isCheckingDup || !dupTargetInput}
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>{isCheckingDup ? 'Scanning...' : 'Check Duplicates'}</span>
              </button>
            </div>

            {dupResult && (
              <div className="pt-3 animate-fade-in">
                <DuplicateDetectorBadge
                  duplicateData={dupResult}
                  sha256={dupTargetInput}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Camera/Microphone Capture Modal */}
      <EvidenceCaptureModal
        isOpen={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
        initialMode={captureMode}
        onCapture={handleCapturedMedia}
      />
    </div>
  );
}

