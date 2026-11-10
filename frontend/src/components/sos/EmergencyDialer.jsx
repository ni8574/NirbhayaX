import React from 'react';
import { PhoneCall, ShieldAlert, HeartHandshake, Siren, Ambulance } from 'lucide-react';

export default function EmergencyDialer() {
  const dialers = [
    { number: '112', title: '112 National Emergency', desc: 'Police • Fire • Ambulance Integrated', color: 'from-rose-600 to-red-700', icon: Siren },
    { number: '1091', title: '1091 Women Helpline', desc: '24/7 Dedicated Women Police Cell', color: 'from-purple-600 to-indigo-700', icon: ShieldAlert },
    { number: '181', title: '181 Women in Distress', desc: 'National Commission for Women / Legal Aid', color: 'from-amber-600 to-orange-700', icon: HeartHandshake },
    { number: '100', title: '100 Police Control', desc: 'Direct Police Response Room', color: 'from-blue-600 to-indigo-700', icon: PhoneCall },
    { number: '102', title: '102 Emergency Ambulance', desc: 'National Health Mission Trauma Dispatch', color: 'from-teal-600 to-emerald-700', icon: Ambulance }
  ];

  return (
    <div className="glass-card p-5 rounded-3xl border border-purple-900/30">
      <div className="flex items-center space-x-2 pb-3 border-b border-purple-900/30 mb-4">
        <PhoneCall className="w-5 h-5 text-rose-400 animate-pulse" />
        <div>
          <h3 className="text-sm font-bold text-white">Emergency Hotline Speed-Dial</h3>
          <p className="text-[11px] text-slate-400">One-tap bypass calling directly to statutory authorities (India)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dialers.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-600/50 flex items-center justify-between group transition transform active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">{item.title}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-teal-300">
                CALL
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

