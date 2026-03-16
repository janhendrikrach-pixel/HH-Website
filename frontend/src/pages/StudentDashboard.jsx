import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { CheckCircle, XCircle, Clock, Bell, User, Calendar, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ProfileTab({ user, language, getAuthHeaders, onUpdate }) {
  const [form, setForm] = useState({
    name: user.name || '', phone: user.phone || '', bio: user.bio || '',
    experience_level: user.experience_level || '', emergency_contact: user.emergency_contact || '',
    weight_class: user.weight_class || ''
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onUpdate(form); } finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/upload/profile`, fd, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
      onUpdate({ image_url: res.data.url });
    } catch (err) { console.error(err); }
    finally { setImageUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-charcoal border-2 border-gold/30 rounded-full overflow-hidden">
            {user.image_url ? (
              <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-gold/50" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center cursor-pointer hover:bg-gold-glow transition-colors">
            <span className="text-black text-sm font-bold">{imageUploading ? '...' : '+'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <div>
          <h2 className="font-teko text-2xl text-white">{user.name}</h2>
          <p className="font-rajdhani text-gold text-sm">{user.email}</p>
        </div>
      </div>

      <div className="bg-charcoal border border-white/5 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">Name</Label>
            <Input value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Telefon' : 'Phone'}</Label>
            <Input value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Erfahrungslevel' : 'Experience Level'}</Label>
            <Input value={form.experience_level} onChange={(e) => setForm(p => ({...p, experience_level: e.target.value}))} placeholder={language === 'de' ? 'z.B. Anfänger' : 'e.g. Beginner'} className="bg-obsidian border-white/10 text-white rounded-none" />
          </div>
          <div>
            <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Gewichtsklasse' : 'Weight Class'}</Label>
            <Input value={form.weight_class} onChange={(e) => setForm(p => ({...p, weight_class: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
          </div>
        </div>
        <div>
          <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Notfallkontakt' : 'Emergency Contact'}</Label>
          <Input value={form.emergency_contact} onChange={(e) => setForm(p => ({...p, emergency_contact: e.target.value}))} className="bg-obsidian border-white/10 text-white rounded-none" />
        </div>
        <div>
          <Label className="font-rajdhani text-gray-400 mb-2 block">{language === 'de' ? 'Über mich' : 'About me'}</Label>
          <Textarea value={form.bio} onChange={(e) => setForm(p => ({...p, bio: e.target.value}))} rows={3} className="bg-obsidian border-white/10 text-white rounded-none resize-none" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-glow text-black font-teko uppercase">
          {saving ? '...' : (language === 'de' ? 'Speichern' : 'Save')}
        </Button>
      </div>
    </div>
  );
}

function TrainingsTab({ language, getAuthHeaders }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/sessions`, { headers: getAuthHeaders() })
      .then(res => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  const handleRSVP = async (sessionId, status) => {
    try {
      await axios.put(`${API}/attendance/${sessionId}`, { status }, { headers: getAuthHeaders() });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, my_status: status } : s));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {sessions.length === 0 && (
        <p className="text-center text-gray-500 font-rajdhani py-12">{language === 'de' ? 'Keine kommenden Trainings geplant' : 'No upcoming training sessions'}</p>
      )}
      {sessions.map(session => (
        <div key={session.id} className={`bg-charcoal border p-6 ${session.is_cancelled ? 'border-red-500/30 opacity-60' : 'border-white/5'}`}>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span className="font-teko text-xl text-white">{session.date}</span>
                {session.is_cancelled && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-rajdhani">{language === 'de' ? 'ABGESAGT' : 'CANCELLED'}</span>}
              </div>
              {session.coach_name && (
                <p className="font-rajdhani text-gray-400 text-sm">Coach: <span className="text-gold">{session.coach_name}</span></p>
              )}
              {session.notes_de && <p className="font-rajdhani text-gray-500 text-sm mt-1">{language === 'de' ? session.notes_de : session.notes_en}</p>}
            </div>
            {!session.is_cancelled && (
              <div className="flex items-center gap-2 shrink-0">
                {session.my_status === 'confirmed' ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 font-rajdhani text-sm"><CheckCircle className="w-4 h-4" />{language === 'de' ? 'Zugesagt' : 'Confirmed'}</span>
                    <Button size="sm" variant="outline" onClick={() => handleRSVP(session.id, 'declined')} className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-rajdhani text-xs">{language === 'de' ? 'Absagen' : 'Decline'}</Button>
                  </div>
                ) : session.my_status === 'declined' ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 font-rajdhani text-sm"><XCircle className="w-4 h-4" />{language === 'de' ? 'Abgesagt' : 'Declined'}</span>
                    <Button size="sm" variant="outline" onClick={() => handleRSVP(session.id, 'confirmed')} className="border-green-500/30 text-green-400 hover:bg-green-500/10 font-rajdhani text-xs">{language === 'de' ? 'Zusagen' : 'Confirm'}</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleRSVP(session.id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white font-rajdhani"><CheckCircle className="w-4 h-4 mr-1" />{language === 'de' ? 'Zusagen' : 'Confirm'}</Button>
                    <Button size="sm" onClick={() => handleRSVP(session.id, 'declined')} className="bg-red-600 hover:bg-red-500 text-white font-rajdhani"><XCircle className="w-4 h-4 mr-1" />{language === 'de' ? 'Absagen' : 'Decline'}</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsTab({ language, getAuthHeaders }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    axios.get(`${API}/notifications`, { headers: getAuthHeaders() })
      .then(res => setNotifs(res.data))
      .catch(console.error);
  }, [getAuthHeaders]);

  const markRead = async (id) => {
    await axios.put(`${API}/notifications/${id}/read`, {}, { headers: getAuthHeaders() });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await axios.put(`${API}/notifications/read-all`, {}, { headers: getAuthHeaders() });
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4">
      {unread > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={markAllRead} className="border-white/20 text-gray-400 font-rajdhani text-xs hover:bg-white/5">
            {language === 'de' ? 'Alle als gelesen markieren' : 'Mark all read'}
          </Button>
        </div>
      )}
      {notifs.length === 0 && <p className="text-center text-gray-500 font-rajdhani py-12">{language === 'de' ? 'Keine Benachrichtigungen' : 'No notifications'}</p>}
      {notifs.map(n => (
        <div key={n.id} className={`bg-charcoal border p-4 cursor-pointer transition-colors ${n.is_read ? 'border-white/5' : 'border-gold/30 bg-gold/5'}`} onClick={() => !n.is_read && markRead(n.id)}>
          <div className="flex items-start gap-3">
            <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${n.is_read ? 'text-gray-600' : 'text-gold'}`} />
            <div>
              <p className="font-rajdhani text-white text-sm">{language === 'de' ? n.message_de : n.message_en}</p>
              <p className="font-rajdhani text-gray-600 text-xs mt-1">{new Date(n.created_at).toLocaleString('de-DE')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { user, loading, logout, updateProfile, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('trainings');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'student') return <Navigate to="/trainer" />;

  const tabs = [
    { id: 'trainings', icon: Calendar, label: language === 'de' ? 'Trainings' : 'Training Sessions' },
    { id: 'profile', icon: User, label: language === 'de' ? 'Profil' : 'Profile' },
    { id: 'notifications', icon: Bell, label: language === 'de' ? 'Nachrichten' : 'Notifications' },
  ];

  return (
    <div data-testid="student-dashboard" className="min-h-screen bg-obsidian flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-200.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-teko text-lg text-white uppercase">{language === 'de' ? 'Schüler' : 'Student'}</span>
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
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="h-16 bg-charcoal border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white">{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          <h1 className="font-teko text-2xl text-white uppercase">{tabs.find(t => t.id === activeTab)?.label}</h1>
          <span className="font-rajdhani text-gray-400 text-sm hidden sm:block">{user.name}</span>
        </header>
        <main className="p-6">
          {activeTab === 'trainings' && <TrainingsTab language={language} getAuthHeaders={getAuthHeaders} />}
          {activeTab === 'profile' && <ProfileTab user={user} language={language} getAuthHeaders={getAuthHeaders} onUpdate={updateProfile} />}
          {activeTab === 'notifications' && <NotificationsTab language={language} getAuthHeaders={getAuthHeaders} />}
        </main>
      </div>
    </div>
  );
}
