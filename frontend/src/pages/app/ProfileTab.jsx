import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { User, Save, Camera } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfileTab() {
  const { user, getAuthHeaders, updateProfile, logout } = useAuth();
  const { language } = useLanguage();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '',
    experience_level: user?.experience_level || '', emergency_contact: user?.emergency_contact || '',
    weight_class: user?.weight_class || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const de = language === 'de';

  const handleSave = async () => {
    setSaving(true);
    try { await updateProfile(form); } finally { setSaving(false); }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/upload/profile`, fd, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
      updateProfile({ image_url: res.data.url });
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  return (
    <div data-testid="app-profile" className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center pt-4">
        <div className="relative">
          <div className="w-24 h-24 bg-charcoal border-2 border-gold/30 rounded-full overflow-hidden">
            {user?.image_url ? (
              <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-gold/50" /></div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center cursor-pointer hover:bg-gold-glow transition-colors">
            {uploading ? <span className="text-obsidian text-xs font-bold">...</span> : <Camera className="w-4 h-4 text-obsidian" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        </div>
        <p className="font-teko text-xl text-white mt-3">{user?.name}</p>
        <p className="font-rajdhani text-gold text-sm capitalize">{user?.role}</p>
        <p className="font-rajdhani text-gray-500 text-xs">{user?.email}</p>
      </div>

      {/* Form */}
      <div className="space-y-3">
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'phone', label: de ? 'Telefon' : 'Phone', type: 'tel' },
          { key: 'experience_level', label: de ? 'Erfahrungslevel' : 'Experience Level', type: 'text' },
          { key: 'weight_class', label: de ? 'Gewichtsklasse' : 'Weight Class', type: 'text' },
          { key: 'emergency_contact', label: de ? 'Notfallkontakt' : 'Emergency Contact', type: 'text' },
        ].map(f => (
          <div key={f.key}>
            <label className="font-rajdhani text-gray-400 text-xs block mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none focus:border-gold/50" />
          </div>
        ))}
        <div>
          <label className="font-rajdhani text-gray-400 text-xs block mb-1">{de ? 'Über mich' : 'About me'}</label>
          <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 font-rajdhani text-white text-sm focus:outline-none focus:border-gold/50 resize-none" />
        </div>
      </div>

      <button data-testid="save-profile-btn" onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-gold text-obsidian font-teko uppercase tracking-wider py-3 rounded-xl disabled:opacity-40">
        <Save className="w-4 h-4" />{saving ? '...' : (de ? 'Speichern' : 'Save')}
      </button>

      <button data-testid="logout-btn" onClick={logout}
        className="w-full text-center font-rajdhani text-red-400 text-sm py-3 hover:text-red-300">
        Logout
      </button>
    </div>
  );
}
