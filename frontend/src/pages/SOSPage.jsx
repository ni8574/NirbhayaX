import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SOSPulseButton from '../components/sos/SOSPulseButton';
import LiveTrackerMap from '../components/sos/LiveTrackerMap';
import SafetyCircleManager from '../components/sos/SafetyCircleManager';
import CheckInTimer from '../components/sos/CheckInTimer';
import EmergencyDialer from '../components/sos/EmergencyDialer';
import AlertDeliveryLogDrawer from '../components/sos/AlertDeliveryLogDrawer';
import PublicTrackingView from '../components/sos/PublicTrackingView';
import { getQueuedSOSRequests, removeQueuedSOS } from '../services/indexedDB';
import { sosAPI } from '../services/api';
import { streamGPSLocation } from '../services/socket';
import {
  ShieldAlert,
  Radio,
  FileText,
  MessageSquare,
  ArrowRight,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  FolderLock
} from 'lucide-react';

export default function SOSPage({ setActiveTab }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeSession, setActiveSession] = useState(null);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [currentCoords, setCurrentCoords] = useState({ lat: 28.6289, lng: 77.2065, accuracy: 8 });
  const [isAlertLogsOpen, setIsAlertLogsOpen] = useState(false);
  const [isPublicTrackingOpen, setIsPublicTrackingOpen] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  // Monitor geolocation GPS fix in background
  useEffect(() => {
    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed || 0,
            heading: pos.coords.heading || 0
          };
          setCurrentCoords(coords);

          // If SOS active, stream updates via WebSockets and HTTP
          if (activeSession?.sessionId) {
            streamGPSLocation(activeSession.sessionId, pos.coords);
            sosAPI.updateLocation({
              sessionId: activeSession.sessionId,
              ...coords
            }).catch(() => {});
          }
        },
        (err) => console.warn('GPS watcher notice:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeSession?.sessionId]);

  // Check offline queue on load and on online event
  const checkOfflineQueue = async () => {
    try {
      const items = await getQueuedSOSRequests();
      setOfflineQueueCount(items.length);

      // Auto-retry with backoff if back online
      if (items.length > 0 && navigator.onLine) {
        setIsSyncingQueue(true);
        for (const item of items) {
          try {
            const res = await sosAPI.trigger({
              lat: item.lat,
              lng: item.lng,
              triggerType: 'offline_synced_backoff'
            });
            if (res.data?.success) {
              await removeQueuedSOS(item.id);
            }
          } catch (e) {
            console.warn('Sync backoff retry scheduled:', e);
          }
        }
        const updated = await getQueuedSOSRequests();
        setOfflineQueueCount(updated.length);
        setIsSyncingQueue(false);
      }
    } catch (err) {
      console.warn('Queue inspect notice:', err);
    }
  };

  useEffect(() => {
    checkOfflineQueue();
    window.addEventListener('online', checkOfflineQueue);
    return () => window.removeEventListener('online', checkOfflineQueue);
  }, []);

  const handleSOSTriggered = (session, caseId) => {
    setActiveSession(session);
    if (caseId) setActiveCaseId(caseId);
    if (session?.currentLocation) {
      setCurrentCoords(session.currentLocation);
    }
  };

  const handleSOSResolved = () => {
    setActiveSession(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner & Case Journey Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 sm:p-5 rounded-2xl border border-rose-900/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">MODULE 01 • STAGE 1 (PROTECTION)</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">NIRBHAYA SOS HUB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Emergency Distress & Live Geolocation Network
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            One-tap instant alert broadcast, continuous WebSocket GPS streaming, and offline IndexedDB sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Outbound SMS logs button */}
          <button
            onClick={() => setIsAlertLogsOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 text-xs font-semibold transition shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Simulated SMS Log</span>
          </button>

          {/* Active Case link */}
          {activeCaseId && (
            <button
              onClick={() => setActiveTab && setActiveTab('journey')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-900/30"
            >
              <span>Case: {activeCaseId}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Offline Queue Sync Bar if queued */}
      {offlineQueueCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Low-Network Queue:</strong> {offlineQueueCount} emergency alert(s) stored locally in IndexedDB.
            </span>
          </div>
          <button
            onClick={checkOfflineQueue}
            disabled={isSyncingQueue}
            className="px-3 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingQueue ? 'animate-spin' : ''}`} />
            <span>{isSyncingQueue ? 'Syncing...' : 'Retry Sync'}</span>
          </button>
        </div>
      )}

      {/* Grid: Pulse SOS Button & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: SOSPulseButton (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <SOSPulseButton
            activeSession={activeSession}
            onSOSTriggered={handleSOSTriggered}
            onSOSResolved={handleSOSResolved}
          />
          <CheckInTimer onTimerExpired={() => handleSOSTriggered({ sessionId: `MISSED-${Date.now().toString(36).toUpperCase()}`, triggerType: 'missed_checkin' })} />
        </div>

        {/* Right Column: Live Map & Facilities (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <LiveTrackerMap
            activeSession={activeSession}
            currentCoords={currentCoords}
            onOpenPublicLink={() => setIsPublicTrackingOpen(true)}
          />
          <SafetyCircleManager />
        </div>

      </div>

      {/* Full-width Emergency Speed-Dialer */}
      <EmergencyDialer />

      {/* Outbound SMS Log Drawer */}
      <AlertDeliveryLogDrawer
        isOpen={isAlertLogsOpen}
        onClose={() => setIsAlertLogsOpen(false)}
      />

      {/* Public Tracking View Modal */}
      {isPublicTrackingOpen && activeSession && (
        <PublicTrackingView
          sessionId={activeSession.sessionId}
          onClose={() => setIsPublicTrackingOpen(false)}
        />
      )}

    </div>
  );
}

