import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Phone,
  Building,
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ComplaintStatusTracker({ complaint }) {
  if (!complaint) return null;

  const steps = [
    { id: 'drafted', label: 'Drafted', desc: 'Case evidence compiled' },
    { id: 'submitted', label: 'Submitted', desc: 'Dispatched to intake portal' },
    { id: 'acknowledged', label: 'Acknowledged', desc: 'Official receipt issued' },
    { id: 'under_review', label: 'Under Review', desc: 'Assigned to Investigating Officer' },
    { id: 'resolved', label: 'Resolved', desc: 'FIR / Legal action initiated' }
  ];

  const currentStatus = complaint.status || 'drafted';
  const getStepIndex = (st) => steps.findIndex(s => s.id === st);
  const currentIndex = getStepIndex(currentStatus);

  const history = complaint.statusHistory || [];
  const ack = complaint.acknowledgement;

  return (
    <div className="glass-card rounded-3xl border border-purple-800/40 p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <span>Complaint Real-Time Status & Judicial Intake Tracker</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracking ID: <span className="font-mono text-purple-300 font-bold">{complaint.complaintId}</span> • Station: {complaint.policeStation?.stationName || 'Central Women Safety Station'}
          </p>
        </div>

        {ack?.receiptNumber && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Receipt: {ack.receiptNumber}</span>
          </div>
        )}
      </div>

      {/* 5-Stage Status Progression Stepper */}
      <div className="py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400'
                    : isCompleted
                    ? 'bg-slate-900/80 border-teal-600/50 text-teal-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isCurrent
                      ? 'bg-purple-600 text-white'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <div className={`text-xs font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-teal-300' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investigating Officer & Electronic Receipt Card */}
      {ack && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3 text-xs">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Assigned Investigating Officer</div>
              <div className="text-slate-300 mt-0.5">Badge #{ack.officerBadgeNumber || 'DL-WSD-8329'}</div>
              <div className="text-[11px] text-slate-400 mt-1">Specialized Women Safety & Cyber Forensics Cell</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3 text-xs">
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-700/50 text-teal-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Jurisdictional Police Station</div>
              <div className="text-slate-300 mt-0.5">{complaint.policeStation?.stationName || 'Central Women Safety Station'}</div>
              <div className="text-[11px] text-slate-400 mt-1">District: {complaint.policeStation?.district || 'Central'}, State: {complaint.policeStation?.state || 'Delhi'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Status Events Audit Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Intake Status Log History
        </h4>
        <div className="space-y-2">
          {history.map((h, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"></span>
                <span className="font-bold text-white uppercase font-mono text-[11px]">{h.status}</span>
                <span className="text-slate-300">— {h.note}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(h.changedAt).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Escalation & Legal Aid Helplines */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-200 flex items-center space-x-1.5 uppercase tracking-wide">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>Official Emergency Escalation & Legal Aid Helplines (India)</span>
          </span>
          <span className="text-[10px] font-mono text-purple-300">Toll-Free 24/7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">National Emergency</div>
            <a href="tel:112" className="text-base font-bold text-red-400 hover:underline">112</a>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Women Helpline</div>
            <a href="tel:1091" className="text-base font-bold text-teal-400 hover:underline">1091</a>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">National Commission (NCW)</div>
            <a href="tel:7827170170" className="text-xs font-bold text-purple-400 hover:underline">7827170170</a>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Legal Aid (DLSA)</div>
            <a href="tel:15100" className="text-base font-bold text-indigo-400 hover:underline">15100</a>
          </div>
        </div>
      </div>

      {/* Simulated Demo Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Demo Notice:</strong> In this evaluation environment, electronic police intake and IO assignment are simulated to demonstrate the end-to-end judicial lifecycle without creating actual state law enforcement dispatches.
        </p>
      </div>
    </div>
  );
}

