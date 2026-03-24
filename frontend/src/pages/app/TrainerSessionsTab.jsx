import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Calendar, Plus, Eye, Trash2, CheckCircle, XCircle, Clock, ArrowLeft, Users } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TrainerSessionsTab() {
  const { user, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ schedule_id: '', date: '', coach_id: '', coach_name: '', notes_de: '', notes_en: '', max_participants: 30, is_cancelled: false });
  const de = language === 'de';

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [sessRes, schedRes, trainRes] = await Promise.all([
        axios.get(`${API}/sessions/all`, { headers }),
        axios.get(`${API}/schedule`),
        axios.get(`${API}/trainers`)
      ]);
      setSessions(sessRes.data);
      setSchedule(schedRes.data);
      setTrainers(trainRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/sessions`, form, { headers: getAuthHeaders() });
      setCreating(false);
      setForm({ schedule_id: '', date: '', coach_id: '', coach_name: '', notes_de: '', notes_en: '', max_participants: 30, is_cancelled: false });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/sessions/${id}`, { headers: getAuthHeaders() });
    setSessions(prev => prev.filter(s => s.id !== id));
    setViewing(null);
  };

  // Session detail view
  if (viewing) {
    const attendees = viewing.attendees || [];
    const confirmed = attendees.filter(a => a.status === 'confirmed');
    const declined = attendees.filter(a => a.status === 'declined');
    const pending = attendees.filter(a => a.status === 'pending');

    return (
      <div data-testid="session-detail" className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h3 className="font-teko text-xl text-white flex-1">{viewing.date}</h3>
          <button onClick={() => handleDelete(viewing.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
        {viewing.coach_name && (
          <div className="bg-charcoal border border-white/5 rounded-xl p-4">
            <p className="font-rajdhani text-gray-400 text-sm">Coach: <span className="text-gold">{viewing.coach_name}</span></p>
          </div>
        )}
        {/* Attendance */}
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-teko text-base text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{de ? 'Zugesagt' : 'Confirmed'} ({confirmed.length})</h4>
            {confirmed.map(a => <p key={a.id} className="font-rajdhani text-white text-sm mt-1">{a.user_name}</p>)}
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <h4 className="font-teko text-base text-red-400 flex items-center gap-2"><XCircle className="w-4 h-4" />{de ? 'Abgesagt' : 'Declined'} ({declined.length})</h4>
            {declined.map(a => <p key={a.id} className="font-rajdhani text-white text-sm mt-1">{a.user_name}</p>)}
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <h4 className="font-teko text-base text-yellow-400 flex items-center gap-2"><Clock className="w-4 h-4" />{de ? 'Offen' : 'Pending'} ({pending.length})</h4>
            {pending.map(a => <p key={a.id} className="font-rajdhani text-white text-sm mt-1">{a.user_name}</p>)}
          </div>
        </div>
      </div>
    );
  }

  // Create session form
  if (creating) {
    return (
      <div data-testid="create-session-form" className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h3 className="font-teko text-lg text-white">{de ? 'Neues Training' : 'New Session'}</h3>
        </div>
        <div>
          <label className="font-rajdhani text-gray-400 text-xs block mb-1">{de ? 'Vorlage' : 'Template'} *</label>
          <select value={form.schedule_id} onChange={e => setForm(p => ({ ...p, schedule_id: e.target.value }))}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm focus:outline-none appearance-none">
            <option value="">{de ? 'Wählen...' : 'Select...'}</option>
            {schedule.map(s => <option key={s.id} value={s.id}>{s.day_de} {s.time_start}: {s.title_de}</option>)}
          </select>
        </div>
        <div>
          <label className="font-rajdhani text-gray-400 text-xs block mb-1">{de ? 'Datum' : 'Date'} *</label>
          <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm focus:outline-none" />
        </div>
        <div>
          <label className="font-rajdhani text-gray-400 text-xs block mb-1">Coach *</label>
          <select value={form.coach_id} onChange={e => {
            const coach = trainers.find(t => t.id === e.target.value);
            setForm(p => ({ ...p, coach_id: e.target.value, coach_name: coach?.name || '' }));
          }}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm focus:outline-none appearance-none">
            <option value="">{de ? 'Coach wählen...' : 'Select coach...'}</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <textarea value={form.notes_de} onChange={e => setForm(p => ({ ...p, notes_de: e.target.value }))} placeholder={de ? 'Notizen...' : 'Notes...'} rows={3}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none resize-none" />
        <button onClick={handleCreate} disabled={!form.schedule_id || !form.date || !form.coach_id}
          className="w-full bg-gold text-obsidian font-teko uppercase tracking-wider py-3 rounded-xl disabled:opacity-40">
          {de ? 'Training erstellen' : 'Create Session'}
        </button>
      </div>
    );
  }

  // Sessions list
  return (
    <div data-testid="app-sessions">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-teko text-xl text-white uppercase">{de ? 'Training-Sessions' : 'Training Sessions'}</h3>
        <button data-testid="new-session-btn" onClick={() => setCreating(true)} className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-obsidian" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500 font-rajdhani py-12">{de ? 'Keine Sessions' : 'No sessions'}</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <button key={s.id} onClick={() => setViewing(s)}
              className={`w-full bg-charcoal border rounded-xl p-4 text-left ${s.is_cancelled ? 'border-red-500/30 opacity-60' : 'border-white/5'} hover:border-gold/30 transition-colors`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-teko text-lg text-white">{s.date}</span>
                    {s.is_cancelled && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-rajdhani rounded">{de ? 'ABGESAGT' : 'CANCELLED'}</span>}
                  </div>
                  <p className="font-rajdhani text-gray-400 text-xs">Coach: {s.coach_name || '-'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-rajdhani text-green-400 text-xs">{s.confirmed_count || 0}</span>
                  <span className="text-gray-600">/</span>
                  <span className="font-rajdhani text-red-400 text-xs">{s.declined_count || 0}</span>
                  <span className="text-gray-600">/</span>
                  <span className="font-rajdhani text-yellow-400 text-xs">{s.pending_count || 0}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
