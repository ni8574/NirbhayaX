import React, { useState, useEffect, useRef } from 'react';
import { sosAPI } from '../../services/api';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  ShieldCheck
} from 'lucide-react';

export default function CheckInTimer({ onTimerExpired }) {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [timerStatus, setTimerStatus] = useState('idle'); // 'idle' | 'running' | 'expired_alerted' | 'resolved'
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, secondsRemaining]);

  const handleStartTimer = async () => {
    setLoading(true);
    try {
      await sosAPI.startCheckIn(selectedMinutes);
      setSecondsRemaining(selectedMinutes * 60);
      setIsRunning(true);
      setTimerStatus('running');
    } catch (err) {
      console.warn('API error, starting local timer:', err.message);
      setSecondsRemaining(selectedMinutes * 60);
      setIsRunning(true);
      setTimerStatus('running');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTimer = async () => {
    setLoading(true);
    try {
      await sosAPI.cancelCheckIn();
    } catch (err) {
      console.warn('Cancel API error:', err);
    } finally {
      setIsRunning(false);
      setTimerStatus('resolved');
      setLoading(false);
      setTimeout(() => setTimerStatus('idle'), 3000);
    }
  };

  // Automated trigger when user fails to check in before zero!
  const handleAutoExpire = async () => {
    setIsRunning(false);
    setTimerStatus('expired_alerted');
    if (onTimerExpired) {
      onTimerExpired();
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-purple-900/30">
      <div className="flex items-center space-x-2 pb-3 border-b border-purple-900/30 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Emergency Check-in Timer</h3>
          <p className="text-[11px] text-slate-400">
            Walking alone at night? Set a safety countdown. If you don't check in, an automatic alert is dispatched.
          </p>
        </div>
      </div>

      {isRunning ? (
        <div className="text-center py-4 space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-slate-950 shadow-inner">
              <span className="text-3xl font-extrabold font-mono text-amber-300 animate-pulse">
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Check-in active. Automatic SOS will trigger if this timer reaches 00:00 without confirmation.
          </p>

          <button
            onClick={handleCancelTimer}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-teal-900/30 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Have Arrived Safely (Stop Timer)</span>
          </button>
        </div>
      ) : timerStatus === 'expired_alerted' ? (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-center space-y-2">
          <div className="inline-flex p-2 rounded-full bg-rose-500/20 text-rose-400">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-sm font-bold text-rose-300">MISSED CHECK-IN ALERT TRIGGERED!</h4>
          <p className="text-xs text-slate-300">
            Safety Circle contacts have been alerted with your last known coordinates.
          </p>
          <button
            onClick={() => setTimerStatus('idle')}
            className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto"
          >
            Reset Check-in
          </button>
        </div>
      ) : timerStatus === 'resolved' ? (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-300">Marked Safe!</h4>
          <p className="text-xs text-slate-300">Emergency timer stopped. No alert dispatched.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => setSelectedMinutes(mins)}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  selectedMinutes === mins
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          <button
            onClick={handleStartTimer}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start {selectedMinutes}-Minute Safety Timer</span>
          </button>
        </div>
      )}

    </div>
  );
}

