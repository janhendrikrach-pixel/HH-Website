import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Edit, Eye, Calendar, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AdminSessionsManager({ getAuthHeader, language }) {
  const [sessions, setSessions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [form, setForm] = useState({ schedule_id: '', date: '', coach_id: '', coach_name: '', notes_de: '', notes_en: '', max_participants: 30, is_cancelled: false });

  const fetchData = useCallback(async () => {
    try {
      const [sessRes, schedRes, trainRes] = await Promise.all([
        axios.get(`${API}/admin/sessions`, { headers: getAuthHeader() }),
        axios.get(`${API}/schedule`),
        axios.get(`${API}/trainers`)
      ]);
      setSessions(sessRes.data);
      setSchedule(schedRes.data);
      setTrainers(trainRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeader]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCoachSelect = (coachId) => {
    const coach = trainers.find(t => t.id === coachId);
    setForm(prev => ({ ...prev, coach_id: coachId, coach_name: coach ? coach.name : '' }));
  };

  const handleSave = async () => {
    try {
      if (editingSession) {
        await axios.put(`${API}/admin/sessions/${editingSession.id}`, form, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API}/admin/sessions`, form, { headers: getAuthHeader() });
      }
      resetForm();
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setForm({
      schedule_id: session.schedule_id || '', date: session.date, coach_id: session.coach_id || '',
      coach_name: session.coach_name || '', notes_de: session.notes_de || '', notes_en: session.notes_en || '',
      max_participants: session.max_participants || 30, is_cancelled: session.is_cancelled || false
    });
    setCreating(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'de' ? 'Training-Session wirklich löschen?' : 'Really delete training session?')) return;
    await axios.delete(`${API}/admin/sessions/${id}`, { headers: getAuthHeader() });
    fetchData();
  };

  const resetForm = () => {
    setForm({ schedule_id: '', date: '', coach_id: '', coach_name: '', notes_de: '', notes_en: '', max_participants: 30, is_cancelled: false });
    setCreating(false);
    setEditingSession(null);
  };

  const handleUpdateAttendance = async (sessionId, userId, status) => {
    await axios.put(`${API}/admin/attendance/${sessionId}/${userId}`, { status }, { headers: getAuthHeader() });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  // --- DETAIL VIEW ---
  const viewingSession = sessions.find(s => s.id === viewingId);
  if (viewingSession) {
    const attendees = viewingSession.attendees || [];
    const confirmed = attendees.filter(a => a.status === 'confirmed');
    const declined = attendees.filter(a => a.status === 'declined');
    const pending = attendees.filter(a => a.status === 'pending');

    return (
      <div className="space-y-6">
        <Button onClick={() => setViewingId(null)} variant="outline" className="border-white/20 text-white font-rajdhani hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" />{language === 'de' ? 'Zurück' : 'Back'}
        </Button>

        <div className="bg-charcoal border border-white/5 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-teko text-2xl text-gold">{viewingSession.date}</h3>
              {viewingSession.coach_name && <p className="font-rajdhani text-gray-400">Coach: <span className="text-white">{viewingSession.coach_name}</span></p>}
              {viewingSession.notes_de && <p className="font-rajdhani text-gray-500 text-sm mt-1">{viewingSession.notes_de}</p>}
            </div>
            <div className="flex gap-4 text-center">
              <div><p className="font-teko text-2xl text-green-400">{confirmed.length}</p><p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Zugesagt' : 'Confirmed'}</p></div>
              <div><p className="font-teko text-2xl text-red-400">{declined.length}</p><p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Abgesagt' : 'Declined'}</p></div>
              <div><p className="font-teko text-2xl text-yellow-400">{pending.length}</p><p className="font-rajdhani text-gray-500 text-xs">{language === 'de' ? 'Offen' : 'Pending'}</p></div>
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gold font-teko uppercase">Name</TableHead>
                <TableHead className="text-gold font-teko uppercase">E-Mail</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Telefon' : 'Phone'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Status ändern' : 'Change Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map(att => (
                <TableRow key={att.id} className="border-white/5">
                  <TableCell className="font-rajdhani text-white">{att.user_name}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{att.user_email || '-'}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{att.user_phone || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-rajdhani ${
                      att.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      att.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {att.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                      {att.status === 'declined' && <XCircle className="w-3 h-3" />}
                      {att.status === 'pending' && <Clock className="w-3 h-3" />}
                      {att.status === 'confirmed' ? (language === 'de' ? 'Zugesagt' : 'Confirmed') :
                       att.status === 'declined' ? (language === 'de' ? 'Abgesagt' : 'Declined') :
                       (language === 'de' ? 'Offen' : 'Pending')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateAttendance(viewingSession.id, att.user_id, 'confirmed')}
                        className={`p-1.5 rounded text-xs ${att.status === 'confirmed' ? 'bg-green-500/30 text-green-300' : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'}`}
                        title={language === 'de' ? 'Zusagen' : 'Confirm'}
                      ><CheckCircle className="w-4 h-4" /></button>
                      <button
                        onClick={() => handleUpdateAttendance(viewingSession.id, att.user_id, 'declined')}
                        className={`p-1.5 rounded text-xs ${att.status === 'declined' ? 'bg-red-500/30 text-red-300' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'}`}
                        title={language === 'de' ? 'Absagen' : 'Decline'}
                      ><XCircle className="w-4 h-4" /></button>
                      <button
                        onClick={() => handleUpdateAttendance(viewingSession.id, att.user_id, 'pending')}
                        className={`p-1.5 rounded text-xs ${att.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'}`}
                        title={language === 'de' ? 'Zurücksetzen' : 'Reset'}
                      ><Clock className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {attendees.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-8">{language === 'de' ? 'Keine Teilnehmer' : 'No participants'}</p>}
        </div>
      </div>
    );
  }

  // --- LIST + CREATE VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-teko text-2xl text-white uppercase">{language === 'de' ? 'Training-Sessions' : 'Training Sessions'}</h2>
        {!creating && (
          <Button onClick={() => setCreating(true)} data-testid="admin-create-session-btn" className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
            <Plus className="w-4 h-4 mr-2" />{language === 'de' ? 'Training anlegen' : 'Create Session'}
          </Button>
        )}
      </div>

      {creating && (
        <div className="bg-charcoal border border-white/5 p-6 space-y-4">
          <h3 className="font-teko text-xl text-gold">
            {editingSession ? (language === 'de' ? 'Training bearbeiten' : 'Edit Session') : (language === 'de' ? 'Neues Training' : 'New Training')}
          </h3>
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
            <Button onClick={handleSave} disabled={!form.schedule_id || !form.date || !form.coach_id} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">{language === 'de' ? 'Speichern' : 'Save'}</Button>
            <Button onClick={resetForm} variant="outline" className="border-white/20 text-white font-teko uppercase hover:bg-white/5">{language === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
          </div>
        </div>
      )}

      {!creating && (
        <div className="bg-charcoal border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Datum' : 'Date'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Coach</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Zugesagt' : 'Confirmed'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Abgesagt' : 'Declined'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Offen' : 'Pending'}</TableHead>
                <TableHead className="text-gold font-teko uppercase">Status</TableHead>
                <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map(session => (
                <TableRow key={session.id} className="border-white/5">
                  <TableCell className="font-rajdhani text-white font-medium">{session.date}</TableCell>
                  <TableCell className="font-rajdhani text-gray-400">{session.coach_name || '-'}</TableCell>
                  <TableCell><span className="font-rajdhani text-green-400">{session.confirmed_count || 0}</span></TableCell>
                  <TableCell><span className="font-rajdhani text-red-400">{session.declined_count || 0}</span></TableCell>
                  <TableCell><span className="font-rajdhani text-yellow-400">{session.pending_count || 0}</span></TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-rajdhani ${session.is_cancelled ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {session.is_cancelled ? (language === 'de' ? 'Abgesagt' : 'Cancelled') : (language === 'de' ? 'Aktiv' : 'Active')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingId(session.id)} className="p-1.5 text-gold hover:text-gold-glow" title={language === 'de' ? 'Details & Anwesenheit' : 'Details & Attendance'}><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(session)} className="p-1.5 text-gray-400 hover:text-white" title={language === 'de' ? 'Bearbeiten' : 'Edit'}><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(session.id)} className="p-1.5 text-gray-400 hover:text-red-400" title={language === 'de' ? 'Löschen' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sessions.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-8">{language === 'de' ? 'Keine Training-Sessions vorhanden' : 'No training sessions yet'}</p>}
        </div>
      )}
    </div>
  );
}
