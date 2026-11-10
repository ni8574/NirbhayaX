import React, { useState } from 'react';
import {
  Lock,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Plus,
  UserCheck,
  FileText,
  Key,
  Video,
  Activity,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { medicareAPI } from '../../services/api';

export default function EncryptedMedicalLocker({
  lockerData,
  onRefresh,
  onOpenDoctorPass,
  onOpenTeleconsult
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(lockerData?.profile?.bloodGroup || 'B+');
  const [allergiesText, setAllergiesText] = useState((lockerData?.profile?.allergies || ['Penicillin', 'Sulfa Drugs']).join(', '));
  const [medicationsText, setMedicationsText] = useState((lockerData?.profile?.emergencyMedications || ['Inhaler (Asthma)']).join(', '));
  const [emergencyContact, setEmergencyContact] = useState(lockerData?.profile?.emergencyContactName || 'Aarti Sharma (Sister)');
  const [emergencyPhone, setEmergencyPhone] = useState(lockerData?.profile?.emergencyContactPhone || '+91 98112 23344');
  
  // Injury logger state
  const [showAddInjury, setShowAddInjury] = useState(false);
  const [bodyPart, setBodyPart] = useState('Left Forearm & Wrist');
  const [injuryType, setInjuryType] = useState('Blunt Contusion / Abrasion');
  const [severity, setSeverity] = useState('Moderate');
  const [injuryNotes, setInjuryNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const profile = lockerData?.profile || {};
  const injuries = lockerData?.injuryDocumentation || [];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        profile: {
          bloodGroup,
          allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
          emergencyMedications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
          emergencyContactName: emergencyContact,
          emergencyContactPhone: emergencyPhone,
          organDonorStatus: true
        },
        mlcCaseNumber: lockerData?.mlcCaseNumber || 'MLC-AIIMS-2026-8812'
      };

      await medicareAPI.updateLocker(payload);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInjury = async (e) => {
    e.preventDefault();
    try {
      await medicareAPI.logInjury({
        bodyPart,
        injuryType,
        severity,
        notes: injuryNotes || 'Clinical injury sustained during emergency distress incident.'
      });
      setShowAddInjury(false);
      setInjuryNotes('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-purple-800/40 p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-teal-400" />
              <span>AES-256-GCM Authenticated Encryption</span>
            </span>
            {lockerData?.mlcCaseNumber && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-700/50 font-bold">
                {lockerData.mlcCaseNumber}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mt-1.5 flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-red-400" />
            <span>Encrypted Emergency Medical Locker & MLC Registry</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-knowledge health record • Client-isolated keys • Instant consent sharing with attending trauma ER doctors
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTeleconsult}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-950/50"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Instant Teleconsultation</span>
          </button>

          <button
            onClick={onOpenDoctorPass}
            className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Key className="w-3.5 h-3.5 text-teal-300" />
            <span>Generate 24h Doctor Pass</span>
          </button>
        </div>
      </div>

      {/* Health Profile Fields */}
      {!isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Blood Group</span>
            <span className="text-2xl font-black text-red-400 font-mono mt-0.5 block">
              {profile.bloodGroup || 'B+'}
            </span>
            <span className="text-[10px] text-slate-500">Universal Compatible Test</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Critical Allergies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(profile.allergies || ['None Reported']).map((a, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/50 font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Emergency Meds</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {(profile.emergencyMedications || ['None']).join(', ')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Next of Kin Contact</span>
            <span className="text-xs font-bold text-white mt-1 block truncate">
              {profile.emergencyContactName || 'Aarti Sharma'}
            </span>
            <span className="text-[10px] text-teal-400 font-mono block truncate">
              {profile.emergencyContactPhone || '+91 98112 23344'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Blood Group</label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Allergies (comma separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Emergency Medications</label>
              <input
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
            >
              Save Encrypted
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Toggle */}
      {!isEditing && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            + Edit Medical Details
          </button>
        </div>
      )}

      {/* Medico-Legal Injury Documentation (MLC) Section */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Medico-Legal Trauma & Injury Documentation ({injuries.length})
            </span>
          </div>

          <button
            onClick={() => setShowAddInjury(!showAddInjury)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Document New Injury</span>
          </button>
        </div>

        {/* Add Injury Form */}
        {showAddInjury && (
          <form onSubmit={handleAddInjury} className="p-4 rounded-2xl bg-slate-950 border border-purple-800/60 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Anatomical Site / Body Part</label>
                <input
                  type="text"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="e.g. Left Forearm, Neck, Wrist"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Injury Classification</label>
                <select
                  value={injuryType}
                  onChange={(e) => setInjuryType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Blunt Contusion / Abrasion">Blunt Contusion / Abrasion (खरोंच/चोट)</option>
                  <option value="Laceration / Incised Wound">Laceration / Incised Wound (गहरा घाव)</option>
                  <option value="Sprain / Fracture Suspect">Sprain / Fracture Suspect (मोच/हड्डी टूटना)</option>
                  <option value="Defensive Struggle Marks">Defensive Struggle Marks (संघर्ष के निशान)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Clinical Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Mild">Mild / Superficial</option>
                  <option value="Moderate">Moderate / Tissue Trauma</option>
                  <option value="Severe">Severe / Urgent Surgery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Attending Clinical Notes</label>
              <textarea
                rows={2}
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
                placeholder="Physical findings, swelling, pain description for court Medico-Legal record..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddInjury(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold"
              >
                Attach to MLC Case
              </button>
            </div>
          </form>
        )}

        {/* Injury Timeline List */}
        <div className="space-y-2">
          {injuries.map((inj, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">{inj.bodyPart}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    {inj.injuryType}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    inj.severity === 'Severe' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {inj.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {inj.notes}
                </p>
              </div>

              <div className="text-right flex-shrink-0 text-[10px] font-mono text-slate-500">
                {new Date(inj.date).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

