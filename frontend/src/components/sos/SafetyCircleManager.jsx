import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import {
  Users,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Bell,
  MessageSquare
} from 'lucide-react';

export default function SafetyCircleManager() {
  const { user, refreshUser } = useAuth();
  const [contacts, setContacts] = useState(user?.safetyCircle || [
    { name: 'Aarti Sharma (Sister)', phone: '+919811223344', relationship: 'Sister', notifyViaSms: true, notifyViaPush: true },
    { name: 'Sunil Verma (Colleague)', phone: '+919822334455', relationship: 'Colleague', notifyViaSms: true, notifyViaPush: true }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
    notifyViaSms: true,
    notifyViaPush: true
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Sync if user updates
  React.useEffect(() => {
    if (user?.safetyCircle) {
      setContacts(user.safetyCircle);
    }
  }, [user]);

  const handleSaveContacts = async (updatedList) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await authAPI.updateSafetyCircle(updatedList);
      if (res.data?.success) {
        setContacts(res.data.safetyCircle);
        if (refreshUser) refreshUser();
        setFeedback({ type: 'success', message: 'Safety Circle updated successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    const updated = [...contacts, { ...newContact }];
    handleSaveContacts(updated);
    setNewContact({
      name: '',
      phone: '',
      email: '',
      relationship: 'Family',
      notifyViaSms: true,
      notifyViaPush: true
    });
    setIsAdding(false);
  };

  const handleDelete = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    handleSaveContacts(updated);
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-purple-900/30">
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Safety Circle Contacts</h3>
            <p className="text-[11px] text-slate-400">Trusted emergency recipients notified instantly upon SOS trigger</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold transition"
        >
          <UserPlus className="w-3.5 h-3.5 text-teal-300" />
          <span>{isAdding ? 'Close' : 'Add Contact'}</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div className={`p-3 rounded-xl mb-3 text-xs flex items-center space-x-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add Contact Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-900/80 border border-purple-800/40 mb-4 space-y-3 animate-fade-in">
          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">New Trusted Guardian Contact</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="e.g. Aarti Sharma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Mobile Number (SMS Alert Target)</label>
              <input
                type="tel"
                required
                value={newContact.phone}
                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+91 98112 23344"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Relationship</label>
              <select
                value={newContact.relationship}
                onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Sister">Sister</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Lawyer">Lawyer</option>
              </select>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.notifyViaSms}
                  onChange={e => setNewContact({ ...newContact, notifyViaSms: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                />
                <span className="text-slate-300">SMS Alert</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.notifyViaPush}
                  onChange={e => setNewContact({ ...newContact, notifyViaPush: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                />
                <span className="text-slate-300">Push Alert</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-gradient-to-r from-purple-700 to-teal-600 hover:from-purple-600 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition"
          >
            {saving ? 'Saving...' : 'Add to Safety Circle'}
          </button>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-2">
        {contacts.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No contacts added yet. Click "Add Contact" to protect yourself.
          </div>
        ) : (
          contacts.map((contact, idx) => (
            <div
              key={contact._id || idx}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-purple-800/40 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">{contact.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/40 text-teal-300 border border-teal-700/40">
                      {contact.relationship}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>{contact.phone}</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                      <MessageSquare className="w-3 h-3" />
                      <span>SMS Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800 transition"
                  title="Call Contact"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                  title="Remove from Safety Circle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

