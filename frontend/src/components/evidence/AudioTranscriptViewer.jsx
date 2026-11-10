import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, Activity, Tag, Sparkles } from 'lucide-react';

export default function AudioTranscriptViewer({ audioAnalysis }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!audioAnalysis) return null;

  const transcript = audioAnalysis.transcript || 'No verbal speech detected in electronic recording.';
  const keywords = audioAnalysis.detectedKeywords || [];
  const acousticContext = audioAnalysis.acousticContext || 'Ambient acoustic profile processed.';
  const stressLevel = audioAnalysis.stressLevel || 'ALERT';
  const duration = audioAnalysis.durationSeconds || 12;

  const getStressBadge = (level) => {
    switch (level) {
      case 'HIGH_DISTRESS':
        return 'bg-red-950/80 text-red-300 border-red-700/60 animate-pulse';
      case 'ALERT':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      default:
        return 'bg-teal-950/80 text-teal-300 border-teal-700/60';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-teal-800/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-700/40 text-teal-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Speech-to-Text Transcription</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-300 font-mono">
                Whisper AI STT
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Duration: {duration}s • Acoustic stress evaluation
            </p>
          </div>
        </div>

        {/* Stress Indicator */}
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${getStressBadge(stressLevel)}`}>
          {stressLevel.replace('_', ' ')}
        </span>
      </div>

      {/* Transcript Text Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative">
        <div className="text-xs text-slate-400 font-mono mb-1.5 uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Factual Transcript</span>
        </div>
        <p className="text-sm text-slate-100 font-medium leading-relaxed italic">
          "{transcript}"
        </p>
      </div>

      {/* Extracted Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Extracted Distress Keywords:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-medium"
              >
                "{kw}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Acoustic Context */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-300">
        <Activity className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-white">Acoustic Environmental Analysis: </span>
          <span>{acousticContext}</span>
        </div>
      </div>
    </div>
  );
}

