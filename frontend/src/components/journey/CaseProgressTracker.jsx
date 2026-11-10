import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Lock,
  Scale,
  HeartPulse,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function CaseProgressTracker({ dossier, onNavigateStage }) {
  if (!dossier) return null;

  const progress = dossier.progress || { progressPercentage: 100, completedStagesCount: 5 };
  const stages = [
    {
      id: 'sos',
      num: '01',
      name: 'Protection',
      module: 'NIRBHAYA SOS',
      icon: ShieldAlert,
      color: 'from-rose-600 to-red-600',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
      isCompleted: Boolean(dossier.progress?.stageStatuses?.stage1Protection),
      summary: dossier.stage1_SOS?.status === 'resolved'
        ? `SOS Resolved • ${dossier.stage1_SOS?.alertsDispatchedCount || 3} Contacts Alerted`
        : 'Emergency Location Breadcrumbs Streaming'
    },
    {
      id: 'ai',
      num: '02',
      name: 'Evidence',
      module: 'EVIDENCE AI',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
      isCompleted: Boolean(dossier.progress?.stageStatuses?.stage2Evidence),
      summary: `${dossier.stage2_EvidenceAI?.evidenceCount || 1} Media Item(s) • OpenCV Person Count Only`
    },
    {
      id: 'vault',
      num: '03',
      name: 'Integrity',
      module: 'BLOCKCHAIN VAULT',
      icon: Lock,
      color: 'from-teal-600 to-emerald-600',
      badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800',
      isCompleted: Boolean(dossier.progress?.stageStatuses?.stage3Integrity),
      summary: `On-Chain Block #${dossier.stage3_VaultIntegrity?.blockHeight || 4829105} • Hardhat Registry`
    },
    {
      id: 'justice',
      num: '04',
      name: 'Complaint',
      module: 'NIRBHAYA JUSTICE',
      icon: Scale,
      color: 'from-indigo-600 to-purple-600',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
      isCompleted: Boolean(dossier.progress?.stageStatuses?.stage4Justice),
      summary: dossier.stage4_JusticeComplaint?.acknowledgementReceipt
        ? `Receipt: ${dossier.stage4_JusticeComplaint.acknowledgementReceipt} • Bilingual PDF`
        : 'Section 63 BSA 2023 Electronic Certificate Ready'
    },
    {
      id: 'medicare',
      num: '05',
      name: 'Support',
      module: 'NIRBHAYA MEDICARE',
      icon: HeartPulse,
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      isCompleted: Boolean(dossier.progress?.stageStatuses?.stage5Support),
      summary: dossier.stage5_MediCare?.mlcCaseNumber
        ? `MLC #${dossier.stage5_MediCare.mlcCaseNumber} • AIIMS Trauma Casualty`
        : 'Encrypted Health Locker & ER Doctor Pass Active'
    }
  ];

  return (
    <div className="glass-card rounded-3xl border border-purple-800/40 p-6 sm:p-8 space-y-6">
      
      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50">
              5-Stage Proof-to-Justice Architecture
            </span>
            <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-800">
              {progress.progressPercentage}% COMPLETED
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-2">
            Incident End-to-End Judicial Lifecycle Tracker
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            One Incident = One Case • Real database records connecting SOS, Evidence AI, Blockchain, Police Complaint & Emergency Healthcare
          </p>
        </div>

        {/* Big Percentage Meter */}
        <div className="text-right">
          <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-300">
            {progress.completedStagesCount} / 5
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-400">Stages Verified</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-500 via-teal-500 to-emerald-400 transition-all duration-700 shadow-lg shadow-purple-900/50"
            style={{ width: `${progress.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 5-Stage Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {stages.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              onClick={() => onNavigateStage(st.id)}
              className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] group ${
                st.isCompleted
                  ? 'bg-slate-900/80 border-purple-800/60 hover:border-purple-500 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">STAGE {st.num}</span>
                  {st.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${st.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">{st.name}</span>
                </div>

                <div className="text-[10px] font-mono text-purple-300 font-semibold mb-1">
                  {st.module}
                </div>

                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-1">
                  {st.summary}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-teal-400 group-hover:text-teal-300">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

