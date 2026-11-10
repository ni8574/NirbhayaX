import React, { useState, useEffect } from 'react';
import { subscribeToTracking } from '../../services/socket';
import { sosAPI } from '../../services/api';
import {
  ShieldAlert,
  Compass,
  PhoneCall,
  Navigation,
  Radio,
  CheckCircle,
  ExternalLink,
  X
} from 'lucide-react';

export default function PublicTrackingView({ sessionId, onClose }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveCoords, setLiveCoords] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchSession = async () => {
      try {
        const res = await sosAPI.getTracking(sessionId);
        if (mounted && res.data?.success) {
          setSessionData(res.data.session);
          setLiveCoords(res.data.session.currentLocation);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Tracking session not found or expired.');
          setLoading(false);
        }
      }
    };

    fetchSession();

    // Subscribe to live WebSocket tracking
    const unsubscribe = subscribeToTracking(sessionId, (coords) => {
      if (mounted) {
        setLiveCoords(coords);
      }
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId]);

  const coords = liveCoords || sessionData?.currentLocation || { lat: 28.6289, lng: 77.2065 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-slate-900 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">Live Emergency Location Share</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
                  ACTIVE SOS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Target Identity: <span className="text-teal-300 font-bold">{sessionData?.pseudonymId || 'NX-USER'}</span> (Protected Identity)
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Map Body */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="text-sm text-slate-400 font-mono animate-pulse">Acquiring GPS tracking lock...</div>
          ) : error ? (
            <div className="p-6 text-center text-rose-300 text-xs">{error}</div>
          ) : (
            <>
              <iframe
                title="Public Live Leaflet OSM Map"
                className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 brightness-90 contrast-125"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.02}%2C${coords.lat - 0.015}%2C${coords.lng + 0.02}%2C${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
              ></iframe>

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-rose-600 border-2 border-white shadow-xl items-center justify-center text-white font-bold text-[10px]">
                  SOS
                </span>
              </div>

              {/* Coordinates Pill */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-900/40 text-xs font-mono text-slate-200 shadow-xl pointer-events-none flex items-center space-x-2">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>
                  {Number(coords.lat).toFixed(5)}° N, {Number(coords.lng).toFixed(5)}° E (±{coords.accuracy || 5}m)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Call Bar for Contact */}
        <div className="p-4 bg-slate-950 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            If you are a member of the Safety Circle, verify their status or call first responders immediately.
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="tel:112"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-900/40"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 112 Police</span>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

