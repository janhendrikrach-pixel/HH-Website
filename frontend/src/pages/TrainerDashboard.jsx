import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { CheckCircle, XCircle, Clock, Plus, Calendar, Users, LogOut, Menu, X, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SessionsTab({ language, getAuthHeaders, user }) {
  const [sessions, setSessions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [form, setForm] = useState({ schedule_id: '', date: '', coach_id: '', coach_name: '', notes_de: '', notes_en: '', max_participants: 30, is_cancelled: false });

  const fetchData = useCallback(async () => {
    try {
      const [sessRes, schedRes, trainRes] = await Promise.all([
        axios.get(`${API}/sessions/all`, { headers: getAuthHeaders() }),
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
    if (!window.confirm(language === 'de' ? 'Training löschen?' : 'Delete session?')) return;
    await axios.delete(`${API}/sessions/${id}`, { headers: getAuthHeaders() });
    fetchData();
  };

  const handleCoachSelect = (coachId) => {
    const coach = trainers.find(t => t.id === coachId);
    setForm(prev => ({ ...prev, coach_id: coachId, coach_name: coach ? coach.name : '' }));
  };

  const viewingSession = sessions.find(s => s.id === viewingId);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  if (viewingSession) {
    const attendees = viewingSession.attendees || [];
    const confirmed = attendees.filter(a => a.status === 'confirmed');
    const declined = attendees.filter(a => a.status === 'declined');
    const pending = attendees.filter(a => a.status === 'pending');

    return (
      <div className="space-y-6">
        <Button onClick={() => setViewingId(null)} variant="outline" className="border-white/20 text-white font-rajdhani hover:bg-white/5">
          {language === 'de' ? 'Zurück' : 'Back'}
        </Button>

        <div className="bg-charcoal border border-white/5 p-6">
          <h3 className="font-teko text-2xl text-gold mb-2">{viewingSession.date}</h3>
          {viewingSession.coach_name && <p className="font-rajdhani text-gray-400">Coach: {viewingSession.coach_name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 p-4">
            <h4 className="font-teko text-lg text-green-400 flex items-center gap-2"><CheckCircle className="w-5 h-5" />{language === 'de' ? 'Zugesagt' : 'Confirmed'} ({confirmed.length})</h4>
            <ul className="mt-3 space-y-1">{confirmed.map(a => <li key={a.id} className="font-rajdhani text-white text-sm">{a.user_name}</li>)}</ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4">
            <h4 className="font-teko text-lg text-red-400 flex items-center gap-2"><XCircle className="w-5 h-5" />{language === 'de' ? 'Abgesagt' : 'Declined'} ({declined.length})</h4>
            <ul className="mt-3 space-y-1">{declined.map(a => <li key={a.id} className="font-rajdhani text-white text-sm">{a.user_name}</li>)}</ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4">
            <h4 className="font-teko text-lg text-yellow-400 flex items-center gap-2"><Clock className="w-5 h-5" />{language === 'de' ? 'Keine Antwort' : 'Pending'} ({pending.length})</h4>
            <ul className="mt-3 space-y-1">{pending.map(a => <li key={a.id} className="font-rajdhani text-white text-sm">{a.user_name}</li>)}</ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">{language === 'de' ? 'Training-Sessions' : 'Training Sessions'}</h2>
        {!creating && (
          <Button onClick={() => setCreating(true)} data-testid="create-session-btn" className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
            <Plus className="w-4 h-4 mr-2" />{language === 'de' ? 'Training anlegen' : 'Create Session'}
          </Button>
        )}
      </div>

      {creating && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">{language === 'de' ? 'Neues Training' : 'New Training Session'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Trainingsvorlage' : 'Schedule Template'} *</Label>
              <Select value={form.schedule_id} onValueChange={(v) => setForm(p => ({...p, schedule_id: v}))}>
                <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none"><SelectValue placeholder={language === 'de' ? 'Vorlage wählen...' : 'Select template...'} /></SelectTrigger>
                <SelectContent className="bg-charcoal border-white/10">
                  {schedule.map(s => <SelectItem key={s.id} value={s.id} className="text-white">{s.day_de} {s.time_start}-{s.time_end}: {s.title_de}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Datum' : 'Date'} *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm(p => ({...p, date: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
            </div>
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">Coach *</Label>
            <Select value={form.coach_id} onValueChange={handleCoachSelect}>
              <SelectTrigger className="bg-obsidian border-white/10 text-white rounded-none"><SelectValue placeholder="Coach wählen..." /></SelectTrigger>
              <SelectContent className="bg-charcoal border-white/10">
                {trainers.map(t => <SelectItem key={t.id} value={t.id} className="text-white">{t.name} - {t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Notizen (DE)' : 'Notes (DE)'}</Label>
              <Textarea value={form.notes_de} onChange={(e) => setForm(p => ({...p, notes_de: e.target.value}))} rows={2} className="bg-obsidian border-white/10 text-white rounded-none resize-none" />
            </div>
            <div>
              <Label className="font-rajdhani text-gray-400 mb-2 block">Notes (EN)</Label>
              <Textarea value={form.notes_en} onChange={(e) => setForm(p => ({...p, notes_en: e.target.value}))} rows={2} className="bg-obsidian border-white/10 text-white rounded-none resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_cancelled} onCheckedChange={(c) => setForm(p => ({...p, is_cancelled: c}))} />
            <Label className="font-rajdhani text-gray-400">{language === 'de' ? 'Abgesagt' : 'Cancelled'}</Label>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleCreate} disabled={!form.schedule_id || !form.date || !form.coach_id} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">{language === 'de' ? 'Speichern' : 'Save'}</Button>
            <Button onClick={() => setCreating(false)} variant="outline" className="border-white/20 text-white font-teko uppercase hover:bg-white/5">{language === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className={`bg-charcoal border p-4 flex justify-between items-center ${session.is_cancelled ? 'border-red-500/30 opacity-60' : 'border-white/5'}`}>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-teko text-xl text-white">{session.date}</span>
                {session.is_cancelled && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-rajdhani">{language === 'de' ? 'ABGESAGT' : 'CANCELLED'}</span>}
              </div>
              <p className="font-rajdhani text-gray-400 text-sm">Coach: {session.coach_name || '-'}</p>
              <div className="flex gap-4 mt-1">
                <span className="font-rajdhani text-green-400 text-xs">{session.confirmed_count || 0} {language === 'de' ? 'zugesagt' : 'confirmed'}</span>
                <span className="font-rajdhani text-red-400 text-xs">{session.declined_count || 0} {language === 'de' ? 'abgesagt' : 'declined'}</span>
                <span className="font-rajdhani text-yellow-400 text-xs">{session.pending_count || 0} {language === 'de' ? 'offen' : 'pending'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewingId(session.id)} className="p-2 text-gold hover:text-gold-glow" title={language === 'de' ? 'Details' : 'Details'}><Eye className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(session.id)} className="p-2 text-gray-400 hover:text-red-400" title={language === 'de' ? 'Löschen' : 'Delete'}><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-12">{language === 'de' ? 'Keine Training-Sessions vorhanden' : 'No training sessions'}</p>}
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  const { user, loading, logout, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'trainer') return <Navigate to="/student" />;

  const tabs = [
    { id: 'sessions', icon: Calendar, label: language === 'de' ? 'Training-Sessions' : 'Training Sessions' },
    { id: 'members', icon: Users, label: language === 'de' ? 'Mitglieder' : 'Members' },
  ];

  return (
    <div data-testid="trainer-dashboard" className="min-h-screen bg-obsidian flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-200.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-teko text-lg text-white uppercase">Trainer</span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm transition-colors ${activeTab === tab.id ? 'bg-gold/10 text-gold border-l-2 border-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon className="w-5 h-5" />{tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" />Logout</button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="h-16 bg-charcoal border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white">{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          <h1 className="font-teko text-2xl text-white uppercase">{tabs.find(t => t.id === activeTab)?.label}</h1>
          <span className="font-rajdhani text-gray-400 text-sm hidden sm:block">{user.name}</span>
        </header>
        <main className="p-6">
          {activeTab === 'sessions' && <SessionsTab language={language} getAuthHeaders={getAuthHeaders} user={user} />}
          {activeTab === 'members' && <MembersTab language={language} getAuthHeaders={getAuthHeaders} />}
        </main>
      </div>
    </div>
  );
}

function MembersTab({ language, getAuthHeaders }) {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    axios.get(`${API}/sessions/all`, { headers: getAuthHeaders() }).then(() => {}).catch(() => {});
    // Trainers can see student info from attendance
    axios.get(`${API}/sessions/all`, { headers: getAuthHeaders() })
      .then(res => {
        const allStudents = new Map();
        res.data.forEach(s => (s.attendees || []).forEach(a => {
          if (!allStudents.has(a.user_id)) allStudents.set(a.user_id, { name: a.user_name, sessions: 0, confirmed: 0 });
          const st = allStudents.get(a.user_id);
          st.sessions++;
          if (a.status === 'confirmed') st.confirmed++;
        }));
        setStudents([...allStudents.values()]);
      }).catch(console.error);
  }, [getAuthHeaders]);

  return (
    <div className="space-y-4">
      {students.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-12">{language === 'de' ? 'Noch keine Teilnehmer' : 'No participants yet'}</p>}
      {students.map((s, i) => (
        <div key={i} className="bg-charcoal border border-white/5 p-4 flex justify-between items-center">
          <span className="font-rajdhani text-white">{s.name}</span>
          <div className="flex gap-4">
            <span className="font-rajdhani text-green-400 text-sm">{s.confirmed}/{s.sessions} {language === 'de' ? 'Teilnahmen' : 'attended'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
