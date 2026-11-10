import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Hospital,
  Lock,
  Ambulance,
  Video,
  Key,
  ShieldCheck,
  PhoneCall,
  Activity,
  FileCheck
} from 'lucide-react';
import AmbulanceQuickDialer from '../components/medicare/AmbulanceQuickDialer';
import EmergencyFacilitiesMap from '../components/medicare/EmergencyFacilitiesMap';
import EncryptedMedicalLocker from '../components/medicare/EncryptedMedicalLocker';
import DoctorAccessPassModal from '../components/medicare/DoctorAccessPassModal';
import TeleconsultationModal from '../components/medicare/TeleconsultationModal';
import { medicareAPI } from '../services/api';

export default function MedicarePage({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('map'); // 'map', 'locker', 'dialer'
  const [lockerData, setLockerData] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [teleconsultOpen, setTeleconsultOpen] = useState(false);
  const [userCoords, setUserCoords] = useState({ lat: 28.6295, lng: 77.2075 });

  useEffect(() => {
    fetchLocker();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserCoords({ lat: 28.6295, lng: 77.2075 })
      );
    }
  }, []);

  const fetchLocker = async () => {
    try {
      const res = await medicareAPI.getLocker();
      if (res.data?.success) {
        setLockerData(res.data.data);
      }
    } catch (e) {
      console.warn('Locker fetch error:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50 flex items-center space-x-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                <span>Module 5 • NIRBHAYA MEDICARE</span>
              </span>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50">
                AES-256-GCM Locker + OpenStreetMap
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Emergency Healthcare & Trauma Response System
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time emergency hospital proximity mapping, 1-tap ambulance dispatch, instant trauma teleconsultation with AIIMS doctors, and zero-knowledge encrypted medical records with consent-based sharing.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setTeleconsultOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-teal-950/50"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Connect AIIMS Doctor</span>
            </button>

            <button
              onClick={() => setPassModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5 text-teal-300" />
              <span>24h Doctor Pass</span>
            </button>
          </div>
        </div>

        {/* Status Ribbon */}
        <div className="mt-6 pt-4 border-t border-teal-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              <strong>Zero-Knowledge Health Privacy:</strong> AES-256 encrypted off-chain. Attending ER doctors access records solely via your temporary 24h pass.
            </span>
          </div>
          <span className="font-mono text-[11px] text-red-400 bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-800/50 font-bold">
            Emergency Casualty: 102 / 108
          </span>
        </div>
      </div>

      {/* Ambulance Quick Dialer Component (Always visible for safety) */}
      <AmbulanceQuickDialer />

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-teal-900/30 pb-3">
        <button
          onClick={() => setActiveSubTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'map'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 border border-teal-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span>Emergency Facilities Map</span>
        </button>

        <button
          onClick={() => setActiveSubTab('locker')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'locker'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 border border-teal-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Encrypted Medical Locker & MLC</span>
        </button>
      </div>

      {/* Tab 1: Map */}
      {activeSubTab === 'map' && (
        <EmergencyFacilitiesMap userCoords={userCoords} />
      )}

      {/* Tab 2: Encrypted Locker */}
      {activeSubTab === 'locker' && (
        <EncryptedMedicalLocker
          lockerData={lockerData}
          onRefresh={fetchLocker}
          onOpenDoctorPass={() => setPassModalOpen(true)}
          onOpenTeleconsult={() => setTeleconsultOpen(true)}
        />
      )}

      {/* Modals */}
      <DoctorAccessPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        onPassCreated={() => fetchLocker()}
      />

      <TeleconsultationModal
        isOpen={teleconsultOpen}
        onClose={() => setTeleconsultOpen(false)}
      />
    </div>
  );
}

