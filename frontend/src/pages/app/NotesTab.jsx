import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { StickyNote, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NotesTab() {
  const { getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const de = language === 'de';

  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notes`, { headers: getAuthHeaders() });
      setNotes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const saveNote = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        await axios.post(`${API}/notes`, form, { headers: getAuthHeaders() });
      } else {
        await axios.put(`${API}/notes/${editing}`, form, { headers: getAuthHeaders() });
      }
      setEditing(null);
      fetchNotes();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API}/notes/${id}`, { headers: getAuthHeaders() });
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  // Editing view
  if (editing) {
    return (
      <div data-testid="note-editor" className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-teko text-lg text-white">{editing === 'new' ? (de ? 'Neue Notiz' : 'New Note') : (de ? 'Notiz bearbeiten' : 'Edit Note')}</h3>
        </div>
        <input
          data-testid="note-title-input"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder={de ? 'Titel...' : 'Title...'}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-teko text-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50"
        />
        <textarea
          data-testid="note-content-input"
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          placeholder={de ? 'Notiz schreiben...' : 'Write your note...'}
          rows={12}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/50 resize-none"
        />
        <button data-testid="save-note-btn" onClick={saveNote} disabled={saving || !form.title.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gold text-obsidian font-teko uppercase tracking-wider py-3 rounded-xl disabled:opacity-40">
          <Save className="w-4 h-4" />{saving ? '...' : (de ? 'Speichern' : 'Save')}
        </button>
      </div>
    );
  }

  // Notes list
  return (
    <div data-testid="app-notes">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-teko text-xl text-white uppercase">{de ? 'Notizen' : 'Notes'}</h3>
        <button data-testid="new-note-btn" onClick={() => { setEditing('new'); setForm({ title: '', content: '' }); }}
          className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-obsidian" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="font-rajdhani text-gray-500">{de ? 'Noch keine Notizen' : 'No notes yet'}</p>
          <button onClick={() => { setEditing('new'); setForm({ title: '', content: '' }); }}
            className="mt-3 font-rajdhani text-gold text-sm hover:text-gold-glow">{de ? 'Erste Notiz erstellen' : 'Create first note'}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.id} className="bg-charcoal border border-white/5 rounded-xl p-4"
              onClick={() => { setEditing(n.id); setForm({ title: n.title, content: n.content }); }}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 cursor-pointer">
                  <p className="font-teko text-lg text-white truncate">{n.title}</p>
                  <p className="font-rajdhani text-gray-500 text-xs mt-0.5">{new Date(n.updated_at).toLocaleDateString('de-DE')}</p>
                  {n.content && <p className="font-rajdhani text-gray-400 text-sm mt-2 line-clamp-2">{n.content}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="p-2 text-gray-600 hover:text-red-400 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
