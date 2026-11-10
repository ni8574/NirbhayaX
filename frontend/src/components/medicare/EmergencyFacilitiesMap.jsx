import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Hospital,
  HeartPulse,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { medicareAPI } from '../../services/api';

export default function EmergencyFacilitiesMap({ userCoords }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'women', 'trauma'
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const coords = userCoords || { lat: 28.6295, lng: 77.2075 };

  useEffect(() => {
    let mounted = true;
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await medicareAPI.getFacilities(coords.lat, coords.lng, selectedFilter);
        if (mounted && res.data?.success) {
          setFacilities(res.data.data);
          if (res.data.data.length > 0 && !selectedFacility) {
            setSelectedFacility(res.data.data[0]);
          }
        }
      } catch (err) {
        console.warn('Facility fetch warning:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFacilities();
    return () => { mounted = false; };
  }, [coords.lat, coords.lng, selectedFilter]);

  const activeFac = selectedFacility || facilities[0];

  return (
    <div className="glass-card rounded-3xl border border-teal-800/40 overflow-hidden flex flex-col space-y-4 p-5 sm:p-6">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-700/40 text-teal-400">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Emergency Healthcare & Trauma Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 font-mono">
                OpenStreetMap
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Verified emergency casualty wards, trauma centers & gynecological care units
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Centers ({facilities.length})
          </button>
          <button
            onClick={() => setSelectedFilter('women')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedFilter === 'women'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Women & Gynecology
          </button>
          <button
            onClick={() => setSelectedFilter('trauma')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedFilter === 'trauma'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            24/7 Trauma & MLC
          </button>
        </div>
      </div>

      {/* Map & Facility Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Map Canvas (7 cols on large screens) */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-teal-900/40 relative h-72 sm:h-96 bg-slate-950">
          <iframe
            title="OpenStreetMap Emergency Facilities"
            className="w-full h-full border-0 filter invert contrast-125 hue-rotate-180"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.05}%2C${coords.lat - 0.04}%2C${coords.lng + 0.05}%2C${coords.lat + 0.04}&layer=mapnik&marker=${activeFac?.lat || coords.lat}%2C${activeFac?.lng || coords.lng}`}
          />

          {/* User Location Pulse Marker */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-teal-500/40 text-[11px] text-teal-300 font-mono flex items-center space-x-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>Your Incident GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          </div>

          {/* Active Facility Focus Overlay */}
          {activeFac && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-teal-700/50 flex items-center justify-between gap-3 text-xs shadow-xl">
              <div className="truncate">
                <span className="font-bold text-white block truncate">{activeFac.name}</span>
                <span className="text-[11px] text-teal-400 font-mono">
                  {activeFac.distanceKm} km away • ~{activeFac.approxDriveTimeMinutes} min emergency transit
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeFac.lat},${activeFac.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1 flex-shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
            </div>
          )}
        </div>

        {/* Facility Cards List (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {facilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-teal-950/60 border-teal-500 ring-1 ring-teal-400/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="font-bold text-xs text-white block truncate">{fac.name}</span>
                    <span className="text-[10px] text-teal-300 font-mono">{fac.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800 flex-shrink-0">
                    {fac.distanceKm} km
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {fac.address}
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {fac.specialties.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {s}
                    </span>
                  ))}
                  {fac.specialties.length > 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                      +{fac.specialties.length - 2} more
                    </span>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[130px]">{fac.operatingHours}</span>
                  </span>
                  <a
                    href={`tel:${fac.phone.split('/')[0].trim()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-teal-400 hover:text-teal-300 flex items-center space-x-1 font-semibold text-[11px]"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Casualty</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

