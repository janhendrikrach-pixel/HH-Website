import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function SettingsManager({ settings, onRefresh, getAuthHeader, language }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, form, { headers: getAuthHeader() });
      onRefresh();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-charcoal border border-white/5 p-6 space-y-6 max-w-2xl">
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Adresse' : 'Address'}</Label>
        <Input
          value={form.address || ''}
          onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Telefon' : 'Phone'}</Label>
        <Input
          value={form.phone || ''}
          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">Email</Label>
        <Input
          value={form.email || ''}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Öffnungszeiten (DE)' : 'Opening Hours (DE)'}</Label>
        <Input
          value={form.opening_hours_de || ''}
          onChange={(e) => setForm(prev => ({ ...prev, opening_hours_de: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <div>
        <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Öffnungszeiten (EN)' : 'Opening Hours (EN)'}</Label>
        <Input
          value={form.opening_hours_en || ''}
          onChange={(e) => setForm(prev => ({ ...prev, opening_hours_en: e.target.value }))}
          className="bg-obsidian border-white/10 text-white rounded-none"
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
      >
        {saving ? 'Saving...' : (language === 'de' ? 'Speichern' : 'Save')}
      </Button>
    </div>
  );
}
