import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { PagesManager, SectionsManager } from '../components/CMSManager';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminBookings } from '../components/admin/AdminBookings';
import { AdminContacts } from '../components/admin/AdminContacts';
import { TrainersManager } from '../components/admin/TrainersManager';
import { GalleryManager } from '../components/admin/GalleryManager';
import { ScheduleManager } from '../components/admin/ScheduleManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { InstagramManager } from '../components/admin/InstagramManager';
import {
  Users, Calendar, Image, Mail, Settings, LogOut, Clock,
  LayoutDashboard, Menu, X, Instagram, FileText, Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [trainers, setTrainers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [instagram, setInstagram] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    return { Authorization: `Basic ${auth}` };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await axios.get(`${API}/admin/verify`, { headers: getAuthHeader() });
      setIsAuthenticated(true);
      fetchAllData();
    } catch {
      setAuthError(language === 'de' ? 'Ungültige Anmeldedaten' : 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const [trainersRes, scheduleRes, galleryRes, bookingsRes, contactsRes, instagramRes, settingsRes] = await Promise.all([
        axios.get(`${API}/admin/trainers`, { headers }),
        axios.get(`${API}/admin/schedule`, { headers }),
        axios.get(`${API}/admin/gallery`, { headers }),
        axios.get(`${API}/admin/bookings`, { headers }),
        axios.get(`${API}/admin/contacts`, { headers }),
        axios.get(`${API}/admin/instagram`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/settings`)
      ]);
      setTrainers(trainersRes.data);
      setSchedule(scheduleRes.data);
      setGallery(galleryRes.data);
      setBookings(bookingsRes.data);
      setContacts(contactsRes.data);
      setInstagram(instagramRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/admin/seed`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(language === 'de' ? 'Wirklich löschen?' : 'Really delete?')) return;
    try {
      await axios.delete(`${API}/admin/${type}/${id}`, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/bookings/${id}/status?status=${status}`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleMarkContactRead = async (id) => {
    try {
      await axios.put(`${API}/admin/contacts/${id}/read`, {}, { headers: getAuthHeader() });
      fetchAllData();
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        language={language}
        credentials={credentials}
        setCredentials={setCredentials}
        onLogin={handleLogin}
        authError={authError}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'homepage', icon: Layout, label: 'Homepage' },
    { id: 'pages', icon: FileText, label: language === 'de' ? 'Seiten' : 'Pages' },
    { id: 'trainers', icon: Users, label: language === 'de' ? 'Trainer' : 'Trainers' },
    { id: 'schedule', icon: Calendar, label: language === 'de' ? 'Trainingszeiten' : 'Schedule' },
    { id: 'gallery', icon: Image, label: language === 'de' ? 'Galerie' : 'Gallery' },
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'bookings', icon: Clock, label: language === 'de' ? 'Buchungen' : 'Bookings' },
    { id: 'contacts', icon: Mail, label: language === 'de' ? 'Nachrichten' : 'Messages' },
    { id: 'settings', icon: Settings, label: language === 'de' ? 'Einstellungen' : 'Settings' },
  ];

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-obsidian flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-white/5 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded flex items-center justify-center">
              <span className="font-teko text-xl text-black font-bold">HH</span>
            </div>
            <span className="font-teko text-xl text-white uppercase">Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              data-testid={`admin-nav-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm transition-colors duration-300 ${
                activeTab === item.id
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-3 font-rajdhani text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        <header className="h-16 bg-charcoal border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="font-teko text-2xl text-white uppercase">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-rajdhani text-gray-400 text-sm hidden sm:block">{credentials.username}</span>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard trainers={trainers} bookings={bookings} contacts={contacts} gallery={gallery} language={language} onSeedData={seedData} />
              )}
              {activeTab === 'homepage' && (
                <SectionsManager getAuthHeader={getAuthHeader} language={language} pageId="home" />
              )}
              {activeTab === 'pages' && (
                <PagesManager getAuthHeader={getAuthHeader} language={language} />
              )}
              {activeTab === 'trainers' && (
                <TrainersManager trainers={trainers} onDelete={(id) => handleDelete('trainers', id)} onRefresh={fetchAllData} getAuthHeader={getAuthHeader} language={language} />
              )}
              {activeTab === 'schedule' && (
                <ScheduleManager schedule={schedule} onDelete={(id) => handleDelete('schedule', id)} language={language} />
              )}
              {activeTab === 'gallery' && (
                <GalleryManager gallery={gallery} onDelete={(id) => handleDelete('gallery', id)} onRefresh={fetchAllData} getAuthHeader={getAuthHeader} language={language} />
              )}
              {activeTab === 'instagram' && (
                <InstagramManager posts={instagram} onDelete={(id) => handleDelete('instagram', id)} onRefresh={fetchAllData} getAuthHeader={getAuthHeader} language={language} />
              )}
              {activeTab === 'bookings' && (
                <AdminBookings bookings={bookings} onUpdateStatus={handleUpdateBookingStatus} onDelete={(id) => handleDelete('bookings', id)} language={language} />
              )}
              {activeTab === 'contacts' && (
                <AdminContacts contacts={contacts} onMarkRead={handleMarkContactRead} onDelete={(id) => handleDelete('contacts', id)} language={language} />
              )}
              {activeTab === 'settings' && (
                <SettingsManager settings={settings} onRefresh={fetchAllData} getAuthHeader={getAuthHeader} language={language} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
