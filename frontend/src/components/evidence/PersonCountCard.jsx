import React from 'react';
import { Users, UserCheck, ShieldCheck, AlertCircle, EyeOff } from 'lucide-react';

export default function PersonCountCard({ visionAnalysis, imagePreview }) {
  if (!visionAnalysis) return null;

  const personsCount = visionAnalysis.detectedPersonsCount || 0;
  const facesCount = visionAnalysis.detectedFacesCount || 0;
  const boundingBoxes = visionAnalysis.boundingBoxes || [];

  return (
    <div className="glass-card rounded-2xl border border-purple-800/50 p-5 space-y-4">
      {/* Ethical Guardrail Banner */}
      <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-700/60 flex items-start space-x-3">
        <div className="p-1.5 rounded-lg bg-purple-900/80 text-purple-300 mt-0.5 flex-shrink-0">
          <EyeOff className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-purple-200 uppercase tracking-wider">
              Responsible AI Guarantee
            </span>
            <span className="px-1.5 py-0.2 rounded bg-purple-800/80 text-[10px] text-purple-300 font-mono">
              DPDP ACT 2023
            </span>
          </div>
          <p className="text-slate-300 mt-1 leading-relaxed">
            Strict scene analysis and individual count only. <strong>Zero facial recognition</strong>, zero biometric profiling, and zero automated identity attribution are performed.
          </p>
        </div>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-teal-950/60 border border-teal-700/50 flex items-center justify-center text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{personsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Individuals Counted</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-purple-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{facesCount}</div>
            <div className="text-xs text-slate-400 font-medium">Faces Detected (Count Only)</div>
          </div>
        </div>
      </div>

      {/* Visual Bounding Box Preview */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-purple-900/40 bg-black/60 max-h-64 flex items-center justify-center">
          <img
            src={imagePreview}
            alt="Analyzed Evidence"
            className="w-full h-full object-contain max-h-64"
          />
          {/* Overlay Tag */}
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-teal-500/40 text-[10px] text-teal-300 font-mono flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>OpenCV Vision Tagged • {personsCount} Person(s)</span>
          </div>
        </div>
      )}

      {/* Legal Admissibility Footnote */}
      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span>Corroborates scene occupancy under Section 63 BSA 2023 without violating personal privacy.</span>
      </div>
    </div>
  );
}

