import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Edit2, Trash2, Eye, X, Upload, Ticket, ChevronDown } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const EventsManager = ({ getAuthHeaders }) => {
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [viewTickets, setViewTickets] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const emptyForm = { title_de: '', title_en: '', description_de: '', description_en: '', date: '', time: '', location: '', image_url: '', ticket_price: 0, ticket_quota: 0, is_published: false };
  const [form, setForm] = useState(emptyForm);

  const headers = getAuthHeaders();

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/events`, { headers });
      setEvents(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const save = async () => {
    try {
      if (editing === 'new') {
        await axios.post(`${API}/api/admin/events`, form, { headers });
      } else {
        await axios.put(`${API}/api/admin/events/${editing}`, form, { headers });
      }
      setEditing(null);
      setForm(emptyForm);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Event wirklich löschen? Alle Tickets werden ebenfalls gelöscht.')) return;
    await axios.delete(`${API}/api/admin/events/${id}`, { headers });
    fetchEvents();
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await axios.post(`${API}/api/admin/upload/events`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
    setForm(p => ({ ...p, image_url: res.data.url }));
  };

  const loadTickets = async (eventId) => {
    const res = await axios.get(`${API}/api/admin/events/${eventId}/tickets`, { headers });
    setTickets(res.data);
    setViewTickets(eventId);
  };

  const cancelTicket = async (ticketId) => {
    await axios.put(`${API}/api/admin/tickets/${ticketId}/cancel`, {}, { headers });
    loadTickets(viewTickets);
  };

  // Ticket view
  if (viewTickets) {
    const ev = events.find(e => e.id === viewTickets);
    return (
      <div data-testid="event-tickets-view">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setViewTickets(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          <h3 className="font-teko text-xl text-white">Tickets: {ev?.title_de}</h3>
        </div>
        <div className="mb-4 flex gap-4 text-sm font-rajdhani">
          <span className="text-gray-400">Gesamt: <span className="text-white font-bold">{tickets.length}</span></span>
          <span className="text-green-400">Aktiv: {tickets.filter(t => t.status !== 'cancelled').length}</span>
          <span className="text-blue-400">Eingecheckt: {tickets.filter(t => t.is_checked_in).length}</span>
          <span className="text-red-400">Storniert: {tickets.filter(t => t.status === 'cancelled').length}</span>
        </div>
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <p className="text-gray-500 font-rajdhani text-center py-8">Keine Tickets</p>
          ) : tickets.map(t => (
            <div key={t.id} className={`flex items-center justify-between p-3 bg-charcoal border rounded-lg ${t.status === 'cancelled' ? 'border-red-500/20 opacity-50' : t.is_checked_in ? 'border-green-500/20' : 'border-white/5'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-teko text-gold">{t.ticket_code}</span>
                  {t.is_checked_in && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-rajdhani">Eingecheckt</span>}
                  {t.status === 'cancelled' && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-rajdhani">Storniert</span>}
                </div>
                <p className="font-rajdhani text-sm text-white">{t.customer_name} - {t.customer_email}</p>
                <p className="font-rajdhani text-xs text-gray-500">{t.payment_method === 'transfer' ? 'Überweisung' : 'Abendkasse'} | {t.price?.toFixed(2)} EUR</p>
              </div>
              {t.status !== 'cancelled' && (
                <button onClick={() => cancelTicket(t.id)} className="text-red-400 hover:text-red-300 text-xs font-rajdhani">Stornieren</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Edit form
  if (editing) {
    return (
      <div data-testid="event-form">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          <h3 className="font-teko text-xl text-white">{editing === 'new' ? 'Neue Veranstaltung' : 'Veranstaltung bearbeiten'}</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'title_de', label: 'Titel (DE)', type: 'text' },
            { key: 'title_en', label: 'Titel (EN)', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none focus:border-gold/50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">Datum</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">Uhrzeit</label>
              <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="19:00 Uhr"
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="font-rajdhani text-gray-400 text-sm block mb-1">Ort</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none" />
          </div>
          {['description_de', 'description_en'].map(key => (
            <div key={key}>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">Beschreibung ({key.endsWith('de') ? 'DE' : 'EN'})</label>
              <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={4}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none resize-none" />
            </div>
          ))}
          <div>
            <label className="font-rajdhani text-gray-400 text-sm block mb-1">Bild</label>
            {form.image_url && <img src={form.image_url.startsWith('http') ? form.image_url : `${API}${form.image_url}`} alt="" className="h-32 rounded-lg object-cover mb-2" />}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-obsidian border border-white/10 rounded-lg cursor-pointer hover:border-gold/30 transition-colors">
              <Upload className="w-4 h-4 text-gold" /><span className="font-rajdhani text-sm text-gray-400">Bild hochladen</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">Ticketpreis (EUR)</label>
              <input type="number" step="0.01" value={form.ticket_price} onChange={e => setForm(p => ({ ...p, ticket_price: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="font-rajdhani text-gray-400 text-sm block mb-1">Kontingent (0 = unbegrenzt)</label>
              <input type="number" value={form.ticket_quota} onChange={e => setForm(p => ({ ...p, ticket_quota: parseInt(e.target.value) || 0 }))}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 accent-gold" />
            <span className="font-rajdhani text-white text-sm">Veröffentlicht</span>
          </label>
          <button onClick={save}
            className="w-full py-3 bg-gold text-obsidian font-teko uppercase tracking-wider rounded-lg hover:bg-gold-glow transition-colors">
            Speichern
          </button>
        </div>
      </div>
    );
  }

  // Events list
  return (
    <div data-testid="events-manager">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-teko text-xl text-white">Veranstaltungen</h3>
        <button data-testid="new-event-btn" onClick={() => { setEditing('new'); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian font-rajdhani text-sm rounded-lg">
          <Plus className="w-4 h-4" />Neue Veranstaltung
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 font-rajdhani text-center py-8">Noch keine Veranstaltungen</p>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="flex items-center justify-between p-4 bg-charcoal border border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                {e.image_url && <img src={e.image_url.startsWith('http') ? e.image_url : `${API}${e.image_url}`} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                <div>
                  <p className="font-teko text-lg text-white">{e.title_de}</p>
                  <div className="flex items-center gap-3 font-rajdhani text-xs text-gray-500">
                    <span>{e.date}</span>
                    <span>{e.tickets_sold || 0} Tickets</span>
                    <span className={e.is_published ? 'text-green-400' : 'text-yellow-400'}>{e.is_published ? 'Veröffentlicht' : 'Entwurf'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadTickets(e.id)} className="p-2 text-gray-400 hover:text-gold"><Ticket className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(e.id); setForm(e); }} className="p-2 text-gray-400 hover:text-gold"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteEvent(e.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
