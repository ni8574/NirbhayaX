import React, { useState, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  UserCheck,
  Hospital,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export default function TeleconsultationModal({ isOpen, onClose }) {
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const messages = [
    {
      sender: 'Dr. Sunita Rao, MD',
      role: 'Emergency Casualty & Trauma Specialist',
      hospital: 'Apex Trauma Center (AIIMS)',
      time: '0:05',
      text: 'Namaste Priya. I am Dr. Sunita Rao on duty at AIIMS Trauma Center. I have securely received your encrypted medical locker (B+ blood group, asthma inhaler on record) and your live GPS location. Are you in a safe environment right now?'
    },
    {
      sender: 'Patient (Priya Sharma)',
      role: 'Protected Citizen',
      time: '0:18',
      text: 'Yes Doctor, I am inside the metro station security booth with the CISF officers now. My wrist and shoulder have severe bruising from the struggle.'
    },
    {
      sender: 'Dr. Sunita Rao, MD',
      role: 'Emergency Casualty & Trauma Specialist',
      hospital: 'Apex Trauma Center (AIIMS)',
      time: '0:35',
      text: 'Understood. I am formally logging Medico-Legal Case MLC-AIIMS-2026-8812. Apply a cold compress to the forearm contusion. I have notified the casualty desk at RML Hospital (0.7 km from you) for priority trauma review and an immediate X-ray.'
    }
  ];

  useEffect(() => {
    let interval;
    if (isOpen) {
      setCallDuration(0);
      setActiveMessageIndex(0);
      interval = setInterval(() => {
        setCallDuration(d => {
          const next = d + 1;
          if (next === 6) setActiveMessageIndex(1);
          if (next === 14) setActiveMessageIndex(2);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-teal-800/60 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Call Header */}
        <div className="p-4 bg-slate-950 border-b border-teal-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>Dr. Sunita Rao, MD (AIIMS Casualty)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900 text-teal-300 font-mono">
                  DMC-44819
                </span>
              </h4>
              <p className="text-[11px] text-teal-400 font-mono">
                Encrypted WebRTC Teleconsultation • {String(Math.floor(callDuration / 60)).padStart(2, '0')}:{String(callDuration % 60).padStart(2, '0')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AES-256 SECURED</span>
          </div>
        </div>

        {/* Video Viewport Simulated Feed */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-slate-800">
          
          {/* Main Remote Feed (Doctor) */}
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-teal-950 border-2 border-teal-400 flex items-center justify-center text-teal-300 text-2xl font-bold mb-3 shadow-xl shadow-teal-900/40">
              SR
            </div>
            <div className="text-base font-bold text-white">Dr. Sunita Rao, MD</div>
            <div className="text-xs text-teal-300 font-mono">Apex Trauma Center, AIIMS New Delhi</div>
            <div className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Attending Emergency Casualty Physician & Trauma Counselor
            </div>
          </div>

          {/* Picture-in-Picture Local Feed (Patient) */}
          <div className="absolute bottom-3 right-3 w-32 aspect-video bg-slate-900 rounded-xl border border-purple-600/50 overflow-hidden shadow-lg flex items-center justify-center">
            {!isVideoMuted ? (
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-purple-900 border border-purple-400 text-white text-[10px] flex items-center justify-center mx-auto mb-1">
                  PS
                </div>
                <span className="text-[9px] font-mono text-purple-300">Priya (You)</span>
              </div>
            ) : (
              <VideoOff className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </div>

        {/* Real-Time Clinical Dialogue Transcript Stream */}
        <div className="p-4 bg-slate-950/90 max-h-40 overflow-y-auto space-y-2.5 border-b border-slate-800 text-xs">
          {messages.slice(0, activeMessageIndex + 1).map((msg, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-teal-300">{msg.sender} <span className="text-slate-500 font-normal">({msg.role})</span></span>
                <span className="font-mono text-slate-500 text-[10px]">{msg.time}</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed italic">
                "{msg.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Call Controls Footer */}
        <div className="p-4 bg-slate-950 flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-3 rounded-2xl border transition-all ${
              isAudioMuted
                ? 'bg-red-950/80 border-red-700 text-red-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className={`p-3 rounded-2xl border transition-all ${
              isVideoMuted
                ? 'bg-red-950/80 border-red-700 text-red-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-950/50"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Teleconsultation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

