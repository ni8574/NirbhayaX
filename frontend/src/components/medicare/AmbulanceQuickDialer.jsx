import React from 'react';
import { Phone, Ambulance, HeartPulse, ShieldAlert, PhoneCall } from 'lucide-react';

export default function AmbulanceQuickDialer() {
  const ambulanceNumbers = [
    {
      number: '102',
      title: 'Free National Ambulance',
      subtitle: 'Free Maternal & Emergency Medical Transit (Govt. of India)',
      badge: 'TOLL FREE',
      color: 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300'
    },
    {
      number: '108',
      title: 'Emergency Medical Service',
      subtitle: 'Disaster, Trauma & Advanced Life Support Ambulance',
      badge: '24/7 ALS',
      color: 'border-red-700/50 bg-red-950/40 text-red-300'
    },
    {
      number: '1099',
      title: 'CATS Ambulance (Delhi NCR)',
      subtitle: 'Centralized Accident & Trauma Services Fleet',
      badge: 'DELHI NCR',
      color: 'border-purple-700/50 bg-purple-950/40 text-purple-300'
    },
    {
      number: '112',
      title: 'National Emergency Helpline',
      subtitle: 'Unified Police, Fire & Medical Response Network',
      badge: 'NATIONAL',
      color: 'border-teal-700/50 bg-teal-950/40 text-teal-300'
    }
  ];

  return (
    <div className="glass-card rounded-2xl border border-purple-800/40 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-red-950/60 border border-red-700/40 text-red-400">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Emergency Ambulance Quick-Dialers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 font-mono">
                1-Tap Dispatch
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Immediate medical dispatch & trauma transit networks across India
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ambulanceNumbers.map((amb) => (
          <a
            key={amb.number}
            href={`tel:${amb.number}`}
            className={`p-4 rounded-xl border flex flex-col justify-between hover:scale-[1.02] transition-all group ${amb.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-teal-300">
                  {amb.number}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-900/80 border border-slate-700">
                  {amb.badge}
                </span>
              </div>
              <div className="font-bold text-xs text-white line-clamp-1">{amb.title}</div>
              <div className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">{amb.subtitle}</div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-white/90">
              <span>Tap to Call</span>
              <PhoneCall className="w-3.5 h-3.5 text-teal-300 group-hover:animate-bounce" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

