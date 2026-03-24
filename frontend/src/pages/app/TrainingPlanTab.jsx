import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Dumbbell, Plus, Trash2, ArrowLeft, User, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TrainingPlanTab() {
  const { user, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ student_id: '', title: '', description: '', exercises: [] });
  const [exForm, setExForm] = useState({ name: '', sets: '', reps: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const de = language === 'de';
  const isTrainer = user?.role === 'trainer';

  const fetchPlans = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/training-plans`, { headers: getAuthHeaders() });
      setPlans(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const loadStudents = async () => {
    try {
      const res = await axios.get(`${API}/messages/users/list`, { headers: getAuthHeaders() });
      setStudents(res.data.filter(u => u.role === 'student'));
    } catch (err) { console.error(err); }
  };

  const addExercise = () => {
    if (!exForm.name.trim()) return;
    setForm(p => ({ ...p, exercises: [...p.exercises, { ...exForm }] }));
    setExForm({ name: '', sets: '', reps: '', notes: '' });
  };

  const removeExercise = (idx) => {
    setForm(p => ({ ...p, exercises: p.exercises.filter((_, i) => i !== idx) }));
  };

  const savePlan = async () => {
    if (!form.title.trim() || !form.student_id) return;
    setSaving(true);
    try {
      await axios.post(`${API}/training-plans`, form, { headers: getAuthHeaders() });
      setCreating(false);
      setForm({ student_id: '', title: '', description: '', exercises: [] });
      fetchPlans();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deletePlan = async (id) => {
    try {
      await axios.delete(`${API}/training-plans/${id}`, { headers: getAuthHeaders() });
      setPlans(prev => prev.filter(p => p.id !== id));
      setViewing(null);
    } catch (err) { console.error(err); }
  };

  // Detail view
  if (viewing) {
    return (
      <div data-testid="plan-detail" className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h3 className="font-teko text-xl text-white flex-1">{viewing.title}</h3>
          {isTrainer && <button onClick={() => deletePlan(viewing.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
        </div>
        <div className="bg-charcoal border border-white/5 rounded-xl p-4">
          <p className="font-rajdhani text-gray-400 text-sm">
            {isTrainer ? `${de ? 'Für' : 'For'}: ${viewing.student_name}` : `${de ? 'Von' : 'From'}: ${viewing.trainer_name}`}
          </p>
          {viewing.description && <p className="font-rajdhani text-gray-300 text-sm mt-2">{viewing.description}</p>}
        </div>
        <h4 className="font-teko text-lg text-gold uppercase">{de ? 'Übungen' : 'Exercises'}</h4>
        {(viewing.exercises || []).length === 0 ? (
          <p className="font-rajdhani text-gray-500 text-center py-8">{de ? 'Keine Übungen' : 'No exercises'}</p>
        ) : (
          <div className="space-y-2">
            {viewing.exercises.map((ex, i) => (
              <div key={i} className="bg-charcoal border border-white/5 rounded-xl p-4">
                <p className="font-teko text-lg text-white">{ex.name}</p>
                <div className="flex gap-4 mt-1">
                  {ex.sets && <span className="font-rajdhani text-gold text-sm">{ex.sets} {de ? 'Sätze' : 'Sets'}</span>}
                  {ex.reps && <span className="font-rajdhani text-gold text-sm">{ex.reps} {de ? 'Wdh.' : 'Reps'}</span>}
                </div>
                {ex.notes && <p className="font-rajdhani text-gray-500 text-xs mt-1">{ex.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Create view (Trainer only)
  if (creating) {
    return (
      <div data-testid="plan-create" className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h3 className="font-teko text-lg text-white">{de ? 'Neuer Trainingsplan' : 'New Training Plan'}</h3>
        </div>
        {/* Student select */}
        <div>
          <label className="font-rajdhani text-gray-400 text-sm block mb-1">{de ? 'Schüler' : 'Student'} *</label>
          <select value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm focus:outline-none focus:border-gold/50 appearance-none">
            <option value="">{de ? 'Schüler wählen...' : 'Select student...'}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={de ? 'Titel...' : 'Title...'}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-teko text-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50" />
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder={de ? 'Beschreibung (optional)...' : 'Description (optional)...'} rows={3}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/50 resize-none" />

        {/* Add exercises */}
        <h4 className="font-teko text-lg text-gold uppercase">{de ? 'Übungen' : 'Exercises'}</h4>
        {form.exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-2 bg-charcoal border border-white/5 rounded-xl p-3">
            <div className="flex-1">
              <p className="font-rajdhani text-white text-sm">{ex.name}</p>
              <p className="font-rajdhani text-gray-500 text-xs">{ex.sets} {de ? 'Sätze' : 'Sets'} x {ex.reps} {de ? 'Wdh.' : 'Reps'}</p>
            </div>
            <button onClick={() => removeExercise(i)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <div className="bg-charcoal/50 border border-dashed border-white/10 rounded-xl p-3 space-y-2">
          <input value={exForm.name} onChange={e => setExForm(p => ({ ...p, name: e.target.value }))} placeholder={de ? 'Übungsname' : 'Exercise name'}
            className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none" />
          <div className="grid grid-cols-3 gap-2">
            <input value={exForm.sets} onChange={e => setExForm(p => ({ ...p, sets: e.target.value }))} placeholder={de ? 'Sätze' : 'Sets'}
              className="bg-obsidian border border-white/10 rounded-lg px-3 py-2 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none" />
            <input value={exForm.reps} onChange={e => setExForm(p => ({ ...p, reps: e.target.value }))} placeholder={de ? 'Wdh.' : 'Reps'}
              className="bg-obsidian border border-white/10 rounded-lg px-3 py-2 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none" />
            <button onClick={addExercise} disabled={!exForm.name.trim()}
              className="bg-gold/20 text-gold font-rajdhani text-sm rounded-lg disabled:opacity-30">+ {de ? 'Hinzufügen' : 'Add'}</button>
          </div>
        </div>

        <button data-testid="save-plan-btn" onClick={savePlan} disabled={saving || !form.title.trim() || !form.student_id}
          className="w-full bg-gold text-obsidian font-teko uppercase tracking-wider py-3 rounded-xl disabled:opacity-40">
          {saving ? '...' : (de ? 'Plan erstellen' : 'Create Plan')}
        </button>
      </div>
    );
  }

  // Plans list
  return (
    <div data-testid="app-plans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-teko text-xl text-white uppercase">{de ? 'Trainingspläne' : 'Training Plans'}</h3>
        {isTrainer && (
          <button data-testid="new-plan-btn" onClick={() => { setCreating(true); loadStudents(); }}
            className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-obsidian" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="font-rajdhani text-gray-500">{de ? 'Keine Trainingspläne' : 'No training plans'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(p => (
            <button key={p.id} onClick={() => setViewing(p)}
              className="w-full flex items-center gap-3 bg-charcoal border border-white/5 rounded-xl p-4 hover:border-gold/30 transition-colors">
              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-teko text-lg text-white truncate">{p.title}</p>
                <p className="font-rajdhani text-gray-500 text-xs">
                  {isTrainer ? `${de ? 'Für' : 'For'}: ${p.student_name}` : `${de ? 'Von' : 'From'}: ${p.trainer_name}`}
                  {' - '}{(p.exercises || []).length} {de ? 'Übungen' : 'Exercises'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
