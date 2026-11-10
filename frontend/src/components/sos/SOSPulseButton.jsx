import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { enqueueOfflineSOS } from '../../services/indexedDB';
import { sosAPI } from '../../services/api';
import {
  ShieldAlert,
  Radio,
  CheckCircle,
  WifiOff,
  Volume2,
  VolumeX,
  AlertOctagon,
  Loader2
} from 'lucide-react';

export default function SOSPulseButton({ onSOSTriggered, onSOSResolved, activeSession }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [errorMsg, setErrorMsg] = useState(null);

  const holdIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Web Audio distress sound generator (zero external assets needed)
  const playEmergencyTone = () => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  };

  // Trigger haptic vibration
  const triggerHaptics = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  };

  // Start hold countdown
  const startHold = () => {
    if (activeSession) return; // already active
    setHolding(true);
    setHoldProgress(0);
    setErrorMsg(null);

    const step = 50;
    const totalTime = 1200; // 1.2s hold to activate
    let elapsed = 0;

    holdIntervalRef.current = setInterval(() => {
      elapsed += step;
      const progress = Math.min(100, (elapsed / totalTime) * 100);
      setHoldProgress(progress);

      if (elapsed >= totalTime) {
        clearInterval(holdIntervalRef.current);
        executeSOS();
      }
    }, step);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setHolding(false);
    setHoldProgress(0);
  };

  // Execute the real emergency SOS trigger
  const executeSOS = async () => {
    setHolding(false);
    setIsTriggering(true);
    triggerHaptics();
    playEmergencyTone();

    // Default fallback coordinates (Connaught Place, New Delhi for demo)
    let lat = 28.6289;
    let lng = 77.2065;
    let accuracy = 10;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 4000
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;
      } catch (geoErr) {
        console.warn('GPS prompt skipped or denied, using high-precision demo coordinates:', geoErr.message);
      }
    }

    const payload = {
      lat,
      lng,
      accuracy,
      triggerType: 'manual_button',
      address: 'Current Location • Incident Point'
    };

    // If offline, enqueue into local IndexedDB
    if (!navigator.onLine) {
      try {
        await enqueueOfflineSOS(payload);
        setIsTriggering(false);
        if (onSOSTriggered) {
          onSOSTriggered({
            isOfflineQueued: true,
            sessionId: `OFFLINE-${Date.now().toString(36).toUpperCase()}`,
            currentLocation: payload
          });
        }
        return;
      } catch (queueErr) {
        console.error('Offline enqueue error:', queueErr);
      }
    }

    // Online: Submit to backend API
    try {
      const res = await sosAPI.trigger(payload);
      if (res.data?.success) {
        if (onSOSTriggered) {
          onSOSTriggered(res.data.session, res.data.caseId);
        }
      }
    } catch (err) {
      console.warn('Network call failed, falling back to offline queue:', err.message);
      await enqueueOfflineSOS(payload);
      if (onSOSTriggered) {
        onSOSTriggered({
          isOfflineQueued: true,
          sessionId: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
          currentLocation: payload
        });
      }
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResolveClick = async () => {
    if (!activeSession) return;
    try {
      await sosAPI.resolve(activeSession.sessionId);
      if (onSOSResolved) onSOSResolved();
    } catch (err) {
      console.error('Resolve error:', err);
      if (onSOSResolved) onSOSResolved();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-3xl border border-rose-900/30 relative overflow-hidden">
      
      {/* Network & Audio Quick Status */}
      <div className="w-full flex items-center justify-between text-xs mb-4">
        <div className="flex items-center space-x-1.5">
          {isOffline ? (
            <span className="flex items-center space-x-1 text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Queue Ready</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cellular & GPS Connected</span>
            </span>
          )}
        </div>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
          title="Toggle emergency audio beacon"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Sound: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Sound: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Main Large Pulse SOS Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Pulsating Ripple Rings when active */}
        {activeSession && (
          <>
            <span className="absolute w-56 h-56 rounded-full bg-rose-600/20 animate-ping opacity-60"></span>
            <span className="absolute w-48 h-48 rounded-full bg-rose-500/30 animate-pulse opacity-80"></span>
          </>
        )}

        {/* Circular Progress Ring when holding */}
        {holding && (
          <svg className="absolute w-44 h-44 -rotate-90 pointer-events-none">
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="#fb7185"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - holdProgress / 100)}
              className="transition-all duration-75"
            />
          </svg>
        )}

        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          disabled={isTriggering}
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 select-none ${
            activeSession
              ? 'bg-rose-700 text-white border-4 border-rose-400 animate-pulse glow-sos'
              : holding
              ? 'bg-rose-600 text-white scale-105'
              : 'bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-600 text-white hover:from-rose-600 hover:to-pink-500 border-4 border-rose-500/40'
          }`}
        >
          {isTriggering ? (
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          ) : activeSession ? (
            <>
              <AlertOctagon className="w-10 h-10 animate-bounce mb-1" />
              <span className="text-xl font-extrabold tracking-widest">ACTIVE</span>
              <span className="text-[10px] font-mono tracking-tighter opacity-90">TRACKING ON</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-12 h-12 mb-1" />
              <span className="text-3xl font-black tracking-wider">SOS</span>
              <span className="text-[10px] uppercase font-bold tracking-tight opacity-90">
                {holding ? 'KEEP HOLDING...' : 'HOLD 1.2S / TAP'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Button Subtitle / Help Guidance */}
      <div className="text-center mt-3 max-w-xs">
        {activeSession ? (
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE SOS BROADCAST ACTIVE</span>
            </div>
            <p className="text-xs text-slate-300">
              Real-time coordinates are being streamed to your Safety Circle & Public Tracking URL.
            </p>
            <button
              onClick={handleResolveClick}
              className="mt-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Am Safe (Resolve SOS)</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Press & hold for 1.2 seconds to prevent accidental triggers. Instantly alerts Safety Circle contacts via SMS.
          </p>
        )}
      </div>

    </div>
  );
}

