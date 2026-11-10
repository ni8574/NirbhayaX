import React, { useState } from 'react';
import { Film, Clock, Eye, Download, CheckCircle2 } from 'lucide-react';

export default function KeyframeTimelineViewer({ keyframes }) {
  const [selectedFrame, setSelectedFrame] = useState(0);

  if (!keyframes || keyframes.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/40 text-purple-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Video Keyframe Extraction</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                OpenCV Interval Sampling
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {keyframes.length} keyframes preserved for forensic sequence analysis
            </p>
          </div>
        </div>
      </div>

      {/* Selected Frame Focus Preview */}
      {keyframes[selectedFrame] && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-purple-900/60 flex items-center justify-center">
          {keyframes[selectedFrame].thumbnailBase64 ? (
            <img
              src={keyframes[selectedFrame].thumbnailBase64}
              alt={`Keyframe ${selectedFrame + 1}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center">
              <Film className="w-12 h-12 text-purple-500/50 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">
                {keyframes[selectedFrame].label || `Keyframe Milestone #${selectedFrame + 1}`}
              </div>
              <div className="text-xs text-purple-400 font-mono mt-1">
                Timestamp: {keyframes[selectedFrame].timestamp || `${selectedFrame * 2.0}s`}
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-purple-700/50 text-[10px] text-purple-300 font-mono flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Timestamp: {keyframes[selectedFrame].timestamp || `${selectedFrame * 1.8}s`}</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
            Frame {selectedFrame + 1} of {keyframes.length}
          </div>
        </div>
      )}

      {/* Frame Carousel / Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        {keyframes.map((kf, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedFrame(idx)}
            className={`p-1.5 rounded-xl border text-left transition-all ${
              selectedFrame === idx
                ? 'bg-purple-950/80 border-purple-500 shadow-md ring-1 ring-purple-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center mb-1.5 border border-slate-800">
              {kf.thumbnailBase64 ? (
                <img src={kf.thumbnailBase64} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <Film className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between">
              <span>{kf.timestamp || `${idx * 1.8}s`}</span>
              {selectedFrame === idx && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

