import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const PaymentSettings = ({ getAuthHeaders }) => {
  const [form, setForm] = useState({
    bank_name: '', account_holder: '', iban: '', bic: '',
    reference_prefix: 'HEADLOCK-', additional_info_de: '', additional_info_en: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headers = getAuthHeaders();

  const fetch = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/payment-settings`, { headers });
      setForm(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/admin/payment-settings`, form, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const fields = [
    { key: 'account_holder', label: 'Kontoinhaber' },
    { key: 'bank_name', label: 'Bank' },
    { key: 'iban', label: 'IBAN' },
    { key: 'bic', label: 'BIC' },
    { key: 'reference_prefix', label: 'Verwendungszweck-Präfix' },
  ];

  return (
    <div data-testid="payment-settings">
      <h3 className="font-teko text-xl text-white mb-6">Zahlungseinstellungen</h3>
      <p className="font-rajdhani text-gray-400 text-sm mb-6">
        Diese Daten werden dem Kunden bei Überweisung angezeigt und per E-Mail gesendet.
      </p>
      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="font-rajdhani text-gray-400 text-sm block mb-1">{f.label}</label>
            <input value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none focus:border-gold/50" />
          </div>
        ))}
        <div>
          <label className="font-rajdhani text-gray-400 text-sm block mb-1">Zusatzinfo (DE)</label>
          <textarea value={form.additional_info_de || ''} onChange={e => setForm(p => ({ ...p, additional_info_de: e.target.value }))} rows={3}
            className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none resize-none"
            placeholder="z.B. Bitte überweise innerhalb von 7 Tagen..." />
        </div>
        <div>
          <label className="font-rajdhani text-gray-400 text-sm block mb-1">Zusatzinfo (EN)</label>
          <textarea value={form.additional_info_en || ''} onChange={e => setForm(p => ({ ...p, additional_info_en: e.target.value }))} rows={3}
            className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none resize-none" />
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-obsidian font-teko uppercase tracking-wider rounded-lg disabled:opacity-40 hover:bg-gold-glow transition-colors">
          <Save className="w-4 h-4" />{saved ? 'Gespeichert!' : saving ? '...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
};
