import React, { useState, useEffect, useRef } from 'react';
import { subscribeToTracking } from '../../services/socket';
import { sosAPI } from '../../services/api';
import {
  MapPin,
  Share2,
  Copy,
  Check,
  Shield,
  Cross,
  Navigation,
  Compass,
  Radio
} from 'lucide-react';

export default function LiveTrackerMap({ activeSession, currentCoords, onOpenPublicLink }) {
  const [facilities, setFacilities] = useState([]);
  const [copied, setCopied] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [liveLocation, setLiveLocation] = useState(
    currentCoords || { lat: 28.6289, lng: 77.2065, accuracy: 8 }
  );

  const trackingUrl = activeSession
    ? `${window.location.origin}/track/${activeSession.sessionId}`
    : null;

  // Sync coords from parent
  useEffect(() => {
    if (currentCoords?.lat && currentCoords?.lng) {
      setLiveLocation(currentCoords);
    }
  }, [currentCoords]);

  // Fetch nearby facilities
  useEffect(() => {
    let mounted = true;
    const loadFacilities = async () => {
      try {
        const res = await sosAPI.getNearbyFacilities(liveLocation.lat, liveLocation.lng);
        if (mounted && res.data?.success) {
          setFacilities(res.data.facilities);
        }
      } catch (err) {
        console.warn('Could not load facilities:', err.message);
      }
    };
    loadFacilities();
    return () => { mounted = false; };
  }, [liveLocation.lat, liveLocation.lng]);

  // Subscribe to WebSocket live updates for active session
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const unsubscribe = subscribeToTracking(activeSession.sessionId, (newCoords) => {
      setLiveLocation({
        lat: newCoords.lat,
        lng: newCoords.lng,
        accuracy: newCoords.accuracy || 5,
        speed: newCoords.speed || 0,
        timestamp: newCoords.timestamp
      });
      setLocationHistory(prev => [...prev.slice(-15), { lat: newCoords.lat, lng: newCoords.lng }]);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeSession?.sessionId]);

  const copyTrackingLink = () => {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl border border-purple-900/30 overflow-hidden flex flex-col">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-purple-900/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Live Geolocation & Incident Tracking</h3>
          {activeSession && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/40 animate-pulse">
              <Radio className="w-2.5 h-2.5" />
              <span>STREAMING LIVE</span>
            </span>
          )}
        </div>

        {/* Shareable Tracking Link */}
        {activeSession && (
          <div className="flex items-center space-x-2">
            <button
              onClick={copyTrackingLink}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Tracking Link'}</span>
            </button>
            <button
              onClick={onOpenPublicLink}
              className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold transition flex items-center space-x-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>
          </div>
        )}
      </div>

      {/* Map View / Simulated Responsive OpenStreetMap Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Interactive OpenStreetMap Embed IFrame for crisp real Leaflet/OSM rendering without API keys */}
        <iframe
          title="OpenStreetMap Live Tracking"
          className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 brightness-90 contrast-125"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${liveLocation.lng - 0.02}%2C${liveLocation.lat - 0.015}%2C${liveLocation.lng + 0.02}%2C${liveLocation.lat + 0.015}&layer=mapnik&marker=${liveLocation.lat}%2C${liveLocation.lng}`}
        ></iframe>

        {/* Live GPS Beacon Marker Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-600 border-2 border-white shadow-lg items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </span>
          </div>
        </div>

        {/* Telemetry Floating Card */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-purple-800/40 text-[11px] font-mono text-slate-300 shadow-xl pointer-events-none">
          <div className="flex items-center space-x-1.5 text-teal-400 font-bold mb-1">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>GPS FIX (WGS84)</span>
          </div>
          <div>Lat: {Number(liveLocation.lat).toFixed(5)}° N</div>
          <div>Lng: {Number(liveLocation.lng).toFixed(5)}° E</div>
          <div className="text-slate-400">Accuracy: ±{liveLocation.accuracy || 8}m</div>
        </div>

      </div>

      {/* Nearby Facilities Ribbon */}
      <div className="p-4 bg-slate-950 border-t border-purple-900/20">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>Closest Verified Emergency Facilities (Haversine Matrix):</span>
          <span className="text-[10px] text-teal-400 font-mono">Real-Time Proximity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {facilities.slice(0, 4).map((fac) => (
            <div
              key={fac.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between hover:border-purple-700/40 transition"
            >
              <div className="flex items-start space-x-2">
                <div className={`p-1.5 rounded-lg mt-0.5 ${fac.type === 'police' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                  {fac.type === 'police' ? <Shield className="w-3.5 h-3.5" /> : <Cross className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-200 line-clamp-1">{fac.name}</div>
                  <div className="text-[10px] text-slate-400">{fac.address}</div>
                </div>
              </div>

              <div className="text-right pl-2">
                <span className="font-mono text-teal-300 font-bold text-xs">{fac.distanceKm} km</span>
                <a
                  href={`tel:${fac.emergencyNumber}`}
                  className="block text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                >
                  Dial {fac.emergencyNumber}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

